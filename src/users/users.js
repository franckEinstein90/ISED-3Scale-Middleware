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

    let keyCloakAccessToken = null
    let ssoHostUrl =  null

    return {

        onReady: function(){
            ssoHostUrl =    
                ['https://sso', appVariables.env === "dev"?"-dev":"", 
                '.ised-isde.canada.ca'].join('')
        }, 
        
        getKeyCloakCredentials: function(adminUserName, adminPassword){

            let username = adminUserName 
            let password = adminPassword 
            return new Promise((resolve, reject) => {

                request.post('https://sso-dev.ised-isde.canada.ca/auth/realms/gcapi/protocol/openid-connect/token', 
                    { form: {username, password, client_id:'admin-cli', grant_type:"password" }}, 
                        function(err, httpResponse, body){
                            if(err) return resolve(err)

                            if (validator.isJSON(body)){
                                resolve(JSON.parse(body))
                            }

                            return resolve("Invalid JSON")
                    })
            })
        }, 

        getUserList: function(authCredential){
            console.log(authCredential)
            return new Promise((resolve, reject) => {

                request.get('https://sso-dev.ised-isde.canada.ca/auth/admin/realms/gcapi/users')

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
