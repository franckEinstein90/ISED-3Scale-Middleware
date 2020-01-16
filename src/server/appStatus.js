/*******************************************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * -------------------------------------
 *  appStatus.js
 *
 *  
 *******************************************************************************/

"use strict"

const scheduler = require('@src/cron/timer').scheduler

const statusCodes = {
    init: "initializing", 
    running: "running" 
}

const appStatus = (function(){
    
    let currentState = statusCodes.init 
    let keyCloakEnabled = false
    let _tenantRefreshEventID = null

    return {
        configure : function({
            tenantRefreshEventID
        }){
            _tenantRefreshEventID = tenantRefreshEventID
        }, 
        state: currentState, 

        enableKeyCloak: () => keyCloakEnabled = true , 
        keyCloakEnabled: () => keyCloakEnabled,
        isRunning: () => (currentState === statusCodes.running), 
        run: function(){
            currentState = statusCodes.running
        }, 
        
        output: async function(req, res, next){
            let nextTenantRefresh = 0 
            if( _tenantRefreshEventID )  nextTenantRefresh = scheduler.nextRefresh( _tenantRefreshEventID) 
	        let statusOut = {
		        runningTime: scheduler.runningTime(), 
		        state: 'initializing', 
		        nextTenantRefresh
            }
            if(appStatus.isRunning()) statusOut.state = 'running'
            res.send(statusOut)
        }

   }

})()

module.exports = {
    statusCodes, 
    appStatus 
}
