/*******************************************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware - 2020
 *
 * Application APICan
 * -------------------------------------
 *  userGroupRoutes.js 
 *
 ******************************************************************************/
"use strict"

/*****************************************************************************/
const messages      = require('@server/messages').messages
/*const appStatus     = require('@server/appStatus').appStatus
const users         = require('@users/users').users*/
const userGroups    = require('@users/groups').groups
/*****************************************************************************/

const userGroupRoutes = function( app ) {
    let _app = app
    return {

        getGroupList: async function(req, res, next) {
            console.log(_app)
            //returns list of defined user groups
            let groupList = _app.userGroups.getGroupList()
            res.send( groupList )
        },

        getGroupUsers: async function(req, res, next) {
            //returns an array of user accounts
            //meeting the property of the 
            //group passed in as argument
            let groupName = req.query.group
            userGroups.getGroupUserAccounts(groupName)
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

        postNewUserGroup: async function(req, res, next) {
            let groupName = req.body.name
            let groupDescription = req.body.groupDescription
            let groupUserProperties = req.body['userProperties[]']
            let groupTenants = req.body['tenants[]']
            let groupEmailPattern = req.body.groupEmailPattern
            userGroups.newGroup({
                    groupName,
                    groupDescription,
                    groupUserProperties,
                    groupTenants,
                    groupEmailPattern
                })
                .then(groupID => {
                    res.send(200)
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
}
module.exports = {
    addUserGroupRoutes
}