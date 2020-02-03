/*******************************************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * -------------------------------------
 *  appStatus.js
 *
 *  
 *******************************************************************************/

"use strict"

/*******************************************************************************/
const config = require('config')
/*******************************************************************************/
const scheduler = require('@src/cron/timer').scheduler

const statusCodes = {
    init: "initializing",
    running: "running"
}


const appStatus = (function() {

    let currentState = statusCodes.init
    let keyCloakEnabled = false

    let _managedTenants = null
    let _configDataEnv = null
    let _tenantRefreshEventID = null
    return {
        ready: function( ){
            let configData = config.get('master')
            _configDataEnv = configData.env
            _managedTenants = configData.tenants.map(t => t.name)
        }, 

        configure: function({
            tenantRefreshEventID
        }) {
            _tenantRefreshEventID = tenantRefreshEventID
        },
        state: currentState,

        enableKeyCloak: () => keyCloakEnabled = true,
        keyCloakEnabled: () => keyCloakEnabled,
        isRunning: () => (currentState === statusCodes.running),
        run: function() {
            currentState = statusCodes.running
        },

        getStatus: async function(req, res, next) {
            let nextTenantRefresh = 0
            if (_tenantRefreshEventID) nextTenantRefresh = scheduler.nextRefresh(_tenantRefreshEventID)
            let reqResponse = {
                runningTime: scheduler.runningTime(),
                env: _configDataEnv, 
                state: 'initializing',
                nextTenantRefresh, 
                managedTenants: _managedTenants
            }
            if (appStatus.isRunning()) reqResponse.state = 'running'
            res.send( reqResponse )
        }

    }

})()

module.exports = {
    statusCodes,
    appStatus
}