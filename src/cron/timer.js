"use strict";

const tenantsManager = require('@services/tenantsManager').tenantsManager
const log = require('@src/utils').utils.log
const cache = require('memory-cache')

const cacheManage = (function() {

    let cacheRefreshMinutes = 5

    let defaultKey = (tenant, service) =>{ 
        return {
            key: `${tenant.name}-${service.serviceDefinition.id}-default`,
            value: service.serviceDefinition.name
        }
    }

    let writeToCache = function() {
        tenantsManager.forEachTenant(
            tenant => {
                tenant.services.register.forEach(
                    (service, serviceID) => updateCache(defaultKey(tenant, service))
                ) }
        )
        return 1;
    }

    let updateCache = function ({key, value}) {
       if(cache.get(key) === null) {
           cache.put(key, value, 1500 * 60000)
       }
    }
    let checkResults = function(updateResults){
        console.log(`Updating Tenant Information`)
    }
    return {
        cronUpdate: function() {
            if (this.runningMinutes === undefined) {
                this.runningMinutes = 0
            }
            log('----------------------------------------------------------------------')
            log(`app has been running for ${this.runningMinutes} minutes`)
            if (this.lastRefresh === undefined || 
                this.lastRefresh >= cacheRefreshMinutes) {
                this.lastRefresh = 0
             try{
                tenantsManager.updateTenantInformation()
                .then(results => checkResults(results))
            }catch(err){
                console.log(err)
                debugger
            }
                
            }
            this.runningMinutes += 1
            this.lastRefresh += 1
       },

    }

})()

module.exports = {
    cacheManage
}
