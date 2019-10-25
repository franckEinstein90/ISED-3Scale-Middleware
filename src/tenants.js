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
    let newAccount = new accounts.Account(promiseResult.id, clientEmail)
    newAccount.setBasicAccountInfo(promiseResult)
    this.accounts.set(clientEmail, newAccount)
    return newAccount 
}

tenants.Tenant.prototype.processSubscriptions = function(applications, email) {
    if (Array.isArray(applications)) { //the promise resolves to an array of applications if successful
	 	applications.forEach(app => {
			let application = app.application
			this.accounts.get(email).addApplication(application)
		})
   }
   return applications
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
    return apiDocsArray.map( apiDocObject => this.services.addServiceDocs(apiDocObject)) 
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
    let promiseArray = this.services.mapIDs(
				serviceID => this.getValidateAPI(serviceID))
    return Promise.all(promiseArray)
        .then(x => this.addServiceFeatures(x))
}


//processes userInfo.json
tenants.Tenant.prototype.getUserInfo = async function(clientEmail) {
	return new Promise((resolve, reject) => {
   	this.getAccountInfoPromise(clientEmail)
      .then(x => this.processAccountInfoResponse(clientEmail, x))
	   .then(newAccount => this.getTenantSubscriptionKeys(newAccount))
      .then(x => resolve(this.processSubscriptions(x, clientEmail)))
    })
}


tenants.Tenant.prototype.getAccountPlan = function(planInfo, userEmail){
    if(this.name === "ised-isde") debugger
    //creates a new account object for userEmail 
    // and associates it with its plan ids
    let accountID, newAccount, planIDs
    if(planInfo === null) return null
    accountID = planInfo.account.id[0]
    newAccount = new accounts.Account(accountID, userEmail)
	 //within the plans included with this user, 
    this.accounts.set(userEmail, newAccount)
	 //only one has a plan of type "account_plan"
	 //that's the one we need
	 let accountPlan =  planInfo.account.plans[0].plan.filter(plan => plan.type[0] === "account_plan")[0]
//    planIDs = planInfo.account.plans[0].plan.map(plan => plan.id[0])
 //   newAccount.associatePlans(planIDs)
	return accountPlan
	//at this point, we only care abou tthe plan that has type: account_plan
	//1. get that account info
	//2. get the features for that account
	//so for 161, get feature 31, once that's in: 
	//extract the system name (in this case gc-internal)
	//k
}

tenants.Tenant.prototype.checkAccountPlanFeatures = async function(userEmail, accountPlan) {   
	//fetches and process the features of all the plans this
	 let processPlanFeatures = function(features){
		console.log(features)
	 }
	 if(accountPlan === null) return null
    if(this.name === "ised-isde") debugger
	 let planID = accountPlan.id[0]
	 this.getTenantPlanFeatures(planID)
	 .then(features => processPlanFeatures(features))

	//account has access to
	console.log('here')
/*	let verifyPlanIDForUser = function(planID){
		console.log("here")
	}
	if(this.accounts.has(userEmail)){
		let planIDs = this.accounts.get(userEmail).plans
	   let planFeatures = planIDs.map(planID => this.getTenantPlanFeatures(planID))
	   Promise.all(planFeatures)
			  .then(x => verifyPlanIDForUser(x))
						 //.plans.map(this.getTenantPlanFeatures)
	}	*/
}

tenants.Tenant.prototype.getUserApiInfo= async function(userEmail) {   
    
    let accountPlans = new Promise((resolve, reject) => {
        this.getUserPlans(userEmail)
        .then(result => this.getAccountPlan(result, userEmail))
		  .then(accountPlan => this.checkAccountPlanFeatures(userEmail, accountPlan))
               /* console.log(result)
                if ((typeof(result) === 'object') && ('id' in result)) {
                    this.accounts.set(userEmail, result)
                }
            }*/
            .then(x => resolve(x))
    })

}

tenants.Tenant.prototype.getApiInfo = async function() {

    let promiseArray, serviceListingPromise, activeDocsPromise
    serviceListingPromise = new Promise((resolve, reject) => {
        this.getServiceList()
            .then(services => resolve(this.addServices(services)))
            .catch(err => console.log('197'))
    })

    activeDocsPromise = new Promise((resolve, reject) => {
        this.getActiveDocsList()
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
