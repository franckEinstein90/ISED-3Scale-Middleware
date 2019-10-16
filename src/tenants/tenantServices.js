"use strict"; 

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
            }
        }
    }
})()

tenantServices.Service.prototype.updateDefinition = function(defObj){
    console.log("here")
    if(typeof(defObj) === 'object' && 'id' in defObj && defObj.id === this.id){
        Object.assign(this, defObj) 
    }
}

tenantServices.Service.prototype.addDocs = function(docObj){

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
        (this.register.get(serviceID)).updateDefinition(serviceDefinitionObject)
    }
    else{
        this.serviceIDs.push(serviceID)
        let newServiceObject = new tenantServices.Service(serviceID, this.tenant)
        newServiceObject.updateDefinition(serviceDefinitionObject)
        this.register.set(serviceID, newServiceObject) 
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
