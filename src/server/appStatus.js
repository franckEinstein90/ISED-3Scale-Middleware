"use strict"

const statusCodes = {
    init: "initializing", 
    running: "running" 
}

const appStatus = (function(){
    
   let currentState = statusCodes.init 

   return {
        state: currentState, 
		isRunning: () => (currentState === statusCodes.running), 
        run: function(){
            currentState = statusCodes.running
        }

   }

})()

module.exports = {
    statusCodes, 
    appStatus
}
