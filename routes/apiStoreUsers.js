/*******************************************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware - 2020
 *
 * Application APICan
 * -------------------------------------
 *  userRoutes.js 
 *
 ******************************************************************************/

"use strict"

/*****************************************************************************/


const tenantsManager = require('@services/tenantsManager').tenantsManager
const messages = require('@server/messages').messages
const appStatus = require('@server/appStatus').appStatus
const users = require('@users/users').users
const userGroups = require('@users/groups').groups
const queryManager = require('@routes/queryManager').queryManager
const accessLog = require('@server/logs').logs.accessLog
const supportRequest = require('@apiStore/supportRequest.js').jiraInterface

const apiStoreUserRoutes =  (function (){

    let userListPromise = function({
        tenantsNames, filter  
        }){
           return Promise.all(tenantsNames.map( tenantName => {
                let t = tenantsManager.getTenantByName(tenantName)
                return filter.providerAccountsFilter? t.getProviderAccountUserList() : t.getAllUsers()
           })) 
        }
    return {
        getUserInfo :  async function(req, res, next) {
            let logMessage, callArgs
            logMessage = {
                message: `userinfo request ${queryManager.requestLogMessage(req)} `
            }
            callArgs = queryManager.validate(req, logMessage)
            accessLog.log('info', logMessage.message)
            res.header("Content-Type", "application/json; charset=utf-8")
            res.send(await tenantsManager.getUserInfo(callArgs))
        }, 

        getApi: async function(req, res, next) {
            let logMessage = {
                message: `api.json request ${queryManager.requestLogMessage(req)}`
            }
            let callArgs = queryManager.validate(req, logMessage)
            accessLog.log('info', logMessage.message)
            res.header("Content-Type", "application/json; charset=utf-8")
            res.send(await tenantsManager.getApiInfo(callArgs))
        }, 
   
        getGroupUsers: async function(req, res, next){
            //returns an array of user accounts
            //meeting the property of the 
            //group passed in as argument
            let groupName = req.query.group
            debugger
        }, 

        findUsers : async function(req, res, next){
            let emailSearchString = req.query.search
            let tenantsNames = req.query.tenants

            let filter = {
                providerAccountsFilter : req.query.userProperties.includes('providerAccount'), 
                hasKeyCloakAccountFilter : req.query.userProperties.includes('keyCloakAccount'),
                otpNotEnabledFilter : req.query.userProperties.includes('otpNotEnabled') 
            }
            return userListPromise({tenantsNames, filter})
            .then(userArrays =>{
                messages.emitRefreshBottomStatusBar(`Obtained ${userArrays.length} groups of users`)
                let returnArray = []
                userArrays.forEach(tenantUsers => 
                    tenantUsers.forEach(user => {
                    if(!returnArray.includes(user.user.email)){
                        returnArray.push(user.user.email)
                    }
                }))
                return returnArray
            })
            .then(userEmails => {
                messages.emitRefreshBottomStatusBar(`Filtering through ${userEmails.length} total users`)
                if( appStatus.keyCloakEnabled() ){
                    let keyCloakProfiles = userEmails.map(email => users.getUserList(email))
                    return Promise.all(keyCloakProfiles)
                }
            }) 
            .then( results => {
                if(filter.hasKeyCloakAccountFilter){
                    results = results.filter(user => ('id' in user))
                    messages.emitRefreshBottomStatusBar(`Filtering through ${results.length} keyCloak accounts`)
                    if(filter.otpNotEnabledFilter){
                        results = results.filter(user => !(user.requiredActions.includes("CONFIGURE_TOTP") || (user.disableableCredentialTypes.includes('otp'))))
                    }
                }
                res.send(results)
                messages.emitRefreshBottomStatusBar(`Matched ${results.length} users`)
            })
        }, 
       
        postJiraRequest: async function(req, res, next){
            let sanitize = function(fieldValue){
                let sanitized = fieldValue.replace(/[^a-zA-Z0-9(),/.@'\-?" ]/g, " ")
                sanitized = sanitized.replace(/"/g, "'")
                return sanitized
            }
	        //creates a jira support ticket for the api store
            res.header("Content-Type", "application/json; charset=utf-8")
            
            let summary = sanitize(req.body.summary || "no summary")
            let description = sanitize(req.body.description || "no description")
            let user = sanitize(req.body.user || "no user name")
            let email = sanitize(req.body.email || "no email")

            supportRequest.createSupportRequest({
                summary, 
                description, 
                user, 
                email})
                
            .then(response => {
                let answerBody = JSON.parse(response.body)
                res.send( JSON.stringify({
                    status: 'success', 
                    issueID:answerBody.id, 
                    key: answerBody.key, 
                    link:answerBody.self
                    }) )
            })
        }, 

        postEnforceOTP: async function(req, res, next){
            let userEmails = req.body.userEmailList
            let enforceOTP = userEmails.map(email => users.enforceTwoFactorAuthentication(email))
            Promise.all(enforceOTP)
            .then(res.send('done'))
        }

       
     
    }
})()




module.exports = {
    apiStoreUserRoutes
}
