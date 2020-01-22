/*******************************************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * Application APICan - 2020
 * -------------------------------------
 *  class ServiceRegister.js
 *
 *  class definition and implementation for service registers
 *
 ******************************************************************************/

"use strict"

/*****************************************************************************/

const moment = require('moment')
const services = require('@src/services').services
const errors = require('@errors').errors

class ServiceRegister {
    constructor(tenant) {
        this.tenant = tenant
        this.serviceIDs = []
        this.register = new Map() //(serviceID => (serviceDef x serviceDoc))
    }
}
ServiceRegister.prototype.length = function() {
    return this.serviceIDs.length
}

ServiceRegister.prototype.mapIDs = function(callback) {
    return this.serviceIDs.map(callback)
}

ServiceRegister.prototype.forEachServiceID = function(callback) {
    this.serviceIDs.forEach(callback)
}

ServiceRegister.prototype.forEach = function(callback) {
    this.register.forEach(callback)
}

ServiceRegister.prototype.listServices = function() {
    //returns a list of service description in an array
    let result = []
    this.forEach((service, serviceID) => {
        result.push({
            id: serviceID,
            billingualDoc: service.hasBillingualDoc(),
            created: moment(service.created_at).format('YY/M/D'),
            updated: moment(service.updated_at).format('YY/M/D'),
            name: service.name,
            state: service.state
        })
    })
    return result
}

ServiceRegister.prototype.filter = function(servicePred) {
    let filtered = []
    this.register.forEach(service => {
        if (servicePred(service)) filtered.push(service)
    })
    return filtered
}

ServiceRegister.prototype.updateServiceDocs = function(docObj, updateReport) {

    let serviceID = docObj.api_doc.service_id

    if (!this.register.has(serviceID)) {
        //register service if it isn't yet
        this.register.set(
            serviceID,
            new services.Service(serviceID, this.tenant))
        this.serviceIDs.push(serviceID)
    }

    let service = this.register.get(serviceID)
    return service.addDocumentationSet(docObj.api_doc, updateReport)
}

ServiceRegister.prototype.updateServiceDefinition =
    function(serviceDefinitionObject, updateReport) {
        //receives the result of a service definition fetch
        //and updates or create a new service object 
        //in this tenant service register
        let serviceID, serviceObject
        serviceID = serviceDefinitionObject.id


        if (!this.register.has(serviceID)) { //this service is not registered
            serviceObject = new services.Service(serviceID, this.tenant)
            this.register.set(serviceID, serviceObject)
            this.serviceIDs.push(serviceID)
        } //now it is

        serviceObject = this.register.get(serviceID)
        serviceObject.updateDefinition(serviceDefinitionObject)

        let serviceUpdateReport = updateReport.serviceReport(serviceID)
        serviceUpdateReport.serviceDefinitionUpdate = errors.codes.Ok
    }

ServiceRegister.prototype.addServiceFeatures = async function(features) {
    if (this.register.has(features.service)) {
        (this.register.get(features.service)).features = features.body.features
        this.serviceIDs.push(features.service)
    }
}

module.exports = {
    ServiceRegister
}