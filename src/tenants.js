/***************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 ***************************************/

"use strict";
const utils = require('@src/utils').utils
const errHandle = require('@errors').errors.errorHandler
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

            constructor(tenantJSONInfo, env) {
                this.env = env
                this.name = tenantJSONInfo.name
                this.maintainers = function(lang) {
                    let maintainerObject = {
                        email: "ic.api_store-magasin_des_apis.ic@canada.ca",
                        url: "https://api.canada.ca",
                        fn: utils.langMsg(lang, {
                            fr: "Equipe du magasin API",
                            en: "GC API Store Team"
                        })
                    }
                    return maintainerObject
                }

                this.apiDescriptions = function(language) {

                    let listOfApis = []
                    this.services.register.forEach(
                        (service, serviceID) => {
                            //checks if there is a valid set of documentation 
                            //attached to this service
                            let apiDesc = service.outputAPIDescription(language)
                            if (apiDesc) listOfApis.push(apiDesc)
                        }
                    )
                    return listOfApis
                }
                this.adminDomain = tenantJSONInfo.admin_domain
                this.domain = tenantJSONInfo.domain
                this.tenantDescription = function(lang) {
                    return (lang === 'en') ? tenantJSONInfo.description_en : tenantJSONInfo.description_fr
                }
                this.accounts = new Map() //indexed by email addresses
                this.services = new ServiceRegister(this)
                this.accessToken = tenantJSONInfo.access_token
                this.baseURL = `https://${this.adminDomain}/admin/api/`
                this.accountAdminBaseURL = {
                    accounts: `https://${this.adminDomain}/admin/api/accounts/`,
                    services: `https://${this.adminDomain}/admin/api/services.json?access_token=${this.accessToken}`,
                    activeDocs: `${this.baseURL}/active_docs.json?access_token=${this.accessToken}`,
                    apiService: serviceID => `${this.baseURL}services/${serviceID}/features.json?access_token=${this.accessToken}`,
                    userAccount: email => `${this.baseURL}accounts/find.json?access_token=${this.accessToken}&email=${encodeURIComponent(email)}`, 
                    userPlans: email => `${this.baseURL}accounts/find?access_token=${this.accessToken}&email=${encodeURIComponent(email)}`
                }
            }
        }
    }

})()



tenants.Tenant.prototype.processAccountInfoResponse = function(clientEmail, promiseResult) {
    console.log(promiseResult)
    if (promiseResult === null) {
        return null
    } 
    if (typeof(promiseResult) ==='object' && 'status' in promiseResult && promiseResult.status === "Not found")
    {
        return null
    }
    
    if (typeof(promiseResult) === 'object' && 'account' in promiseResult){
        promiseResult = promiseResult.account
    }

    console.log(`adding account ${promiseResult.id} to tenant ${this.name}`)
    this.accounts.set(clientEmail, new accounts.Account(promiseResult));
    return this.getTenantSubscriptionKeysForUserPromise({userEmail: clientEmail})
}

tenants.Tenant.prototype.processSubscriptionKeyInfoResponse = function(subscriptions, email) {
    if (Array.isArray(subscriptions)) { //the promise resolves to an array of applications if successful
        let accountApplications = this.accounts.get(email).applications
        subscriptions.forEach(
            function(application) {
                let accountApplication = accountApplications.find(x => x.id === application.application.id)
                accountApplication.enabled = application.application.enabled
                accountApplication.end_user_required = application.application.end_user_required
                accountApplication.plan_id = application.application.plan_id
                accountApplication.provider_verification_key = application.application.provider_verification_key
            })
        return this
    }
    return subscriptions
}




tenants.Tenant.prototype.addServices =async function(serviceArray) {

        let resultArray = serviceArray.map(
            service => this.services.addServiceDefinition(service.service)
        )
        //returns the ids of the services that were added to the tenant
        return resultArray
    }

tenants.Tenant.prototype.addDocs = async function(apiDocsArray) {

    if (!Array.isArray(apiDocsArray)) {
        return
    }
    let resultArray = apiDocsArray.map(
        apiDocObject => this.services.addServiceDocs(apiDocObject)
    )
    return resultArray
}

tenants.Tenant.prototype.addServiceFeatures = async function(featureDescriptions) {
    if (Array.isArray(featureDescriptions)) {
        if (featureDescriptions.length !== this.services.length()) {
            console.log('problem')
            return
        }
        featureDescriptions.forEach(features => this.services.addServiceFeatures(features))
        return 'done'
    }
    console.log(featureDescription)
}

tenants.Tenant.prototype.validateAPIs = async function() {
    let promiseArray = this.services.mapIDs(serviceID => this.requestValidateAPI(serviceID))
    return Promise.all(promiseArray)
        .then(x => this.addServiceFeatures(x))
}


//processes userInfo.json
tenants.Tenant.prototype.getUserInfo = async function(clientEmail) {
        return new Promise((resolve, reject) => {
            this.getAccountInfoPromise(clientEmail)
                .then(x => this.processAccountInfoResponse(clientEmail, x))
                .then(x => this.processSubscriptionKeyInfoResponse(x, clientEmail))
                .then(x => resolve(x))
        })
    }


tenants.Tenant.prototype.processUserPlan = function(planInfo, userEmail){
    console.log(planInfo)
    if(planInfo === null) return
    let accountID = planInfo.account.id[0]
    this.accounts.set(userEmail, new accounts.Account(accountID))
    console.log('here')
}
tenants.Tenant.prototype.getUserPlans = async function(userEmail) {   
    
    let accountPlans = new Promise((resolve, reject) => {
        this.requestUserPlan(userEmail)
            .then(result => this.processUserPlan(result, userEmail)
               /* console.log(result)
                if ((typeof(result) === 'object') && ('id' in result)) {
                    this.accounts.set(userEmail, result)
                }
            }*/)
            .then(x => resolve(x))
    })

}

tenants.Tenant.prototype.getApiInfo = async function() {

    let promiseArray, serviceListingPromise, activeDocsPromise
    serviceListingPromise = new Promise((resolve, reject) => {
        this.requestServiceListing()
            .then(services => resolve(this.addServices(services)))
            .catch(err => errHandle.log(err))
    })

    activeDocsPromise = new Promise((resolve, reject) => {
        this.requestActiveDocsListing()
            .then(activeDocs => resolve(this.addDocs(activeDocs)))
            .catch(err => errHandle(err))
    })

    //fulfills both promises in paralell
    return Promise.all([serviceListingPromise, activeDocsPromise])
        .then(x => this.validateAPIs())
        .catch(err => {
            console.log(err) //error updating tenant services
        })
}






module.exports = {
    tenants
}
