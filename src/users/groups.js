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
const UserGroup         =  require('@clientServerCommon/userGroups').UserGroup
const tenantsManager    = require('@tenants/tenantsManager').tenantsManager
/*****************************************************************************/

const _getGroupDefinitions = function( _db ){
       
    return new Promise((resolve, reject) => { //gets the groups definitions and properties from database
        _db.getAllTableRows({
            table: 'groups', 
            where: null
        })
        .then( groupData => {
           return resolve( groupData ) 
        })
    })
}
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

const groupFeature = function(app) {
    let _db  = app.localDatabase

    return _getGroupDefinitions( _db )
    .then( gr => {              //get group info from database
           app.userGroups =  groups(_db, gr)
           return app
        })
    .then( app => {
        return app.userGroups.getGroupTenants()
    })
}

const addUserGroupFeature = function( app ){
    return groupFeature(app)
    .then( _ => {
        return app 
    })

}

module.exports = {
    addUserGroupFeature 
}