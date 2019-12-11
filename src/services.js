/***********************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * -------------------------------------
 *  Module services.js
 *
 *  class definition and implementation for services 
 **********************************************************/

"use strict"

const log = require('@src/utils').utils.log
const validator = require('validator')
const alwaysResolve = require('@src/utils').utils.alwaysResolve
const errors = require('@errors').errors
const moment = require('moment')

const services = (function() {

    return {
        codes: {
            updateServiceFeaturesOk: "update service feature ok",
            updateServiceFeaturesNotOk: "update service feature not ok"
        },

        updateOk: function(serviceID) {
            return {
                serviceID: serviceID,
                updated: 'ok'
            }
        },

        updateNotOk: function(serviceID, err) {
            return {
                serviceID: serviceID,
                updated: 'not ok',
                err: err
            }
        },

        ServiceRegister: class {
            constructor(tenant) {
                this.tenant = tenant
                this.serviceIDs = []
                this.register = new Map() //(serviceID => (serviceDef x serviceDoc))
            }
        },

        ServiceDocumentation: class {
            constructor(serviceID) {
                this.serviceID = serviceID
                this.fr = null
                this.en = null
            }
        },

        Service: class {
            constructor(serviceID, tenant) {
                this.id = serviceID
                this.tenant = tenant
                this.documentation = new Map()
            }
        },

        DocumentationSet: class {
            constructor(docObj) {
                if('body' in docObj && validator.isJSON(docObj.body)){
                    let swaggerInfo = JSON.parse(docObj.body)
                    if ('x-api-store-tags' in swaggerInfo){
                       this.tags = swaggerInfo["x-api-store-tags"]
                    }
                }
                Object.assign(this, docObj)
            }
        }
    }
})()

services.Service.prototype.outputAPIDescription = function(language) {
    let documentationHandle = `${this.system_name.toLowerCase()}-${language}`
    //service.system_name is used to link the french and the english versions
    //of the documentation. We only display the API and its associated information
    //if both linguistic versions are present
    if (this.documentation.has(documentationHandle)) {
        let docInfo, swaggerBody, apiDescription
        docInfo = this.documentation.get(documentationHandle)
        if (!(validator.isJSON(docInfo.body))) return
        swaggerBody = JSON.parse(docInfo.body)

        apiDescription = {
            name: swaggerBody.info.title,
            description: swaggerBody.info.description,
            baseURL: `https://${swaggerBody.host}${swaggerBody.basePath}`,
            humanURL: [`https://${this.tenant.name}`,
                (this.tenant.env === "dev" ? ".dev" : ""),
                `.api.canada.ca/${language}`,
                `/detail?api=${this.system_name}`
            ].join('')
        }
        if('tags' in docInfo){
            if(Array.isArray(docInfo.tags)){
                apiDescription.tags = docInfo.tags
            }
            else{
                apiDescription.tags = [docInfo.tags]
            }
        } 
        if (swaggerBody.info.contact) {
            apiDescription.contact = {
                FN: swaggerBody.info.contact.name,
                email: swaggerBody.info.contact.email
            }
        }
        return apiDescription
    }
    return null
}

services.Service.prototype.updateDefinition = function(defObj) {
    try {
        if (typeof(defObj) === 'object' &&
            'id' in defObj &&
            defObj.id === this.id) {

            Object.assign(this, defObj)
            return services.updateOk(this.id)
        }
    } catch (err) {
        return services.updateNotOk(this.id, err)
    }
}

services.Service.prototype.addDocumentationSet = function(docObj, tenantUpdateReport) {

    let serviceReport = tenantUpdateReport.serviceReport( this.id )
    if (/\-fr$/i.test(docObj.system_name)) {
        //French documentation		
        serviceReport.languageUpdate.french = errors.codes.Ok
    } else if (/\-en$/i.test(docObj.system_name)) {
        //English documentation		
        serviceReport.languageUpdate.english = errors.codes.Ok
    } else {
        //neither English nor French documentation
        return
    }
    this.documentation.set(docObj.system_name.toLowerCase(), new services.DocumentationSet(docObj))

}

services.Service.prototype.hasBillingualDoc = function() {
    if (this.documentation.size >= 2) {
        return true
    } //one french, one english
    return false
}

services.Service.prototype.updateFeatureInfo = async function(serviceUpdateReport = null) {
    let thisServiceID, that
    thisServiceID = this.id
    that = this
    let apiCall = [`${this.tenant.baseURL}services/${thisServiceID}/`,
        `features.json?access_token=${this.tenant.accessToken}`
    ].join('')

    let processGoodResponse = function(body) {
        if (validator.isJSON(body)) {
            if(serviceUpdateReport) {
                serviceUpdateReport.featuresUpdate = errors.codes.Ok
            }
            let features = JSON.parse(body).features
            that.features = features.map(obj => obj.feature)
        }
        return serviceUpdateReport 
    }
    return alwaysResolve(apiCall, {good: processGoodResponse, bad: serviceUpdateReport })
}

services.Service.prototype.servicePlanAccess = function() {
    let servicePlanAccess = {
        public: true,
        gcInternal: true,
        depInternal: true
    }
    //if no service plans, returns all access (public api)
    if (!('features' in this)) return servicePlanAccess
    let servicePlanFeatures = this.features.filter(feature => feature.scope === 'service_plan')
    if (servicePlanFeatures.length === 0) return servicePlanAccess
    servicePlanAccess.public = false
    servicePlanAccess.gcInternal = false
    servicePlanAccess.depInternal = false
    servicePlanFeatures.forEach(
        serviceFeature => {
            if (serviceFeature.system_name === 'gc-internal') servicePlanAccess.gcInternal = true
            if (serviceFeature.system_name === `${this.tenant.name}-internal`) servicePlanAccess.depInternal = true
        })
    return servicePlanAccess
}

services.ServiceRegister.prototype.length = function() {
    return this.serviceIDs.length
}

services.ServiceRegister.prototype.mapIDs = function(callback) {
    return this.serviceIDs.map(callback)
}

services.ServiceRegister.prototype.forEachServiceID = function(callback) {
    this.serviceIDs.forEach(callback)
}

services.ServiceRegister.prototype.forEach = function(callback) {
    this.register.forEach(callback)
}

services.ServiceRegister.prototype.listServices = function(){
	//returns a list of service description in an array
	let result = []
	this.forEach( (service, serviceID) => {
            result.push({
                     id:serviceID,
                     billingualDoc:service.hasBillingualDoc(), 
                     created: moment(service.created_at).format('YY/M/D'), 
                     updated: moment(service.updated_at).format('YY/M/D'), 
                     name: service.name, 
                     state: service.state})
    })
	return result
}

services.ServiceRegister.prototype.filter = function(servicePred){
    let filtered = []
    this.register.forEach(service => {
        if (servicePred(service)) filtered.push(service)
    })
    return filtered
}

services.ServiceRegister.prototype.updateServiceDocs = function(docObj, updateReport) {

    let serviceID = docObj.api_doc.service_id

    if (!this.register.has(serviceID)) { 
		  //register service if it isn't yet
        this.register.set(
					 serviceID, 
					 new services.Service(serviceID, this.tenant) )
        this.serviceIDs.push(serviceID)
    }

    let service = this.register.get(serviceID)
    return service.addDocumentationSet(docObj.api_doc, updateReport)
}

services.ServiceRegister.prototype.updateServiceDefinition =
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

services.ServiceRegister.prototype.addServiceFeatures = async function(features) {
    if (this.register.has(features.service)) {
        (this.register.get(features.service)).features = features.body.features
        this.serviceIDs.push(features.service)
    }
}

module.exports = {
    services
}
