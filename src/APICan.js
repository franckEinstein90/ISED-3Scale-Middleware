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
const winston 	= require('winston')
/*****************************************************************************/
const APICanData  = require('@src/APICanData').APICanData
const appDatabase = require('@server/db').appDatabase

/*****************************************************************************/

const newAppLogger = function(fileName){
	return winston.createLogger({
		level		: 'info', 
    	format		: winston.format.simple(), 
    	transports	: [
        	new winston.transports.Console()
        ]
	})
	
}

const APICan = function({
	root, 
	database
	}){

	let _appLogger = newAppLogger('info.log')	
	let _appStatus = require('@src/appStatus').appStatus(APICanData)
	_appLogger.info('initializing APICan')

	return new Promise((resolve, reject) =>{
		appDatabase.configure({
			filePath: database
		})
		.then( dbStatus => {
			_appLogger.info(`database access = ${dbStatus}`)
			resolve ({
				data			: APICanData, 
				appDatabase		: dbStatus,
				keycloakAccess	: false, 
				say				: msg => _appLogger.info(msg), 
				run				: () => {
				  	_appLogger.info('booting app')
				}
			})
		})
	})
}


module.exports = {
	APICan
}
