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
const appStatus         = require('@server/routes/appStatus').appStatus
const path              = require('path')
/*****************************************************************************/
let run = (apiCan) => {
    apiCan.say('*********************************')
    apiCan.say(`apiCan ${apiCan.features.versioning ? apiCan.versionTag : ""} booting`)
    tenantsManager.updateTenantInformation()
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
}


require('@clientServerCommon/features').addFeatureSystem( APICan )
APICan.addRequirement(
    {
        req: {   
            label : "userInfo.json", 
            shortDescription : "Answers userInfo.json requests"
        }
    })

require('@server/expressStack').expressConfig( APICan )
require('@src/process/stats').addProcessStatsFeature( APICan )
require('@cron/timer').addRecurringEventsFeature( APICan )
require('@cron/timer').addTimerFeature( APICan )
require('@src/APICan').APICanConfig( APICan )
.then( require('@src/APICanVersion').addVersioningFeature ) //versioning support
.then( apiCan => {                                          //tenant manager configuration
    tenantsManager.configure( apiCan ) 
    if(apiCan.implements('recurring-events')){
        apiCan.addNewEvent( "refresh tenant information", 7, tenantsManager.updateTenantInformation)
    }
    return apiCan
})

.then( apiCan => {
    return users.configure( apiCan)
})

.then( require('@users/groups').addUserGroupFeature )

.then( apiCan => {
    apiCan.newClock()
    return apiCan
})

.then( apiCan => {
    require('@server/routes/userGroupRoutes').addUserGroupRoutes( apiCan )
    require('@server/routingSystem').routingSystem( apiCan )
    appStatus.configure(apiCan)

    let appRoot = require('@routes/appRoot').appRoot
    appRoot.configure(apiCan)

    let server = require('@server/httpServer').httpServer( apiCan ) 
    let io = require('socket.io')(server)
    let messages = require('@server/messages').messages
    messages.init(io)
    run(apiCan)
})

