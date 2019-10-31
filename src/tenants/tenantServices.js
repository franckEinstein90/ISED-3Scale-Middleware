"use strict";

const log = require('@src/utils').utils.log
const validator = require('validator')
const alwaysResolve= require('@src/utils').utils.alwaysResolve
const errors = require('@errors').errors

const tenantServices = (function() {

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

		 ServiceDocumentation: class{
			 	constructor(serviceID){
					this.serviceID = serviceID
					this.fr = null
					this.en = null
				}
		  }, 

        Service: class {
            constructor(serviceID, tenant) {
                this.id = serviceID
                this.tenant = tenant
                this.documentation = new tenantServices.ServiceDocumentation(serviceID)
            }
        },

        DocumentationSet: class {
            constructor(docObj) {
                Object.assign(this, docObj)
            }
        }
    }
})()

tenantServices.Service.prototype.outputAPIDescription = function(language) {
	   let documentationHandle = `${this.system_name.toLowerCase()}-${language}`
      //service.system_name is used to link the french and the english versions
      //of the documentation. We only display the API and its associated information
      //if both linguistic versions are present
      if (this.documentation.has(documentationHandle)) {
		let docInfo, swaggerBody, apiDescription
         docInfo = this.documentation.get(documentationHandle)
         if(!(validator.isJSON(docInfo.body))) return
         swaggerBody = JSON.parse(docInfo.body)
         apiDescription = {
         	name: swaggerBody.info.title,
            description: swaggerBody.info.description,
            baseURL: `https://${swaggerBody.host}${swaggerBody.basePath}`,
            humanURL: [`https://${this.tenant.name}`, 
								(this.tenant.env === "dev"?".dev":""), 
								`.api.canada.ca/${language}`, 
								`/detail?api=${this.system_name}`].join('')	
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

tenantServices.Service.prototype.updateDefinition = function(defObj) {
    try {
        if (typeof(defObj) === 'object' &&
            'id' in defObj &&
            defObj.id === this.id) {

            Object.assign(this, defObj)
            return tenantServices.updateOk(this.id)
        }
    } catch (err) {
        return tenantServices.updateNotOk(this.id, err)
    }
}

tenantServices.Service.prototype.addDocumentationSet = function(docObj, updateReport) {
	if(/\-fr$/.test(docObj.system_name)){
		this.documentation.fr = docObj
	}
   else if(/\-en$/.test(docObj.system_name)){
		this.documentation.en = docObj
	}
	else{
		debugger
	}
   /*     this.documentation.set(docObj.system_name.toLowerCase(), docObj)
        return tenantServices.updateOk(this.id)
    } catch (err) {
        return tenantServices.updateNotOk(this.id, err)
    }*/
}

tenantServices.Service.prototype.hasBillingualDoc = function(){
    if (this.documentation.size >= 2){
        return true
    } //one french, one english
    return false
}

tenantServices.Service.prototype.updateFeatureInfo = async function(){
    let thisServiceID, that, bad
    bad = tenantServices.codes.updateServiceFeaturesNotOk
    thisServiceID = this.id
    that = this
    let apiCall = [`${this.tenant.baseURL}services/${thisServiceID}/`, 
                    `features.json?access_token=${this.tenant.accessToken}`].join('')
    let processGoodResponse = function(body) {
            if(validator.isJSON(body)){
                let features = JSON.parse(body).features
                that.features = features.map(obj => obj.feature)
                return tenantServices.codes.updateServiceFeaturesOk 
            }
            return bad
        }
   return alwaysResolve(apiCall, {good: processGoodResponse, bad})
}

tenantServices.Service.prototype.servicePlanAccess = function(){
    let servicePlanAccess = {
        public: true, 
        gcInternal: true, 
        depInternal: true
    }
    //if no service plans, returns all access (public api)
    if(! ('features' in this)) return servicePlanAccess
    let servicePlanFeatures = this.features.filter(feature => feature.scope === 'service_plan')
    if(servicePlanFeatures.length === 0) return servicePlanAccess
    servicePlanAccess.public = false
    servicePlanAccess.gcInternal = false
    servicePlanAccess.depInternal = false
    servicePlanFeatures.forEach(
        serviceFeature => {
            if(serviceFeature.system_name === 'gc-internal') servicePlanAccess.gcInternal = true
            if(serviceFeature.system_name === `${this.tenant.name}-internal`) servicePlanAccess.depInternal = true
        })
	return servicePlanAccess
}

tenantServices.ServiceRegister.prototype.length = function() {
    return this.serviceIDs.length
}

tenantServices.ServiceRegister.prototype.mapIDs = function(callback) {
    return this.serviceIDs.map(callback)
}

tenantServices.ServiceRegister.prototype.forEachServiceID = function(callback) {
    this.serviceIDs.forEach(callback)
}

tenantServices.ServiceRegister.prototype.forEach = function(callback) {
    this.register.forEach(callback)
}

tenantServices.ServiceRegister.prototype.updateServiceDocs 
	= function(docObj, updateReport) {
    let createNewService, serviceID

    serviceID = docObj.api_doc.service_id
    createNewService = _ => new tenantServices.Service(serviceID, this.tenant)

    if (!this.register.has(serviceID)) { //register service if it isn't yet
        let newService = createNewService()
        this.register.set(serviceID, newService)
        this.serviceIDs.push(serviceID)
    }
    let service = this.register.get(serviceID)
    return service.addDocumentationSet(docObj.api_doc, updateReport)
}

tenantServices.ServiceRegister.prototype.updateServiceDefinition = 
	function(serviceDefinitionObject, updateReport) {
    //receives the result of a service definition fetch
    //and updates or create a new service object 
    //in this tenant service register
    let serviceID, serviceObject 
    serviceID = serviceDefinitionObject.id
    

    if (!this.register.has(serviceID)) { //this service is not registered
        serviceObject = new tenantServices.Service(serviceID, this.tenant)
        this.register.set(serviceID, serviceObject)
        this.serviceIDs.push(serviceID)
    } //now it is

    serviceObject = this.register.get(serviceID)
	 serviceObject.updateDefinition(serviceDefinitionObject)

    updateReport.reportUpdateService(serviceID, 
		 { 
			 updateTarget: "service definition update", 
			 updateResult: errors.codes.Ok
		 })
}

tenantServices.ServiceRegister.prototype.addServiceFeatures = async function(features) {
    if (this.register.has(features.service)) {
        (this.register.get(features.service)).features = features.body.features
        this.serviceIDs.push(features.service)
    }
}

module.exports = {
    tenantServices
}
