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



tenants.Tenant.prototype.updateApiInfo = async function() {
    //called once per cron cycles 
    //1. fetches information necessary to process all requests
    //2. returns an updateReport

    //6
    let tenantUpdateReport = new TenantUpdateReport(this.name)

    let serviceListingPromise = new Promise((resolve, reject) => {
        this.getServiceList(tenantUpdateReport)
            .then(services => resolve(
                this.updateServiceDefinitions(
                    services,
                    tenantUpdateReport)
            ))
    })

    let activeDocsPromise = new Promise((resolve, reject) => {
        this.getActiveDocsList(tenantUpdateReport)
            .then(activeDocs => resolve(
                this.updateActiveDocs(activeDocs, tenantUpdateReport)
            ))
    })

    //fulfills both promises in paralell
    return Promise.all([serviceListingPromise, activeDocsPromise])
    .then(_ => {
        //7
        return this.validateAPIs(tenantUpdateReport)
    })
}

module.exports = {
    tenants
}