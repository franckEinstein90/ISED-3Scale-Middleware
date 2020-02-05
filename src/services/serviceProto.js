/*******************************************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * Application APICan
 * -------------------------------------
 *  serviceProto.js : prototype class for service class
 *
 ******************************************************************************/

"use strict"

/*****************************************************************************/
const validator = require('validator')
/*****************************************************************************/
const errors = require('@errors').errors
const alwaysResolve = require('@utils/alwaysResolve').alwaysResolve
/*****************************************************************************/

class ServiceProto {
    constructor({
        id, 
	serviceProvider
    }) {
        this.id = id
        this.serviceProvider = serviceProvider
    }
}




module.exports = {
    ServiceProto
}
