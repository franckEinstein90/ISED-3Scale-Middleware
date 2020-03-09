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

//getGroupList = async function(req, res, next) {
 //   debugger
/*    console.log(_app)
    //returns list of defined user groups
    let groupList = _app.userGroups.getGroupList()
    res.send( groupList )*/

/*



postNewUserGroup =  async function(req, res, next) {
    let groupName = req.body.name
    let groupDescription = req.body.groupDescription
    let groupUserProperties = req.body['userProperties[]']
    let groupTenants = req.body['tenants[]']
    let groupEmailPattern = req.body.groupEmailPattern
    _app.userGroups.postNewUserGroup({
            groupName,
            groupDescription,
            groupUserProperties,
            groupTenants,
            groupEmailPattern
        })
        .then(groupID => {
            res.send(200)
        })
}*/

/*const userGroupRoutes = function( app ) {

    let _app = app

    return {

      
        getGroupUsers: async function(req, res, next) {
            //returns an array of user accounts
            //meeting the property of the 
            //group passed in as argument
            let groupID = req.query.group
            _app.userGroups.getGroupUserAccountInfo(groupID)
                .then(userAccounts => {
                    res.send(userAccounts)
                })
        },

        findUsers: async function(req, res, next) {
            let emailSearchString = req.query.search
            let tenantsNames = req.query.tenants

            let filter = {
                providerAccountsFilter: req.query.userProperties.includes('providerAccount'),
                hasKeyCloakAccountFilter: req.query.userProperties.includes('keyCloakAccount'),
                otpNotEnabledFilter: req.query.userProperties.includes('otpNotEnabled')
            }
            return userListPromise({
                    tenantsNames,
                    filter
                })
                .then(userArrays => {
                    messages.emitRefreshBottomStatusBar(`Obtained ${userArrays.length} groups of users`)
                    let returnArray = []
                    userArrays.forEach(tenantUsers =>
                        tenantUsers.forEach(user => {
                            if (!returnArray.includes(user.user.email)) {
                                returnArray.push(user.user.email)
                            }
                        }))
                    return returnArray
                })
                .then(userEmails => {
                    messages.emitRefreshBottomStatusBar(`Filtering through ${userEmails.length} total users`)
                    if (appStatus.keyCloakEnabled()) {
                        let keyCloakProfiles = userEmails.map(email => users.getUserList(email))
                        return Promise.all(keyCloakProfiles)
                    }
                })
                .then(results => {
                    if (filter.hasKeyCloakAccountFilter) {
                        results = results.filter(user => ('id' in user))
                        messages.emitRefreshBottomStatusBar(`Filtering through ${results.length} keyCloak accounts`)
                        if (filter.otpNotEnabledFilter) {
                            results = results.filter(user => !(user.requiredActions.includes("CONFIGURE_TOTP") || (user.disableableCredentialTypes.includes('otp'))))
                        }
                    }
                    res.send(results)
                    messages.emitRefreshBottomStatusBar(`Matched ${results.length} users`)
                })
        },

      

        deleteUserGroup: async function(req, res, next) {
            let groupName = req.body.groupName
            userGroups.deleteGroup(groupName)
                .then(resCode => {
                    res.send(resCode)
                })
        }
    }
}



const addUserGroupRoutes = function( app ){
    if( 'routes' in app === false ){
        app.routes = {}
    }
    app.routes.groups = userGroupRoutes( app )
    return app
}*/

const addComponentMethods = function( app ){
    app.userGroups.groups = new Map()
    
    app.userGroups.addFeature({
        label: 'getGroupDefinitions', 
        description: 'Gets group list from local database', 
        method: x => _getGroupDefinitions(app.localDb)
    })

    app.userGroups.getGroupsInfo = (req, res, next)=>{
        app.userGroups.getGroupDefinitions()
        .then( groupData => {
            res.send(groupData)
        })
    }
    app.userGroups.createNewGroup = (req, res, next)=>{
        
    }
    app.userGroups.getGroupUsers = (req, res, next)=>{
        
    }
    app.userGroups.deleteUserGroup  = (req, res, next)=>{
        
    }
    app.userGroups.editGroup = (req, res, next)=>{
        
    }

    app.userGroups.getGroupDefinitions()
    .then(definitions => {
        debugger
    })
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