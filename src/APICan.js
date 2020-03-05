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
    _appLogger.info('initializing APICan')

    return new Promise((resolve, reject) => {
        
        let configActions = [
            require('@server/db').addLocalDatabaseFeature( appSkeleton ),
            appSkeleton.stats.refresh()
        ]
        Promise.all(configActions)
        .then( status => {
            _appLogger.info('*****************************')
            _appLogger.info(`pid: ${appSkeleton.process.id} - ppid: ${appSkeleton.process.ppid}`)
            let dbStatus = status[0]
            _appLogger.info(`database access = ${dbStatus}`)
		    appSkeleton.state 	= 'initializing'
		    appSkeleton.addFeature({
                label: 'sqliteDB', 
                state: 'implemented'
            })
		    appSkeleton.say	= msg => {
			    _appLogger.info(msg)
            }
            appSkeleton.addFeature({
                label: 'say', 
                state: 'implemented'
            })
            return resolve( appSkeleton )
	    })
    })
}


module.exports = {
    APICanConfig
}
