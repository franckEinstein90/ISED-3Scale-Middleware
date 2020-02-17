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
/*******************************************************************************/
/*******************************************************************************/
const statusCodes = {
    init: "initializing",
    running: "running"
}


const appStatus = (function( ) {
    let _apiCan = null
   
    return {
        configure   : function(apiCan){
            _apiCan = apiCan
        },

        getStatus   : async function(req, res, next) {

            let events = _apiCan.clock.events.map( ev => {
                return {
                    id: ev.id, 
                    last: ev.last, 
                    next: ev.next, 
                    frequency: ev.frequency, 
                    name: ev.name
                }
            })            
            let reqResponse = {
                runningTime: _apiCan.clock.clockTime, 
                env: _apiCan.data.env.env, 
                state: _apiCan.state,
                version: _apiCan.versioning ? _apiCan.versionTag : null, 
                nextTenantRefresh : 5 , 
                events
                //managedTenants: _managedTenants
            }
            res.send( reqResponse )
        }
    }
})()

module.exports = {
    appStatus
}
