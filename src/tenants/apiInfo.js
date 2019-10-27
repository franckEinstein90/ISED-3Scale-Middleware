"use strict"
const tenants = require('@src/tenants/tenantsApiRequests').tenants
const log = require('@src/utils').utils.log

tenants.Tenant.prototype.updateServices =async function(serviceArray) {
    let resultArray
    if(serviceArray ===  tenants.codes.serviceUpdateError){
       log(`Error updating services for ${this.name}`) 
       return tenants.codes.serviceUpdateError
    }
    log(`updating ${serviceArray.length} service definitions for ${this.name}`)
    resultArray = serviceArray.map(
         service => this.services.addServiceDefinition(service.service)
    )
        //returns the ids of the services that were added to the tenant
    return tenants.codes.serviceUpdateOK 
}

tenants.Tenant.prototype.getApiInfo = async function() {

    let promiseArray, serviceListingPromise, activeDocsPromise
    serviceListingPromise = new Promise((resolve, reject) => {
        this.getServiceList()
        .then(services => resolve(this.updateServices(services)))
    })

/*    activeDocsPromise = new Promise((resolve, reject) => {
        this.getActiveDocsList()
            .then(activeDocs => resolve(this.addDocs(activeDocs)))
            .catch(err => errHandle(err))
    })*/

    //fulfills both promises in paralell
    return Promise.all([serviceListingPromise, /*activeDocsPromise*/])
//        .then(x => this.validateAPIs())
        .catch(err => {
            console.log(err) //error updating tenant services
        })
}






module.exports = {
  tenants
}