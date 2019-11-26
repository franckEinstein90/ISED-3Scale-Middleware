"use strict"

const tenants = require('@src/tenants/tenantsApiRequests').tenants
const tenantServices = require('@src/services').services

const log = require('@src/utils').utils.log
const errors = require('@errors').errors
const TenantUpdateReport = require('@errors').errors.TenantUpdateReport

tenants.Tenant.prototype.updateServiceDefinitions = async function( tenantServiceListFetchResult, tenantUpdateReport ) {
   //if the service list update generated an error, return here
    if(tenantUpdateReport.serviceListFetch !== errors.codes.Ok) {
       return 
    }
    //flag the services that need to be removed from the list of registered services
    let currentServiceIDs = tenantServiceListFetchResult.map(
        service => service.service.id
    )
    this.services.forEach(
        (service, serviceID) => {
            if (! currentServiceIDs.includes(serviceID) ) {
                updateReport.servicesToRemove.push(serviceID)
            }
        })

    log(`updating ${tenantServiceListFetchResult.length} service definitions for ${this.name}`)
    tenantServiceListFetchResult.forEach(
        service => this.services.updateServiceDefinition(service.service, tenantUpdateReport)
    )
}

tenants.Tenant.prototype.addDocs = async function( apiDocsInfo, updateReport ) {
    //if the document fetch operation resulted in an error, return here
    if(updateReport.activeDocsUpdate !== errors.codes.Ok) return 
    apiDocsInfo.forEach(
        apiDocObject => this.services.updateServiceDocs(apiDocObject, updateReport)
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

tenants.Tenant.prototype.validateAPIs = async function(tenantUpdateReport) {
    let servicesToUpdate, reportResults
    //if either the service list fetch or the active doc fetch returned errors 
    if(tenantUpdateReport.activeDocsUpdate !== errors.codes.Ok || tenantUpdateReport.serviceListFetch !== errors.codes.Ok){
        return tenantUpdateReport //update Failed
    }
   reportResults = serviceUpdateReports => {
        tenantUpdateReport.serviceUpdates = serviceUpdateReports
        return tenantUpdateReport
   }

    servicesToUpdate = [] 
    tenantUpdateReport.filterAllOk().forEach(
            serviceID => servicesToUpdate.push(this.services.register.get(serviceID))
    )
    let tenantName = this.name
    let promiseArray = servicesToUpdate.map(service => {
       let serviceUpdateReport = new errors.ServiceUpdateReport(tenantName, service.id)
       return service.updateFeatureInfo(serviceUpdateReport)
   })
   return Promise.all(promiseArray)
            .then(reportResults)
}


tenants.Tenant.prototype.updateApiInfo = async function() {
    //called once per cron cycles 
    //1. fetches information necessary to process all requests
    //2. returns an updateReport
    let serviceListingPromise, activeDocsPromise

    let tenantUpdateReport = new TenantUpdateReport(this.name)
    serviceListingPromise = new Promise((resolve, reject) => {
        this.getServiceList(tenantUpdateReport)
        .then(services => resolve(
		    this.updateServiceDefinitions(services,tenantUpdateReport)
	    ))
    })

    activeDocsPromise = new Promise((resolve, reject) => {
        this.getActiveDocsList(tenantUpdateReport)
        .then(activeDocs => resolve(
            this.addDocs(activeDocs, tenantUpdateReport)
        ))
    })

    //fulfills both promises in paralell
    return Promise.all([serviceListingPromise , activeDocsPromise])
        .then(_ => this.validateAPIs(tenantUpdateReport))
}

module.exports = {
    tenants
}
