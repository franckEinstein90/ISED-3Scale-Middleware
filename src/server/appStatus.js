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

    return {
        state: currentState, 

        enableKeyCloak: () => keyCloakEnabled = true , 
        keyCloakEnabled: () => keyCloakEnabled,
        isRunning: () => (currentState === statusCodes.running), 
        run: function(){
            currentState = statusCodes.running
        }, 
        
        output: async function(req, res, next){
	        let statusOut = {
		        runningTime: scheduler.runningTime(), 
		        state: 'initializing', 
		        nextTenantRefresh: scheduler.nextRefresh()
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
