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
const request 	= require('request')
const validator = require('validator')
const config    = require('config')
/**********************************************************/

const getKeyCloakCredentials  = function( credentials ) {
    let options = {
        url: `${credentials.keycloakURL}protocol/openid-connect/token`,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Basic ${new Buffer(credentials.keycloakClient + ':' + credentials.keycloakSecret).toString('base64')}`,
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
    return new Promise((resolve, reject) => {
        request.post(options, function(err, httpResponse, body) {
            if (err) return resolve(err)
            let bodyObject = JSON.parse(body)
            if('error' in bodyObject) {
                return resolve( bodyObject.error )
            }
            if (httpResponse.statusCode === 200) {
                if (validator.isJSON(body)) {
                    return resolve(JSON.parse(body))
                }
                return resolve("Invalid JSON")
            }
            return resolve('bad response')
        })
    })
}
const keycloakInterface = function( credentials, app ) {
    let keyEditKey = getKeyCloakCredentials(credentials)
    .then( credentials =>{
        return app
    })
}

const envKeycloakCredentials = function(env) {
    return {
        keycloakURL: config.get('keycloakURL'),
        keycloakClient: config.get('keycloakClient'),
        keycloakSecret: config.get('keycloakSecret')
    }
}


const addKeycloakInterface = function( app ){

    let keycloakCredentials = envKeycloakCredentials()
    return keycloakInterface(keycloakCredentials, app) 
    .then( kcinterface => {
        debugger
        return app
    })
        
}

module.exports = {
  addKeycloakInterface 
}
