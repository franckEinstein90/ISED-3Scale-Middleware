"use strict"

const tenants = require('@src/tenants/tenantsApiRequests').tenants
const tenantServices = require('@src/tenants/tenantServices').tenantServices

const log = require('@src/utils').utils.log
const errors = require('@errors').errors
const TenantUpdateReport = require('@errors').errors.TenantUpdateReport

tenants.Tenant.prototype.updateServiceDefinitions = async function( tenantServiceListFetchResult, updateReport ) {
    if (tenantServiceListFetchResult === tenants.codes.serviceUpdateError) {
    /*    //there was an error fetching the list of services
        debugger
        updateReport.serviceListFetchResult = errors.codes.NotOk
        log(`Error updating services for ${this.name}`)
        return tenants.codes.serviceUpdateError*/
    }
//    updateReport.serviceListFetchResult = errors.codes.Ok
    //flag the services that need to be removed from the list of registered services
 /*   let currentServiceIDs = tenantServiceListFetchResult.map(
        service => service.service.id
    )
    this.services.forEach(
        (service, serviceID) => {
            if (! currentServiceIDs.includes(serviceID) ) updateReport.servicesToRemove.push(serviceID)
        })*/

    log(`updating ${tenantServiceListFetchResult.length} service definitions for ${this.name}`)
    let resultArray = tenantServiceListFetchResult.map(
        service => this.services.updateServiceDefinition(service.service, updateReport)
    )
    //returns the ids of the services that were added to the tenant
    return tenants.codes.serviceUpdateOK
}

tenants.Tenant.prototype.addDocs = async function(apiDocsInfo) {
    if (apiDocsInfo === tenants.codes.activeDocsUpdateError) {
        log(`error getting apiDocs`)
        return apiDocsInfo
    }
    if (!Array.isArray(apiDocsInfo)) {
        return tenants.codes.activeDocsUpdateError
    }
    log(`updating doc info for ${this.name}`)
    apiDocsInfo.forEach(apiDocObject => this.services.addServiceDocs(apiDocObject))
    return tenants.codes.activeDocsUpdateOK
}

tenants.Tenant.prototype.updateServiceFeatures = async function(featureDescriptions) {
    if (Array.isArray(featureDescriptions)) {
        if (featureDescriptions.length !== this.visibleServices.length) {
            console.log('problem')
            return
        }
        featureDescriptions.forEach(features => this.services.addServiceFeatures(features))
        return 'done'
    }
    console.log(featureDescription)
}

tenants.Tenant.prototype.validateAPIs = async function(serviceUpdateResults) {
    //Check that the results of the service updates have returned ok
    if( serviceUpdateResults[0] !== tenants.codes.serviceUpdateOK ) debugger
    if( serviceUpdateResults[1] !== tenants.codes.activeDocsUpdateOK) debugger

    let reportResult = function(resultArray) {
        let okUpdates = resultArray.filter(feature => feature === tenantServices.codes.updateServiceFeaturesOk)
        if (okUpdates.length === resultArray.length) return tenants.codes.tenantUpdateOk
        return tenants.codes.tenantUpdateNotOk
    }
    this.visibleServices.length = 0
    this.services.forEach((service, id) => {
        if (service.hasBillingualDoc()) this.visibleServices.push(service)
    })
    if (this.visibleServices.length === 0) return tenants.codes.tenantUpdateOk
    let promiseArray = this.visibleServices.map(service => service.updateFeatureInfo())
    return Promise.all(promiseArray)
        .then(reportResult)
}


tenants.Tenant.prototype.updateApiInfo = async function() {
    //called once per cron cycles
    //fetches information necessary to process all requests
    let serviceListingPromise, activeDocsPromise, updateReport
    updateReport = new TenantUpdateReport(this.name)
    //first, 
    serviceListingPromise = new Promise((resolve, reject) => {
        this.getServiceList()
            .then(services => resolve(this.updateServiceDefinitions(services, updateReport)))
    })

    activeDocsPromise = new Promise((resolve, reject) => {
        this.getActiveDocsList()
            .then(activeDocs => resolve(this.addDocs(activeDocs)))
    })

    //fulfills both promises in paralell
    return Promise.all([serviceListingPromise, activeDocsPromise])
        .then(updateResult => this.validateAPIs(updateResult))
}

module.exports = {
    tenants
}
