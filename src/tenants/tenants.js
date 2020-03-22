"use strict"

const tenants = require('@src/tenants/tenantsApiRequests').tenants
const log = require('@src/utils').utils.log
const errors = require('@errors').errors
const TenantUpdateReport = require('@errors').errors.TenantUpdateReport



tenants.Tenant.prototype.updateServiceFeatures = async function(featureDescriptions) {
    if (Array.isArray(featureDescriptions)) {
        if (featureDescriptions.length !== this.visibleServices.length) {
            console.log('problem')
            return
        }
        featureDescriptions.forEach(features =>
            this.services.addServiceFeatures(features))
        return 'done'
    }
    console.log(featureDescription)
}

const newTenant = info => new tenants.Tenant(info)
module.exports = {
    newTenant
}