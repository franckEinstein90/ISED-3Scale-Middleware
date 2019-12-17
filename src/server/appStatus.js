"use strict"

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
        }

   }

})()

module.exports = {
    statusCodes, 
    appStatus, 
    appVariables
}
