"use strict";

const validator = require('validator')
const request = require('request')
const tenants = require('@src/tenants').tenants
const parseXML = require('xml2js').parseString
const alwaysResolve= require('@src/utils').utils.alwaysResolve
/***********************API Requests******************************* */

tenants.Tenant.prototype.getAccountInfoPromise = function(clientEmail) {
    //returns a promise that gets the user info from the api
    let apiCall = this.accountAdminBaseURL.userAccount(clientEmail)

    return new Promise((resolve, reject) => {
        request(apiCall, function(err, response, body) {
            if (err) return resolve(null)

            let result = JSON.parse(body)
            if ('status' in result) return resolve(null)
            resolve(JSON.parse(body).account)
        })
    })
}

tenants.Tenant.prototype.getTenantSubscriptionKeys = function(userAccount) {
    if (userAccount === null) return null

    let apiCall = [this.accountAdminBaseURL.accounts,
        userAccount.accountID,
        `/applications.json?access_token=${this.accessToken}`
    ].join('')

    return new Promise((resolve, reject) => {
        request(apiCall, function(err, response, body) {
            if (err) return resolve(null)
            let callResult
            try {
                callResult = JSON.parse(body)
            } catch (err) {
                return resolve(null)
            }
            if (typeof(callResult) === 'object' && 'status' in callResult) return resolve(null)
            if (!('applications' in callResult)) return resolve(null)
            resolve(callResult.applications)
        })
    })
}


tenants.Tenant.prototype.getServiceList = function() {
    let apiCall = [`https://${this.adminDomain}/admin/api/`, 
                    `services.json?access_token=${this.accessToken}`].join('')

    let processGood = function(body){
        if(validator.isJSON(body)) {
            let apis = JSON.parse(body).services
            return apis
        }
        return tenants.codes.serviceUpdateError
    }
    return alwaysResolve(apiCall, {
	    	good:processGood,  
		bad:tenants.codes.serviceUpdateError
    })
}

tenants.Tenant.prototype.getActiveDocsList = function() {
   let apiCall = this.accountAdminBaseURL.activeDocs
   let processGoodResponse = function(body){
       if(validator.isJSON(body)){
            return JSON.parse(body).api_docs
       }else{
           return tenants.codes.activeDocsUpdateError
       }
   }
   return alwaysResolve(apiCall, {good: processGoodResponse,  bad: tenants.codes.activeDocsUpdateError})
}

tenants.Tenant.prototype.getUserPlans = function(userEmail) {
    //Note: 
    //1. This is a different call than the userAccount call
    //2. This call returns xml as opposed to JSON
    let apiCall = this.accountAdminBaseURL.userPlans(userEmail)
	 let processGoodResponse = function(body){
		let jsonResult
		parseXML(body, function(err, result){
			jsonResult = result
		})
		return jsonResult 
	 }

	 return alwaysResolve(apiCall, {good: processGoodResponse, bad: null})
}

tenants.Tenant.prototype.getTenantPlanFeatures = function(planID){
   let apiCall = [this.baseURL, 
		  `account_plans/${planID}/features.json?`, 
		  `access_token=${this.accessToken}`].join('')
	let processGoodResponse = function(body){
		return JSON.parse(body).features
	}
   return alwaysResolve(apiCall, {good: processGoodResponse, bad: null})
}



module.exports = {
    tenants
}
