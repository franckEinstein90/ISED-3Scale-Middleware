#!/usr/bin/env node

/*******************************************************************************
 * Franck Binard, ISED - 2020
 * FranckEinstein90 - franck.binard@canada.ca
 * Prototype Code - Canadian Gov. API Store middleware
 * Used for demos, new features, experiments
 * 
 * Production application code at: https://github.com/ised-isde-canada/apican
 * 
 * Application APICan
 * -------------------------------------
 *  app.js : entry point
 *
 *  Server setup
 ******************************************************************************/
"use strict"
/*****************************************************************************/
require('module-alias/register')
/*****************************************************************************/
const tenantsManager    = require('@tenants/tenantsManager').tenantsManager
const users             = require('@users/users').users
const groups            = require('@users/groups').groups
/*****************************************************************************/

require('@src/APICan').APICan({
    root    : __dirname, 
    database: 'settings.db'
})
.then( app => {
    return tenantsManager.configure( app )
})
.then( app => {
    return users.configure( app )
})
.then( app =>{
   return groups.configure( app ) 
})

/************************** 
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


const scheduler = require('@src/cron/timer.js').scheduler
const appEvents = require('@server/appEvents').appEvents

let setTimerRefresh = function() {
    let id = appEvents.configureTenantRefresh(10)    //every 1 minutes
    appEvents.configureOTPEnforce(100)
    appStatus.configure({
        tenantRefreshEventID: id
    })
    scheduler.start()
    appStatus.run() //the app is ready to answer requests
    messages.emitRefreshFront()
    return 1
}




const services  = require('@services/services').services
const groups    = require('@users/groups').groups

db.configure({
        filePath: './settings.db'
    }) //access the database
    .then( APICan.configure) //configure the application engine
    .then( users.onReady)
    .then( groups.onReady)
    .then( services.ready )
    .then(initMessage => {
        console.log(initMessage)
        return appStatus.enableKeyCloak()
    })
    .then(initMessage => {
        console.log(initMessage)
        return tenantsManager.configure()
    })
    .then(initMessage =>{
        console.log(initMessage)
        return tenantsManager.updateTenantInformation()
    })
    .then(correctFetchErrors)
    .then(setTimerRefresh)

const memoryStore = new session.MemoryStore()
//const keycloak = new Keycloak({store: memoryStore })

//express app stack setup
const app = require('@server/expressStack').expressStack({
    root: __dirname,
    staticFolder: path.join(__dirname, 'public'),
    faviconPath: __dirname + '/public/LOGO139x139.png'
})

app.use(session({
    secret: 'fdafdsajfndas',
    resave: false,
    saveUninitialized: true,
    store: memoryStore
}))
//app.use(keycloak.middleware())
app.use(logger('dev'));

const routingSystem = require('@server/routingSystem').routingSystem({
    app
})

const server = require('@server/httpServer').httpServer({
    app,
    defaultPort: '3000'
})

const io = require('socket.io')(server.server())
const messages = require('@server/messages').messages
messages.init(io)
*/