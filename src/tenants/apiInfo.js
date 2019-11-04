"use strict"

const tenants = require('@src/tenants/tenantsApiRequests').tenants
const tenantServices = require('@src/tenants/tenantServices').tenantServices

const log = require('@src/utils').utils.log
const errors = require('@errors').errors
const TenantUpdateReport = require('@errors').errors.TenantUpdateReport

tenants.Tenant.prototype.updateServiceDefinitions = 
	async function( tenantServiceListFetchResult, updateReport ) {

   if (tenantServiceListFetchResult === tenants.codes.serviceUpdateError) {
     	//there was an error fetching the list of services
        updateReport.serviceListFetchResult = errors.codes.NotOk
        log(`Error updating services for ${this.name}`)
        return 
    }
    updateReport.serviceListFetchResult = errors.codes.Ok
    //flag the services that need to be removed from the list of registered services
    let currentServiceIDs = tenantServiceListFetchResult.map(
        service => service.service.id
    )
    this.services.forEach(
        (service, serviceID) => {
            if (! currentServiceIDs.includes(serviceID) ) updateReport.servicesToRemove.push(serviceID)
        })

    log(`updating ${tenantServiceListFetchResult.length} service definitions for ${this.name}`)
    tenantServiceListFetchResult.forEach(
        service => this.services.updateServiceDefinition(service.service, updateReport)
    )
}

tenants.Tenant.prototype.addDocs = async function( apiDocsInfo, updateReport ) {

   if (apiDocsInfo === tenants.codes.activeDocsUpdateError || !Array.isArray(apiDocsInfo)) 
	 {
		//there was an error fetching the list of api docs			   
	    updateReport.docListFetchResult = errors.codes.NotOk
        log(`error getting apiDocs`)
        return 
    }
	updateReport.docListFetchResult = errors.codes.Ok
    log(`updating doc info for ${this.name}`)
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

tenants.Tenant.prototype.validateAPIs = async function(updateReport) {
    let servicesToUpdate, reportResults, thisTenant 
    thisTenant = this 

    reportResults = function(apiFetchResult){
        return {
            tenant: thisTenant.name, 
            updateResult: errors.codes.Ok
        }
    }

    servicesToUpdate = [] 
    updateReport.filterAllOk().forEach(
            serviceID => servicesToUpdate.push(this.services.register.get(serviceID))
    )

   let promiseArray = servicesToUpdate.map(service => service.updateFeatureInfo())
   return Promise.all(promiseArray)
            .then(reportResults)
}


tenants.Tenant.prototype.updateApiInfo = async function() {
    //called once per cron cycles
    //fetches information necessary to process all requests
    let serviceListingPromise, activeDocsPromise, updateReport
    updateReport = new TenantUpdateReport(this.name)
    serviceListingPromise = new Promise((resolve, reject) => {
        this.getServiceList()
        .then(services => resolve(this.updateServiceDefinitions(services, updateReport)))
    })

    activeDocsPromise = new Promise((resolve, reject) => {
        this.getActiveDocsList()
        .then(activeDocs => resolve(this.addDocs(activeDocs, updateReport)))
    })

    //fulfills both promises in paralell
    return Promise.all([serviceListingPromise , activeDocsPromise])
        .then(_ => this.validateAPIs(updateReport))
}

module.exports = {
    tenants
}
