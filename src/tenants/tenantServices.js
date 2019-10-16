"use strict"; 

const tenantServices = (function(){

    return{
        ServiceRegister: class{
            constructor(){
                this.serviceIDs = []
                this.register = new Map() //(serviceID => (serviceDef x serviceDoc))
            }
        }

    }
})()

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
    let serviceID = docObj.api_doc.service_id
    if(this.register.has(serviceID)){
        (this.register.get(serviceID)).serviceDocumentation.push(docObj.api_doc)
    }
    else{
        this.serviceIDs.push(serviceID)
        this.register.set(serviceID, {serviceDocumentation: [docObj.api_doc]})
    }
}

tenantServices.ServiceRegister.prototype.addServiceDefinition = async function(serviceDefinitionObject){
    let serviceID = serviceDefinitionObject.id
    if(this.register.has(serviceID)){
        (this.register.get(serviceID)).serviceDefinition = serviceDefinitionObject
    }
    else{
        this.serviceIDs.push(serviceID)
        this.register.set(serviceID, {serviceDefinition: serviceDefinitionObject})
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
