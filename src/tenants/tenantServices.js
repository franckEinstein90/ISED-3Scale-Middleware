"use strict";

const log = require('@src/utils').utils.log

const tenantServices = (function() {

    return {
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

        Service: class {
            constructor(serviceID, tenant) {
                this.id = serviceID
                this.tenant = tenant
                this.documentation = new Map()
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

tenantServices.Service.prototype.addDocumentationSet = function(docObj) {
    try {
        this.documentation.set(docObj.system_name, docObj)
        return tenantServices.updateOk(this.id)
    } catch (err) {
        return tenantServices.updateNotOk(this.id, err)
    }
}

tenantServices.Service.prototype.fetchFeatures = function() {

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

tenantServices.ServiceRegister.prototype.addServiceDocs = function(docObj) {
    let createNewService, serviceID
    serviceID = docObj.api_doc.service_id
    createNewService = _ => new tenantServices.Service(serviceID, this.tenant)
    if (!this.register.has(serviceID)) {
        let newService = createNewService()
        this.register.set(serviceID, newService)
        this.serviceIDs.push(serviceID)
    }
    let service = this.register.get(serviceID)
    return service.addDocumentationSet(docObj.api_doc)
}

tenantServices.ServiceRegister.prototype.addServiceDefinition = function(serviceDefinitionObject) {

    let serviceID, service
    serviceID = serviceDefinitionObject.id

    if (!this.register.has(serviceID)) { //this service is not registered
        service = new tenantServices.Service(serviceID, this.tenant)
        this.register.set(serviceID, service)
        this.serviceIDs.push(serviceID)
    } //now it is

    service = this.register.get(serviceID)
    let serviceUpdate = service.updateDefinition(serviceDefinitionObject)
    return serviceUpdate
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
