"use strict";

const tenantsManager = require('@services/tenantsManager').tenantsManager
const log = require('@src/utils').utils.log
const cache = require('memory-cache')
const codes = require('@src/tenants').tenants.codes
const errors = require('@errors').errors
const messages = require('@server/messages').messages
const cronJob = require('node-cron')

const scheduler = (function() {

    //frequency of tenant api info refresh
    let tenantInfoRefresh = {
        frequency: 5, //minutes
        lastRefresh: 0 //minutes
    }
    let runningTimeMinutes = 0

    let defaultKey = (tenant, service) => {
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
                )
            }
        )
        return 1;
    }

    let updateCache = function({
        key,
        value
    }) {
        if (cache.get(key) === null) {
            cache.put(key, value, 1500 * 60000)
        }
    }

    let checkResults = function(updateResults) {
        let updateErrors = []
        updateResults.forEach(
            updateReport => {
                if (!updateReport.updateOk()) { //flag update errors
                    updateErrors.push(updateReport.tenantName)
                }
            })
        messages.emitRefreshFront()
        if (updateErrors.length > 0) { //if there were errors, go back and fix
            return tenantsManager.updateTenantInformation(updateErrors)
                .then(checkResults)
        }
    }

    let updateTenants = function() {

        if (tenantInfoRefresh.lastRefresh >= tenantInfoRefresh.frequency) {
            tenantInfoRefresh.lastRefresh = 0
            try {
                tenantsManager.updateTenantInformation()
                .then(results => checkResults(results))
            } catch (err) {
                console.log(err)
            }
        }
        tenantInfoRefresh.lastRefresh += 1
    }

    return {

        start: function({
            tenantInfoRefresh
        }){
            scheduler.setRefreshTime( tenantInfoRefresh )
            cronJob.schedule('* * * * *', scheduler.cronUpdate)
        },

        runningTime: function() {
            return runningTimeMinutes
        },

        nextRefresh: function(){
            return tenantInfoRefresh.frequency - tenantInfoRefresh.lastRefresh
        },

        setRefreshTime: function(timeInMinutes) {
            tenantInfoRefresh.frequency = timeInMinutes
        },

        cronUpdate: function() {

            runningTimeMinutes += 1
            log('----------------------------------------------------------------------')
            log(`app has been running for ${runningTimeMinutes} minutes`)
            updateTenants()
        }

    }

})()

module.exports = {
   scheduler 
}
