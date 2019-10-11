const tenantsManager = require('@services/userInfo').tenantsManager
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

    return {
        cronUpdate: function() {
            if (this.runningMinutes === undefined) {
                this.runningMinutes = 0
            }
            if (this.lastRefresh === undefined) {
                this.lastRefresh = 0
            }
            if (this.lastRefresh === 0) {
                console.log(`Updating cache`)
                tenantsManager.getApiInfo({userEmail:null, language:null})
                    .then(x => writeToCache())
                    .then(x => console.log(cache.keys()))
                    .catch(err => console.log(err))
            }
            this.runningMinutes += 1
            this.lastRefresh = this.lastRefresh > cacheRefreshMinutes? 0: this.lastRefresh + 1
            console.log(`- app has been running for ${this.runningMinutes} mins`)
            console.log(`Managing tenants:`)
            tenantsManager.alive()
        },

    }

})()

module.exports = {
    cacheManage
}
