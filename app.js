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

const express = require('express');
const app = express();

app.get('/', (req, res) => {
  const name = process.env.NAME || 'World';
  res.send(`Hello ${name}!`);
});

const port = parseInt(process.env.PORT) || 8080;
app.listen(port, () => {
  console.log(`helloworld: listening on port ${port}`);
});
/*****************************************************************************/
//require('module-alias/register')
/*****************************************************************************/
//const appStatus         = require('@server/routes/appStatus').appStatus
//const path              = require('path')
/*****************************************************************************/
/*
let healthChecks = [
  /*  {
        label: 'jiraSupport', 
        runCheck: require('@src/process/healthChecks.js').checkJiraSupport,
        run: true 
    }
]

let run = (apiCan) => {
    apiCan.say('*********************************')
    apiCan.say(`apiCan ${apiCan.features.versioning ? apiCan.versionTag : ""} booting`)
    Promise.all(healthChecks.map(check=>check.runCheck( apiCan )))
    .then(  _ => apiCan.tenants.updateTenantInformation())
    .then(  _ => {
        if (apiCan.clock) apiCan.clock.start()
        apiCan.server.start()  
        require('@server/messages').addClientMessages( apiCan )
        apiCan.clientMessages.emitRefreshBottomStatus( 'app is running' )
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
    expressStack    : require('express')(), 
}
require('@clientServerCommon/features').addFeatureSystem( APICan )
require('@clientServerCommon/viewModel').addComponent( APICan )
const p = require('@src/APICanData').getAppData( APICan )

const f = async ()=>{
await p; 
require('@server/expressStack').expressConfig( APICan )
require('@src/process/stats').addProcessStatsFeature( APICan )
require('@cron/timer').addRecurringEventsFeature( APICan )
require('@cron/timer').addTimerFeature( APICan )
require('@src/APICan').APICanConfig( APICan )

}

await f(); */

/*
.then( require('@src/APICanVersion').addVersioningFeature                   ) //versioning support
.then( require('@src/apiStore/supportRequest').addSupportRequestInterface   )
.then( require('@src/users/keycloak').addKeycloakInterface                  )
.then( apiCan => {                                          //tenant manager configuration
    require('@tenants/tenantsManager').addTenantManagementModule( apiCan ) 
    if(apiCan.implements('recurring-events')){
        apiCan.addNewEvent( "refresh tenant information", 7, apiCan.tenants.updateTenantInformation)
    }
    return apiCan
})
.then( require('@tenants/router').addTenantRouterFeature     )
.then( require('@users/groupActions').addGroupActionsFeatures)
*/
/*.then( apiCan => {
    apiCan.newClock()
    return apiCan
})

.then( apiCan => {

    require('@server/routes/services').addServiceModule( apiCan )
    require('@server/routingSystem').routingSystem( apiCan )
    appStatus.configure(apiCan)
    let appRoot = require('@routes/appRoot').appRoot
    appRoot.configure(apiCan)
    require('@server/httpServer').httpServer( apiCan ) 
    run(apiCan)

})*/

