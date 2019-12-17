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

const request = require('request')
const validator = require('validator')
const config = require('config')
const appVariables = require('@server/appStatus').appVariables

const users = (function(){

    let keyCloakAdminUserName = null
    let keyCloakAdminPassword = null
    let keyCloakAccessToken = null
    let ssoHostUrl =  null

    return {

        onReady: function(){
            ssoHostUrl =    
                ['https://sso', appVariables.env === "dev"?"-dev":"", 
                '.ised-isde.canada.ca'].join('')
            keyCloakAdminUserName = config.get('keyCloakAdminUsername')
            keyCloakAdminPassword = config.get('keyCloakAdminPassword')
        }, 
        
        getKeyCloakCredentials: function( ){

            return new Promise((resolve, reject) => {

                request.post(`${ssoHostUrl}/auth/realms/gcapi/protocol/openid-connect/token`, 
                    { form: {username:keyCloakAdminUserName, password:keyCloakAdminPassword, client_id:'admin-cli', grant_type:"password" }}, 
                        function(err, httpResponse, body){
                            if(err) return resolve(err)

                            if (validator.isJSON(body)){
                                resolve(JSON.parse(body))
                            }

                            return resolve("Invalid JSON")
                    })
            })
        }, 

        getUserList: function( searchString ){
            
            return users.getKeyCloakCredentials()
                .then(function(token) {
                    return(users.getUserProfile(token, searchString))
                })
		.then(x => {
            if(x.length === 0){ //user not found
                return {email:searchString, notFound:true}
            }
            else if(Array.isArray(x)){
                    return x[0]
                }
            else{
                return {email:searchString, error:true}
            } 
		})
                
            
           /* let url ='https://sso-dev.ised-isde.canada.ca/auth/admin/realms/gcapi/users' 
            let options ={
                url, 
                headers:{
                    'Authorization': `Bearer ${token.access_token}`
                }
            }

            return new Promise((resolve, reject) => {
                request.get(options, function(error, response, body){
                    if ( error ) return resolve( error )
                    if ( validator.isJSON( body ) ){
                        resolve(JSON.parse(body))
                    }
                    return resolve('invalid json response')
                })
           })*/
        }, 

        enforceTwoFactorAuthentication: function( email ){
            //given an email address, enforces 2-factor authenication for that user
            let authToken = null
            let adminUserName = config.get('keyCloakAdminUsername')
            let adminPassword = config.get('keyCloakAdminPassword')
            return new Promise((resolve, reject) =>{
                let keyAuth = users.getKeyCloakCredentials(adminUserName, adminPassword)
                .then(token => {
                    authToken = token
                    return users.getUserProfile(token, email)
                })
                .then(userProfile => {
                    return users.enforceOTP(authToken, userProfile[0])
                })
            })
        },

        getUserProfile: function(token, email){
            let url =`${ssoHostUrl}/auth/admin/realms/gcapi/users?email=${encodeURIComponent(email)}`
            let options ={
                url, 
                headers:{
                    'Authorization': `Bearer ${token.access_token}`
                }
            }

            return new Promise((resolve, reject) => {
                request.get(options, function(error, response, body){
                    if ( error ) return resolve( error )
                    if ( validator.isJSON( body ) ){
                        resolve(JSON.parse(body))
                    }
                    return resolve('invalid json response')
                })
           })
        },

	    enforceOTP: function( token, userProfile ){
           if( userProfile.disableableCredentialTypes.includes('otp') || userProfile.requiredActions.includes('CONFIGURE_TOTP') ) return
           userProfile.requiredActions.push('CONFIGURE_TOTP')
           return(users.updateUserProfile(token, userProfile))
        }, 

    	updateUserProfile: function(token, userProfile){
            let url =`https://sso-dev.ised-isde.canada.ca/auth/admin/realms/gcapi/users/${encodeURIComponent(userProfile.id)}`
            let options ={
                url, 
                headers:{
                   'Authorization': `Bearer ${token.access_token}`, 
                    'content-type': 'application/json' 
                }, 
                body: JSON.stringify(userProfile)
            }

            return new Promise((resolve, reject) => {
                request.put(options, function(error, response, body){
                    //todo check action success
                })
            })
	    },

   User: class {
            constructor(){

            }
        }
    }
})()

module.exports = {
    users
}
