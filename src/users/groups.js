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
const db                = require('@server/db').appDatabase
const tenantsManager    = require('@tenants/tenantsManager').tenantsManager
const users             = require('@users/users').users
const messages          = require('@server/messages').messages
/*****************************************************************************/

const getGroupMembers = function({
    filters, 
    emailPattern, 
    tenantDomain
}){
    return Promise.all( tenantDomain.map( tenantName => {
        let t = tenantsManager.getTenantByName(tenantName)
        if(typeof t !== 'undefined'){
            if(filters.includes("providerAccount")){
                return t.getProviderAccountUserList()
            } else{
                return null
            }
        }
    })) 
}

class UserGroup {
    constructor({
        id, 
        name, 
        description, 
        emailPattern
    }){
        this.id             = id
        this.name           = name
        this.description    = description
        this.emailPattern   = emailPattern
        this.tenants        = []
    }

    addTenantAssociation(tenantName){
        this.tenants.push(tenantName)
    }

}
const groups = (function() {

    let _groups = new Map()
    let _groupNames = []
    let _getGroupDefinitions = function() {
        //gets the groups definitions and properties from database
        return new Promise((resolve, reject) => {
            db.getAllTableRows({
                table: 'groups', 
                where: null
            })
            .then( groupData => {
               resolve( groupData ) 
            })
        })
    }
    let _getGroupTenants = function( groupArray ){
        let ids = groupArray.map( group => `[group] = ${group.ID}`).join(' OR ')
        return new Promise((resolve, reject) => {
            db.getAllTableRows({
                table: 'lnkGroupsTenants',  
                where: ids
            })
        .then( groupData => {
            resolve(groupData)
            })
        })
    }
    let _getGroupUserProperties = function ( groupIdArray ) {
        return new Promise((resolve, reject) => {

        })
    }
    return {

        configure: function( app ) {
            //get group information and store in _groups and _groupNames
            _getGroupDefinitions()
            .then( groups => {              //get group info from database
                groups.forEach( group => {
                    app.say(`Getting group data for ${group.name}`)
                    _groups.set(group.ID, new UserGroup({
                            id          : group.ID, 
                            name        : group.name, 
                            description : group.Description, 
                            emailPattern: group.emailPattern
                        }))

                    _groupNames.push({
                            name: group.name,
                            ID: group.ID
                        })
                    })
                    return _groupNames
            })
            .then( groupArray => {
                return _getGroupTenants(groupArray)
            })
            .then( groupTenants => {
                groupTenants.forEach(tenantGroup => {
                    let groupID     = tenantGroup.group
                    let tenantName  = tenantGroup.tenant
                    if ( _groups.has( groupID )) {
                            (_groups.get( groupID )).addTenantAssociation( tenantName )
                        }
                    })
                return Promise.all(_groupNames.map(group => _getGroupUserProperties(group.ID)))
            })
            .then(groupProperties => {
                    groupProperties.forEach(propertySet => {
                        if (_groups.has(propertySet.groupID)) {
                            (_groups.get(propertySet.groupID)).properties = propertySet.data.map(x => x.property)
                        }
                    })
            })
        },
        getGroupList: function(){
            let list = []
            return _groupNames
        },
        definedGroups: _ => _groupNames, //returns array of group names and id 
        newGroup: function({ //creates a new group
            groupName,
            groupUserProperties,
            groupDescription,
            groupTenants,
            groupEmailPattern
        }) {
            return new Promise((resolve, reject) => {
                db.newUserGroup({
                        groupName,
                        groupDescription,
                        groupEmailPattern
                    })
                    .then(result => {
                        return db.getGroupID(groupName)
                    })
                    .then(groupID => {
                        return db.setGroupTenants(groupID, groupTenants)
                    })
                    .then(groupID => {
                        db.setGroupProperties(groupID, groupUserProperties)
                        return groupID
                    })
                    .then(groupID =>{
                        _groups.set(groupID, {
                            name: groupName,
                            description: groupDescription, 
                            emailPattern: groupEmailPattern,  
                            properties: groupUserProperties, 
                            tenants:groupTenants
                        })
                        _groupNames.push({
                            name: groupName, 
                            ID: groupID
                        })
                        return resolve(groupID)
                    })
                    .catch(error => {
						reject(error)
					})
            })
        },
        deleteGroup: async function(groupName) {
            let groupIDX = _groupNames.findIndex(group => group.name === groupName)
            if(groupIDX > -1 ) {
                   return db.deleteUserGroup({
                        groupID: (_groupNames[groupIDX]).ID, 
                        groupName
                    })
                    .then( opResult => {
                        if( opResult === 'ok'){
                            _groups.delete( _groupNames[groupIDX].ID)
                            _groupNames.splice(groupIDX, 1)
                        }
                    })
                    .then( x => 200)
            }
        }, 
        getGroupUserAccounts: function(groupName){
            //returns the list of user accounts that 
            //belong to this group
            let groupID = (_groupNames.find(group => group.name === groupName)).ID
            let group = _groups.get(groupID)
            let userAccounts = []
            return getGroupMembers({
                filters: group.properties, 
                tenantDomain: group.tenants,
                emailPattern: group.emailPattern
            })
            .then(tenantGroups=> {
                if (tenantGroups.length === 0) {
                    messages.emitRefreshBottomStatusBar(`no users were found for this request`)
                } 
                tenantGroups = tenantGroups.filter(tenant => typeof tenant !== 'undefined')
                tenantGroups.forEach(tenantGroup=>{
                    tenantGroup.forEach(u =>{
                        let userInfo = u.user
                        if(userAccounts.findIndex( user => user.email === userInfo.email ) < 0){
                            userAccounts.push(userInfo)
                        }
                    })
                    messages.emitRefreshBottomStatusBar(`${userAccounts.length} users match criteria`)
                })
                if(group.emailPattern.length > 0){
                    //filter by email pattern
                    let emailFilter = new RegExp(group.emailPattern)
                    userAccounts = userAccounts.filter(user => emailFilter.test(user.email))
                }
                return 'ok'
            })
            .then( _ =>{
                if(userAccounts.length === 0){
                    return []
                }
                if( group.properties.includes('keyCloakAccount') ){
                    messages.emitRefreshBottomStatusBar(`Getting ${userAccounts.length} keycloak accounts`)
                    let keyCloakProfiles = userAccounts.map( user => users.getUserList(user.email))
                    return Promise.all(keyCloakProfiles) 
                }
            })
            .then(userList =>{
                if(userList.length === 0){
                    return userAccounts
                }
                userList.forEach(kclkAccount => {
                    let account = userAccounts.find( user => user.email === kclkAccount.email)
                    if(typeof account !== 'undefined'){
                        account.keyCloakAccount = kclkAccount
                    }
                })
                return userAccounts
            })
        }
    }
})()

module.exports = {
    groups
}