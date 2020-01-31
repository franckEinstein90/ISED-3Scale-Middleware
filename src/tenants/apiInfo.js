"use strict"

const tenants = require('@src/tenants/tenantsApiRequests').tenants
const tenantServices = require('@services/services').services

const log = require('@src/utils').utils.log
const errors = require('@errors').errors
const TenantUpdateReport = require('@errors').errors.TenantUpdateReport

tenants.Tenant.prototype.updateServiceDefinitions = 
    async function(tenantServiceListFetchResult, tenantUpdateReport) {
    //if the service list update generated an error, return here
    if (tenantUpdateReport.fetches.serviceList !== errors.codes.Ok) {
        return
    }
    //flag the services that need to be removed from the list of registered services
    let currentServiceIDs = tenantServiceListFetchResult.map(
        service => service.service.id
    )
    this.services.forEach(
        (service, serviceID) => {
            if (!currentServiceIDs.includes(serviceID)) {
                updateReport.servicesToRemove.push(serviceID)
            }
        })

    log(`updating ${tenantServiceListFetchResult.length} service definitions for ${this.name}`)
    tenantServiceListFetchResult.forEach(
        service => this.services.updateServiceDefinition(service.service, tenantUpdateReport)
    )
}

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

tenants.Tenant.prototype.validateAPIs = async function(tenantUpdateReport) {
    //At this stage, we've fetched the list of services from this tenant and
    //its set of documentation
    //if either the service list fetch or the active doc fetch returned errors 
    if (tenantUpdateReport.fetches.serviceList !== errors.codes.Ok ||
        tenantUpdateReport.fetches.activeDocs !== errors.codes.Ok) {
        //report a failed update
        return tenantUpdateReport //update Failed
    }

    //extract the services that have billingual documentation
    //these are the only one worth fetching the features for
    let billingualServicesReports = []
    tenantUpdateReport.servicesUpdateReports.forEach(
        serviceUpdateReport => {
            if (serviceUpdateReport.languageUpdate.french === errors.codes.Ok &&
                serviceUpdateReport.languageUpdate.english === errors.codes.Ok) {
                billingualServicesReports.push(serviceUpdateReport)
            } else {
                serviceUpdateReport.updateSuccess = errors.codes.Ok
            }
        })

    if (billingualServicesReports.length === 0) {
        tenantUpdateReport.updateSuccess = errors.codes.Ok
        return tenantUpdateReport
    }

    let tenantName = this.name
    let promiseArray = billingualServicesReports.map(
        serviceUpdateReport => {
            let serviceID = parseInt((serviceUpdateReport.id.split('_'))[1])
            let service = this.services.register.get(serviceID)
            return service.updateFeatureInfo(serviceUpdateReport)
        })

    let reportUpdateResults = (servicesUpdateReports) => {
        servicesUpdateReports.forEach(
            serviceUpdateReport => {
                if (serviceUpdateReport.featuresUpdate === errors.codes.Ok) {
                    serviceUpdateReport.updateSuccess = errors.codes.Ok
                }
            })
        let badServiceUpdateReport = tenantUpdateReport.servicesUpdateReports.find(
            serviceUpdateReport => serviceUpdateReport.updateSuccess !== errors.codes.Ok
        )
        if (!badServiceUpdateReport) {
            tenantUpdateReport.updateSuccess = errors.codes.Ok
        }
        return tenantUpdateReport
    }
    return Promise.all(promiseArray)
        .then(reportUpdateResults)
}


tenants.Tenant.prototype.updateApiInfo = async function() {
    //called once per cron cycles 
    //1. fetches information necessary to process all requests
    //2. returns an updateReport

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
        .then(_ => this.validateAPIs(tenantUpdateReport))
}

module.exports = {
    tenants
}