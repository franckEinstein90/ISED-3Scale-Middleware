"use strict"; 

const tenantServices = (function(){

    return{
        ServiceRegister: class{
            constructor(){
                this.register = new Map() //(serviceID => (serviceDef x serviceDoc))
            }
        }

    }
})()


tenantServices.ServiceRegister.prototype.forEach = function(callback){
    this.register.forEach(callback)
}

tenantServices.ServiceRegister.prototype.addServiceDocs = async function(docObj){
    let serviceID = docObj.api_doc.service_id
    if(this.register.has(serviceID)){
        (this.register.get(serviceID)).serviceDocumentation = docObj.api_doc
    }
    else{
        this.register.set(serviceID, {serviceDocumentation: docObj.api_doc})
    }
}

tenantServices.ServiceRegister.prototype.addServiceDefinition = async function(serviceDefinitionObject){
    let serviceID = serviceDefinitionObject.id
    if(this.register.has(serviceID)){
        (this.register.get(serviceID)).serviceDefinition = serviceDefinitionObject
    }
    else{
        this.register.set(serviceID, {serviceDefinition: serviceDefinitionObject})
    }
}

tenantServices.ServiceRegister.prototype.addServiceFeatures = async function(features, serviceID){
    if(this.register.has(serviceID)){
        (this.register.get(serviceID)).features = features.features
    }
    else{
        this.register.set(serviceID, {features: features.features})
    }
}

module.exports = {
    tenantServices
}