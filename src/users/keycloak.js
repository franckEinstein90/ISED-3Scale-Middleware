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


const keycloakInterface = function( app ) {
    _keycloakCredentials = app.data.keycloakCredentials
    return new Promise( resolve =>{
        return resolve(app)
    })
}


const addKeycloakInterface = function( app ){
    return keycloakInterface(app) 
    .then( kcinterface => {
        debugger
        return app
    })
        
}

module.exports = {
  addKeycloakInterface 
}
