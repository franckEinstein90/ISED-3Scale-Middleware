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
const appStatus         = require('@server/routes/appStatus').appStatus
const path              = require('path')
const clock             = require('@src/cron/timer').clock
/*****************************************************************************/
let run = (apiCan) => {
    apiCan.say('*********************************')
    apiCan.say(`apiCan ${apiCan.features.versioning ? apiCan.versionTag : ""} booting`)
    tenantsManager.updateTenantInformation()
        /*.then(updateReport => {
            return correctFetchErrors(updateReport)
        })*/
    .then(_ => {
        if (apiCan.clock) apiCan.clock.start()
            apiCan.state = "running"
    })
}

const APICan = {    //this is the app
    faviconPath     : __dirname + '/public/LOGO139x139.png', 
    process         : {
        id : process.pid
    },  
    root            : __dirname, 
    settingsDB      : 'settings.db', 
    stats           : {}, 
    staticFolder    : path.join(__dirname, 'public'),
    data            : require('@src/APICanData').APICanData, 
    expressStack    : require('express')(), 
    features        : {
        userManagement  : false, 
        messages        : false,
        processStats    : false,  
        keycloakAccess  : false, 
        security        : false, 
        versioning      : false
    }
}
require('@server/expressStack').expressConfig( APICan )
require('@src/process/stats').APICanStats( APICan )
require('@src/APICan').APICanConfig( APICan )
.then( APICan => {	//versionning support
	return require('@src/APICanVersion').APICanVersion( APICan )
})
.then( apiCan => {  //process information support
    return tenantsManager.configure( apiCan )
})
.then( apiCan => {
    return users.configure( apiCan)
})
.then( apiCan => {
    return groups.configure(apiCan)
})
.then( apiCan => {
    apiCan.clock = new clock.Clock( {
        events: [], 
        cout: apiCan.say
    })
    return apiCan
})
.then( apiCan => { 
    require('@server/routingSystem').routingSystem( apiCan )
    appStatus.configure(apiCan)
    let server = require('@server/httpServer').httpServer( apiCan ) 
    let io = require('socket.io')(server)
    let messages = require('@server/messages').messages
    messages.init(io)
    run(apiCan)
})

