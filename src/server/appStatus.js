/*******************************************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * -------------------------------------
 *  appStatus.js
 *
 *  
 *******************************************************************************/

"use strict"

const appTimer = require('@src/cron/timer').cacheManage

const statusCodes = {
    init: "initializing", 
    running: "running" 
}

const appVariables = function(){
    this.env = null
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
		        runningTime: appTimer.runningTime(), 
		        state: 'initializing', 
		        nextTenantRefresh: appTimer.nextRefresh()
            }
            if(appStatus.isRunning()) statusOut.state = 'running'
            res.send(statusOut)
        }

   }

})()

module.exports = {
    statusCodes, 
    appStatus, 
    appVariables
}
