
/*******************************************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * Application APICan
 * -------------------------------------
 *  appEvents.js : configures the apps recurring events 
 *
 ******************************************************************************/
"use strict"

const scheduler = require('@src/cron/timer.js').scheduler
const tenantsManager = require('@services/tenantsManager').tenantsManager

let checkResults = function(updateResults) {
    let updateErrors = []
    updateResults.forEach(
        updateReport => {
            if (!updateReport.updateOk()) { //flag update errors
                updateErrors.push(updateReport.tenantName)
            }
        })
    if (updateErrors.length > 0) { //if there were errors, go back and fix
        return tenantsManager.updateTenantInformation(updateErrors)
            .then(checkResults)
    }
}

let updateTenants = function() {
    try {
        tenantsManager.updateTenantInformation()
        .then(results => checkResults(results))
    } catch (err) {
        console.log(err)
    }
}
  
const appEvents = (function(){
    return {
        configureTenantRefresh : function( frequency ){
            return scheduler.newEvent({
                frequency, 
                callback: updateTenants
            })
        }, 
        configureOTPEnforce : function( frequency ){
            return scheduler.newEvent({
                frequency, 
                callback: x => console.log(`running otp enforce event`)
            })
        }
    }
})()

module.exports = {
    appEvents
}