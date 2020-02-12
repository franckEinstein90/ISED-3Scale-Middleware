"use strict"

const tenants = require('@src/tenants/tenantsApiRequests').tenants
const log = require('@src/utils').utils.log
const errors = require('@errors').errors
const TenantUpdateReport = require('@errors').errors.TenantUpdateReport


tenants.Tenant.prototype.updateActiveDocs = async function(apiDocsInfo, updateReport) {
    //if the document fetch operation resulted in an error, return here
    if (updateReport.fetches.activeDocs !== errors.codes.Ok) return
    apiDocsInfo.forEach(
        apiDocObject =>
        this.services.updateServiceDocs(
            apiDocObject,
            updateReport)
    )
}

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


module.exports = {
    tenants
}