"use strict"
const tenants = require('@src/tenants/tenantsApiRequests').tenants
const log = require('@src/utils').utils.log
const tenantServices = require('@src/tenants/tenantServices').tenantServices

tenants.Tenant.prototype.updateServices = async function(serviceArray) {
    this.userGCInternal = false
    this.userTenantInternal = false
    let resultArray
    if (serviceArray === tenants.codes.serviceUpdateError) {
        log(`Error updating services for ${this.name}`)
        return tenants.codes.serviceUpdateError
    }
    log(`updating ${serviceArray.length} service definitions for ${this.name}`)
    resultArray = serviceArray.map(
        service => this.services.addServiceDefinition(service.service)
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
    let reportResult = function(resultArray) {
        let okUpdates = resultArray.filter(feature => feature === tenantServices.codes.updateServiceFeaturesOk)
        if (okUpdates.length = resultArray.length) return tenants.codes.tenantUpdateOk
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


tenants.Tenant.prototype.getApiInfo = async function() {

    let promiseArray, serviceListingPromise, activeDocsPromise
    this.visibleServices = []
    serviceListingPromise = new Promise((resolve, reject) => {
        this.getServiceList()
            .then(services => resolve(this.updateServices(services)))
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