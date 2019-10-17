"use strict"; 

const log = require('@src/utils').utils.log

const tenantServices = (function(){

    return{
        ServiceRegister: class{
            constructor(tenant){
                this.tenant = tenant
                this.serviceIDs = []
                this.register = new Map() //(serviceID => (serviceDef x serviceDoc))
            }
        }, 

        Service: class{
            constructor(serviceID, tenant){
                this.id = serviceID
                this.tenant = tenant
                this.documentation = []
            }
        }, 
				
				DocumentationSet: class{
						constructor(docObj){
							Object.assign(this, docObj)
					}
				}
    }
})()

tenantServices.Service.prototype.updateDefinition = function(defObj){
    if(typeof(defObj) === 'object' && 'id' in defObj && defObj.id === this.id){
        Object.assign(this, defObj) 
    }
}

tenantServices.Service.prototype.addDocumentationSet = function(docObj){
	this.documentation.push(new tenantServices.DocumentationSet(docObj))
}

tenantServices.Service.prototype.fetchFeatures = function(){

}


tenantServices.ServiceRegister.prototype.length = function(){
    return this.serviceIDs.length
}
tenantServices.ServiceRegister.prototype.mapIDs = function (callback){
	return this.serviceIDs.map(callback)
}
tenantServices.ServiceRegister.prototype.forEachServiceID = function(callback){
    this.serviceIDs.forEach(callback)
}

tenantServices.ServiceRegister.prototype.forEach = function(callback){
    this.register.forEach(callback)
}

tenantServices.ServiceRegister.prototype.addServiceDocs = async function(docObj){
    let createNewService, serviceID 
    serviceID = docObj.api_doc.service_id
    createNewService = _ => new tenantServices.Service(serviceID, this.tenant)
	try{
		if(!this.register.has(serviceID)){
			let newService = createNewService()
			this.register.set(serviceID, newService)
			this.serviceIDs.push(serviceID)
        }
        let service = this.register.get(serviceID)
        service.addDocumentationSet(docObj.api_doc)
	} catch(err){
		console.log('handle this here')
	}
}

tenantServices.ServiceRegister.prototype.addServiceDefinition = async function(serviceDefinitionObject){
    let serviceID, service
    serviceID = serviceDefinitionObject.id

    try{
        if(!this.register.has(serviceID)) {
            service = new tenantServices.Service(serviceID, this.tenant)
            service.updateDefinition(serviceDefinitionObject)
            this.register.set(serviceID, service)
            this.serviceIDs.push(serviceID)
        }
        service = this.register.get(serviceID)
        log(`updating service "${newServiceObject.name}"(id:${newServiceObject.id}) for tenant ${this.tenant.name}`)
        return service.updateDefinition(serviceDefinitionObject)
    }catch(err){
        console.log(`unhandled error`)
    }
}

tenantServices.ServiceRegister.prototype.addServiceFeatures = async function(features){
    if(this.register.has(features.service)){
        (this.register.get(features.service)).features = features.body.features
    }
    else{
        this.register.set(features.service, {features: features.body.features})
        this.serviceIDs.push(features.service)
    }
}

module.exports = {
    tenantServices
}
