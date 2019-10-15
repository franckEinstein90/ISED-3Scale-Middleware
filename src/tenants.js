/***************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 ***************************************/

"use strict";

const accounts = require('@src/accounts').accounts
const ServiceRegister = require('@src/tenants/tenantServices').tenantServices.ServiceRegister
const tenants = (function() {

    return {
        codes: {
            noAccount: 1,
            noApplications: 2,
            updatedAccountInfo: 3,
            applicationsNotFound: 4,
            serviceNotFound: 5,
            activeDocsNotFound: 6,
            noApiValidation: 7
        },

      
        Tenant: class {

            constructor(tenantJSONInfo) {
                this.name = tenantJSONInfo.name
                this.adminDomain = tenantJSONInfo.admin_domain
                this.domain = tenantJSONInfo.domain
                this.tenantDescription = function(lang) {
                    return (lang === 'en') ? tenantJSONInfo.description_en : tenantJSONInfo.description_fr
                }
                this.accounts = new Map() //indexed by email addresses
                this.services = new ServiceRegister()
                this.accessToken = tenantJSONInfo.access_token
                this.baseURL = `https://${this.adminDomain}/admin/api/`
                this.accountAdminBaseURL = {
                    accounts: `https://${this.adminDomain}/admin/api/accounts/`,
                    services: `https://${this.adminDomain}/admin/api/services.json?access_token=${this.accessToken}`,
                    activeDocs: `${this.baseURL}/active_docs.json?access_token=${this.accessToken}`,
                    apiService: serviceID => `${this.baseURL}/services/${serviceID}/features.json?access_token=${this.accessToken}`,
                    userAccount: email => `${this.baseURL}accounts/find?access_token=${this.accessToken}&email=${encodeURIComponent(email)}`
                }

            }
        }
    }

})()



tenants.Tenant.prototype.processAccountInfoResponse = function(clientEmail, promiseResult) {
    console.log(promiseResult)
    if (promiseResult === tenants.codes.noAccount) {
        console.log(`no accounts for tenant ${this.name}`)
        return promiseResult
    } else {
        console.log(`adding account ${promiseResult.id} to tenant ${this.name}`)
        this.accounts.set(clientEmail, new accounts.Account(promiseResult));
        return this.getTenantSubscriptionKeysForUserPromise({
            userEmail: clientEmail
        })
    }
}

tenants.Tenant.prototype.processSubscriptionKeyInfoResponse = function(promiseResult) {
    if (Array.isArray(promiseResult)) { //the promise resolves to an array of applications if successful
        return this
    }
    return promiseResult
}

tenants.Tenant.prototype.getAccountInfo = async function(clientEmail) {
    return new Promise((resolve, reject) => {
        this.getAccountInfoPromise(clientEmail)
            .then(x => this.processAccountInfoResponse(clientEmail, x))
            .then(x => this.processSubscriptionKeyInfoResponse(x))
            .then(x => resolve(x))
    })
}


tenants.Tenant.prototype.addServices = async function(serviceArray) {
	serviceArray.forEach(
		service => {
		    console.log(`adding service "${service.service.name}"(id:${service.service.id}) to ${this.name}`)
		    this.services.addServiceDefinition(service.service)
	})
	//returns the ids of the services that were added to the tenant
	return serviceArray.map(service => service.service.id)
}

tenants.Tenant.prototype.addDocs = async function(apiDocsArray){
    if(!Array.isArray(apiDocsArray)){ return }
    apiDocsArray.forEach(
        apiDocObject => {
            this.services.addServiceDocs(apiDocObject)
    })
}

tenants.Tenant.prototype.addServiceFeatures = async function(featureDescriptions, servicesIDs){
    if(Array.isArray(featureDescriptions)){
        if(featureDescriptions.length !== servicesIDs.length){
            console.log('problem')
            return
        }
        featureDescriptions.forEach(
            (features, idx) => {
                this.services.addServiceFeatures(features, servicesIDs[idx])
            })

        return
    }
    console.log(featureDescription)
}

tenants.Tenant.prototype.validateAPIs = async function(serviceIDarray){
    let promiseArray = serviceIDarray.map(serviceID => this.requestValidateAPI(serviceID))
    return  Promise.all(promiseArray)
            .then(x => this.addServiceFeatures(x, serviceIDarray))
}

tenants.Tenant.prototype.getUserPlans = async function(userEmail){
    let serviceListingPromise, activeDocsPromise, accountPlans

    serviceListingPromise = new Promise((resolve, reject) => {
        this.requestServiceListing()
	    //get the service list for that tenant
        .then(services => this.addServices(services))
        .then(x => resolve(x))
    })

    activeDocsPromise = new Promise((resolve, reject) => {
        this.requestActiveDocsListing()
            .then(activeDocs => this.addDocs(activeDocs))
            .then(x => resolve(x))
    })

    accountPlans = new Promise((resolve, reject) =>{
        this.requestUserPlan(userEmail)
            .then(result => {
                console.log(result)
                if ((typeof(result) === 'object') && ('id' in result)){
                    this.accounts.set(userEmail, result)
                } 
            })
            .then(x => resolve(x))
    })

    let promiseArray = [serviceListingPromise, activeDocsPromise, accountPlans]
    return Promise.all(promiseArray)
}

tenants.Tenant.prototype.getApiInfo = async function() {
    let promiseArray, serviceListingPromise, activeDocsPromise

    serviceListingPromise = new Promise((resolve, reject) => {
        this.requestServiceListing()
        .then(services => this.addServices(services))
        .then(x => this.validateAPIs(x))
        .then(x => resolve(x))
        .catch(err => console.log(err))
    })

    activeDocsPromise = new Promise((resolve, reject) => {
        this.requestActiveDocsListing()
        .then(activeDocs => this.addDocs(activeDocs))
        .then(x => resolve(x))
        .catch(err => console.log(err))
    })

    //fulfills both promises in paralell
    return Promise.all([serviceListingPromise, activeDocsPromise])

 }




module.exports = {
    tenants
}
