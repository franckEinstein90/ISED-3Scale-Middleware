/*******************************************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * 
 * Application APICan - created 2019, last updated Feb 2020
 * -----------------------------------------------------------------------------
 *  APICan  
 *
 *  Initializes APICan app internals 
 *
 ******************************************************************************/
"use strict"

/*****************************************************************************/
const winston = require('winston')
/*****************************************************************************/
const appDatabase = require('@server/db').appDatabase
const tenantsManager = require('@tenants/tenantsManager').tenantsManager
const errors = require('@src/errors').errors
/*****************************************************************************/

let correctFetchErrors = (tenantsUpdateReport) => {
    let tenantUpdateErrors = [] //ist of tenants for which there was an error during the update
    tenantsUpdateReport.forEach(tenantReport => {
        if (tenantReport.updateOk()) {
            return errors.codes.Ok
        } else {
            console.log(`There was an error updating ${tenantReport.tenantName}, recovering`)
            tenantUpdateErrors.push(tenantReport.tenantName)
        }
    })
    if (tenantUpdateErrors.length > 0) {
        return tenantsManager.updateTenantInformation(tenantUpdateErrors)
            .then(correctFetchErrors)
    }
}


const newAppLogger = function(fileName){
	return winston.createLogger({
		level		: 'info', 
    		format		: winston.format.simple(), 
    		transports	: [
        		new winston.transports.Console()
        	]
	})
}

const APICanConfig = function( appSkeleton ) {

    let _appLogger  = newAppLogger('info.log')
    let _versionTag = app => `v-${app.version.major}:${app.version.minor}:${app.version.patch}`
    _appLogger.info('initializing APICan')

    return new Promise((resolve, reject) => {

        appDatabase.configure({
                filePath: appSkeleton.settingsDB
            })
            .then(dbStatus => {

                _appLogger.info(`database access = ${dbStatus}`)
		        appSkeleton.state 		= 'initializing'
		        appSkeleton.features.dbStatus	= dbStatus
		        appSkeleton.say	= msg => {
			        console.log( msg )
			        _appLogger.info(msg)
		        }
                return resolve( appSkeleton )
	    })
    })
}
                   /* 
                    run: (apiCan) => {
                        apiCan.say(`apiCan ${apiCan.versioning ? apiCan.versionTag : ""} booting`)
                        tenantsManager.updateTenantInformation()
                            .then(updateReport => {
                                return correctFetchErrors(updateReport)
                            })
                            .then(_ => {
                                if (apiCan.clock) apiCan.clock.start()
                                apiCan.state = "running"
                            })



module.exports = {
    APICanConfig
}*/
