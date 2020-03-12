/*******************************************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * -------------------------------------
 *  /server/users/groups.js
 *
 * User Group Structure 
 ******************************************************************************/
"use strict"
/*****************************************************************************/
const _ = require('underscore')
/*****************************************************************************/


const _getGroupTenants = function( _db, groupArray ){
    let ids = groupArray.map( group => `[group] = ${group.ID}`).join(' OR ')
    return new Promise((resolve, reject) => {
        _db.getAllTableRows({
            table: 'lnkGroupsTenants',  
            where: ids
        })
        .then( groupData => resolve(groupData) )
    })
}

const _getGroupMembers = function( group ){

    return Promise.all( group.tenants.map( tenantName => {
        let t = tenantsManager.getTenantByName(tenantName)
    }))
}

const groups = function(db, gr){
    let _db = db
    let _groups = new Map()
    gr.forEach( group => {
        _groups.set(group.ID, new UserGroup({
            id              : group.ID, 
            name            : group.name, 
            description     : group.Description, 
            emailPattern    : group.emailPattern
        }))
    })
    let _newUserGroup = function(groupInfo){
        debugger
    }
    
    return {
        get groupNames() {
            let grNames = []
            _groups.forEach((group, groupID)=>{
                grNames.push({
                    name: group.name, 
                    ID: group.ID
                })
            })
        }, 

        postNewUserGroup    : function( groupInfo ) {
            debugger
        }, 

        getGroupTenants : function(){
            let groupIDs = []
            _groups.forEach((_, id) => groupIDs.push( `[group] = ${id}`))
            return new Promise((resolve, reject) => {
                _db.getAllTableRows({
                    table: 'lnkGroupsTenants', 
                    where: groupIDs.join( ' OR ')
                })
                .then( groupsData => {
                    groupsData.forEach(groupDataRow => {
                        let groupID = groupDataRow.group
                        let tenant  = groupDataRow.tenant
                        if( _groups.has( groupID )){
                            (_groups.get( groupID )).addTenantAssociation( tenant )
                        }
                    })
                    return resolve(groupsData)
                })
            })
        }, 

        getGroupList: function(){
            //returns a list of groupName x id
            let list = []
            _groups.forEach((group, id) => {
                list.push({
                    name: group.name, 
                    ID: id
                })
            })
            return list 
        },

        getGroupUserAccountInfo: function( groupID ){

            let group = _groups.get(Number(groupID))
            let userAccounts = []
            return _getGroupMembers( group )
            .then( tenantGroups=> {
                debugger
            })
        }, 
    }
}

const addComponentMethods = function( app ){

    app.userGroups.groups = new Map()
    
    app.userGroups.addFeature({
        label: 'getGroupDefinitions', 
        description: 'Gets group list from local database', 
        method: x => require('@users/dbConnection').getGroupDefinitions( app.localDb )
    })

    let getCompleteGroupDefinition = require("@users/dbConnection").getCompleteGroupDefinition
    app.userGroups.addFeature({
        label: 'getCompleteGroupDefinition', 
        description: 'Gets the complete group definition', 
        method: id => getCompleteGroupDefinition(id, app.localDb) 
    })

    app.userGroups.getGroupsInfo = (req, res, next)=>{
        if('query' in req && 'id' in req.query){ //return a complete groupDefinition
            return app.userGroups.getCompleteGroupDefinition(req.query.id, app.localDb)
            .then( result => {
                    result.tenants = _.intersection(
                        result.tenants, 
                        app.tenants.list.map(tenant => tenant.name))
                    res.send(result)
            })
        }
        return app.userGroups.getGroupDefinitions()
        .then( result => res.send(result) )
    }    

    app.userGroups.createNewGroup = (req, res, next)=>{
        let selectedTenants = req.body['selectedTenants[]']
        if(!Array.isArray(selectedTenants)) selectedTenants = [selectedTenants]
        app.localDb.insertInTable({
            table: 'groups', 
            values: {
                Description: req.body.Description, 
                emailPattern: req.body.emailPattern, 
                name: req.body.name  
            }
        })
        .then( groupID => {
            let tenantAssociationUpdates = selectedTenants.map(tenant => {
                app.localDb.insertInTable({
                    table: 'lnkGroupsTenants', 
                    values: {
                        group: groupID, 
                        tenant
                    }
                })
            })
            return Promise.all( tenantAssociationUpdates )
        })
        .then( _ =>{ 
           res.send( { status: 'OK'} )
        })
    }

    app.userGroups.getGroupUsers = (req, res, next)=>{
        
        let groupID = req.query.group
        let userStore = new Map()
        app.localDb.getAllTableRows({
            table: 'lnkGroupsTenants', 
            where: `[group] = ${groupID}`
        })
        .then( result => {
            let tenantNames = _.intersection(
                    result.map(t => t.tenant), 
                    app.tenants.list.map(t => t.name))
            let tenantDomain = tenantNames.map(tName => app.tenants.register.get(tName))
            return Promise.all(tenantDomain.map(t => t.getUsers(userStore))) 
        })
        .then( _ => {
            let resultArray = []
            userStore.forEach(user => resultArray.push(user))
            res.send(resultArray)
        })
    }

    app.userGroups.deleteUserGroup  = (req, res, next)=>{
        let groupID = req.body.id
        app.localDb.removeFromTable({
            table: 'groups', 
            where: `ID = ${groupID}`
        })
        .then( result => {
            res.send('Ok')
        })
    }
    app.userGroups.editGroup = (req, res, next)=>{
       debugger 
    }

}

const configureUserGroupRouter = function (app ){

    let groupRouter = require('express').Router()
    groupRouter.get('/', app.userGroups.getGroupsInfo)
    groupRouter.post('/', app.userGroups.createNewGroup)
    groupRouter.get('/users', app.userGroups.getGroupUsers)
    groupRouter.delete('/', app.userGroups.deleteUserGroup )
    groupRouter.post('/edit', app.userGroups.editGroup)
    app.userGroups.router = groupRouter

}

const addUserGroupFeature = function( app ){

    app.addComponent({
        label: 'userGroups'
    })
    addComponentMethods(app)
    configureUserGroupRouter( app )
    return app 
}


module.exports = {
    addUserGroupFeature 
}