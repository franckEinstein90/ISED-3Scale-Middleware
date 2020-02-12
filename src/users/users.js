/***********************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * December 2019, for ISED 
 * -------------------------------------
 *  Module users.js
 *
 *  class definition and implementation for users 
 **********************************************************/
"use strict"

/**********************************************************/
const request 		= require('request')
const validator 	= require('validator')
/**********************************************************/
const jiraInterface = require('@apiStore/supportRequest.js').jiraInterface
/**********************************************************/


const users = (function() {

    let _keycloakCredentials = null
    let _keycloakTest = function(testUserName){
        return new Promise((resolve, reject) =>{
            users.getUserList(  testUserName )
            .then (testResult =>{
                return resolve(testResult.found)
            })
        })
    }

    return {

        configure: function( app ) {

            jiraInterface.configure( app.data.jiraAuthCredentials )
            _keycloakCredentials = app.data.keycloakCredentials

            return new Promise((resolve, reject) =>{
            //test to see if we can access keycloak user data
            //by searching for the api store email 
            _keycloakTest( app.data.apiStoreUserName )
            .then(testResult => {
                app.say(`keycloak access = ${testResult}`)
                app.features.keycloakAccess = testResult 
                return resolve(app)
                })
            })
        },

        getKeyCloakCredentials: function() {
			let ssoHostUrl              = _keycloakCredentials.keycloakURL
			let keyCloakClientId        = _keycloakCredentials.keycloakClient
            let keyCloakClientSecret    = _keycloakCredentials.keycloakSecret
            
            return new Promise((resolve, reject) => {
                let options = {
                    url: `${ssoHostUrl}/auth/realms/gcapi/protocol/openid-connect/token`,
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Authorization": `Basic ${new Buffer(keyCloakClientId + ':' + keyCloakClientSecret).toString('base64')}`,
                        "User-Agent": "ISED API Store Middleware",
                        "Accept": "*/*",
                        "Cache-Control": "no-cache",
                        "Accept-Encoding": "gzip, deflate",
                        "Connection": "keep-alive",
                        "cache-control": "no-cache"
                    },
                    form: {
                        "grant_type": "client_credentials"
                    }
                }

                request.post(options, function(err, httpResponse, body) {
                    if (err) return resolve(err)
                    if (httpResponse.statusCode === 200) {
                        if (validator.isJSON(body)) {
                            return resolve(JSON.parse(body))
                        }
                        return resolve("Invalid JSON")
                    }
                    return resolve('bad response')
                })
            })
        },

        getUserList: function(searchString) {

            return users.getKeyCloakCredentials()
                .then(function(token) {
                    return (users.getUserProfile(token, searchString))
                })
                .then( userList => {
                    let returnValue = {
                        search  : searchString, 
                        found   : false, 
                        results : []
                    }
                    if(! Array.isArray( userList) ) return returnValue
                    if(userList.length === 0) return returnValue
                    returnValue.found   = true
                    returnValue.results = userList
                    return returnValue
                })
        },

        enforceTwoFactorAuthentication: function(email) {
            //given an email address, enforces 2-factor authenication for that user
            let authToken = null

            return new Promise((resolve, reject) => {
                users.getKeyCloakCredentials()
                    .then(token => {
                        authToken = token
                        return users.getUserProfile(token, email)
                    })
                    .then(userProfile => {
                        return users.enforceOTP(authToken, userProfile[0])
                    })
            })
        },

        getUserProfile: function(token, email) {
            let url = `${_keycloakCredentials.keycloakURL}/auth/admin/realms/gcapi/users?email=${encodeURIComponent(email)}`
            let options = {
                url,
                headers: {
                    'Authorization': `Bearer ${token.access_token}`
                }
            }

            return new Promise((resolve, reject) => {
                request.get(options, function(error, response, body) {
                    if (error) return resolve(error)
                    if (validator.isJSON(body)) {
                        resolve(JSON.parse(body))
                    }
                    return resolve('invalid json response')
                })
            })
        },

        enforceOTP: function(token, userProfile) {
            if (userProfile.disableableCredentialTypes.includes('otp') || userProfile.requiredActions.includes('CONFIGURE_TOTP')) return
            userProfile.requiredActions.push('CONFIGURE_TOTP')
            return (users.updateUserProfile(token, userProfile))
        },

        updateUserProfile: function(token, userProfile) {
            let url = `https://sso-dev.ised-isde.canada.ca/auth/admin/realms/gcapi/users/${encodeURIComponent(userProfile.id)}`
            let options = {
                url,
                headers: {
                    'Authorization': `Bearer ${token.access_token}`,
                    'content-type': 'application/json'
                },
                body: JSON.stringify(userProfile)
            }

            return new Promise((resolve, reject) => {
                request.put(options, function(error, response, body) {
                    debugger
                })
            })
        },

        User: class {
            constructor() {

            }
        }
    }
})()

module.exports = {
    users
}
