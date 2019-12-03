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

const users = (function(){
    let keyCloakAccessToken = null

    return {

        getKeyCloakCredentials: function(){

            let username = config.get('username')
            let password = config.get('password')
        
            request.post('https://sso-dev.ised-isde.canada.ca/auth/realms/gcapi/protocol/openid-connect/token', 
                { form: {username, password, client_id:'admin-cli', grant_type:"password" }}, 
                    function(err, httpResponse, body){
                        if (validator.isJSON(body)){
                            keyCloakAccessToken = JSON.parse(body)
                        }
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