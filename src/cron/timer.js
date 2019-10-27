const tenantsManager = require('@services/tenantsManager').tenantsManager
const log = require('@src/utils').utils.log
const cache = require('memory-cache')

const cacheManage = (function() {

    let cacheRefreshMinutes = 15

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
                this.runningMinutes = 1
            }
            log('----------------------------------------------------------------------')
            log(`app has been running for ${this.runningMinutes} minutes`)
            if (this.lastRefresh === undefined) {
                this.lastRefresh = 0
            }
            this.runningMinutes += 1

            try{
                tenantsManager.updateTenantInformation()
                .then(results => checkResults(results))
            }catch(err){
                console.log(err)
                debugger
            }
            /*if (this.lastRefresh === 0) {
                console.log(`Updating cache`)
                tenantsManager.getApiInfo({userEmail:null, language:null})
                .then(resolve(1))
       //             .then(x => writeToCache())
        //            .then(x => console.log(cache.keys()))
         //           .catch(err => console.log(err))
            }
            this.lastRefresh = this.lastRefresh > cacheRefreshMinutes? 0: this.lastRefresh + 1
            console.log(`- app has been running for ${this.runningMinutes} mins`)
            console.log(`Managing tenants:`)
            tenantsManager.alive()*/
        },

    }

})()

module.exports = {
    cacheManage
}
