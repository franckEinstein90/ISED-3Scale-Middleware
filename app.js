/*******************************************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * -------------------------------------
 *  app.js
 *
 *  Server setup
 ******************************************************************************/
"use strict"


const features = {
   testGetUser: 1
} 
 
const errors = require('@src/errors').errors

//initiate winston logger
const winston = require('winston')
const appLogger = winston.createLogger({
    format: winston.format.json(),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({
            filename: 'info.log'
        })
    ]
});

const createError = require('http-errors')

const Keycloak = require('keycloak-connect')
const express = require('express')
const session = require('express-session')

const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const config = require('config')



const utils = require('@src/utils.js').utils
const tenantsManager = require('@services/tenantsManager').tenantsManager

const cronJob = require('node-cron')
const timer = require('@src/cron/timer.js').cacheManage

const messages = require('@server/messages').messages
const statusCodes = require('@server/appStatus').statusCodes
const appStatus = require('@server/appStatus').appStatus
const appVariables = require('@server/appStatus').appVariables

const users = require('@storeUsers').users

let initISEDMiddleWare = async function() {
    appLogger.log('info', 'Initializing application')
    //test : users.enforceTwoFactorAuthentication('neuronfac@gmail.com')
    let JSONAppData = config.get('master')
    if( JSONAppData && typeof JSONAppData === 'object'){
        appVariables.env = JSONAppData.env
        users.onReady()
        .then(x => {
            if(x) appStatus.enableKeyCloak()
        }) 
    }
    else {
        throw "bad configuration file"
    }
	
    //function to detect and correct api errors
    let correctFetchErrors =  (tenantsUpdateReport) => {
        let tenantUpdateErrors = [] //ist of tenants for which there was an error during the update
		tenantsUpdateReport.forEach (

			tenantReport => {
				if ( tenantReport.updateOk() ){
                    return errors.codes.Ok
				}
				else{
                    console.log(`There was an error updating ${tenantReport.tenantName}, recovering`)
                    tenantUpdateErrors.push(tenantReport.tenantName)
                }
            })
            if (tenantUpdateErrors.length > 0){
                return tenantsManager.updateTenantInformation(tenantUpdateErrors)
                .then(correctFetchErrors)
            }
	}

    let setTimerRefresh = function(){
        appStatus.run() //the app is ready to answer requests
        messages.emitRefreshFront()

        console.log('*******************************************')
        console.log('App is running and ready to receive requests')
        console.log('*******************************************')

        timer.setRefreshTime(5) //refresh information every 5 minutes
        cronJob.schedule('* * * * *', timer.cronUpdate)
        return 1
    }

    tenantsManager.onReady(JSONAppData)
    //initial data fetching on loading
    tenantsManager.updateTenantInformation()
        .then(correctFetchErrors)
        .then(setTimerRefresh)

}

let initAppFeatures = function(){
    initISEDMiddleWare()
}

initAppFeatures()

const app = express()
const viewSystem = require('@server/views/viewSystem.js').viewSystem
const memoryStore = new session.MemoryStore()
//const keycloak = new Keycloak({store: memoryStore })

let startServer = async function() {

    viewSystem.configure({app, root: __dirname})
	app.use(session({
		 secret: 'fdafdsajfndas', 
		 resave: false, 
		 saveUninitialized: true, 
		 store: memoryStore
	 }))
	//app.use(keycloak.middleware())
    app.use(logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded({
        extended: false
    }));
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, 'public')));
}

const routingSystem = require('@server/routingSystem').routingSystem
startServer()
routingSystem.configure({app})


module.exports = app;
