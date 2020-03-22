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

    

    app.userGroups.deleteUserGroup  = groupID =>{
        return app.localDb.removeFromTable({
            table: 'groups', 
            where: `ID = ${groupID}`
        })
    }
}

const configureUserGroupRouter = function (app ){

    let groupRouter = require('express').Router()
    groupRouter.get('/', app.userGroups.getGroupsInfo)
    groupRouter.post('/', require('@users/groups/newGroup').createOrEditGroup(app))
    groupRouter.get('/users', require('@users/groups/groupMembers').getGroupMembers(app))
    groupRouter.delete('/', (req, res, next)=>{
        let groupID = req.body.id
        return app.userGroups.deleteUserGroup(groupID)
        .then(_ => {
            res.send({ok: 1})
        })
    })
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