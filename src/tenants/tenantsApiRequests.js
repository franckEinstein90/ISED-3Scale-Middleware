"use strict";

const request = require('request')
const tenants = require('@src/tenants').tenants
const parseXML = require('xml2js').parseString
/***********************API Requests******************************* */
const alwaysResolve = function(apiCall, {good, bad}){
	return new Promise((resolve, reject) => {
		request(apiCall, function(err, response, body){
			if(err) return resolve(bad)
			if(response && response.statusCode === 200 && response.statusMessage === "OK"){
				resolve(good(body))	
			}
			else{
				return resolve(bad)
			}
		})
	})
}


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
    let apiCall = this.accountAdminBaseURL.services
    let processGood = function(body){
        return JSON.parse(body).services
    }
	return alwaysResolve(apiCall, {good:processGood,  bad:tenants.codes.serviceUpdateError})
}

tenants.Tenant.prototype.getActiveDocsList = function() {
   let apiCall = this.accountAdminBaseURL.activeDocs
   let processGoodResponse = function(body){
       return JSON.parse(body).api_docs
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

tenants.Tenant.prototype.getValidateAPI = function(serviceID) {
    let apiCall = this.accountAdminBaseURL.apiService(serviceID)
    return new Promise((resolve, reject) => {
        request(apiCall, function(err, response, body) {
            if (err) return resolve(tenants.codes.noApiValidation)
            resolve({
                service: serviceID,
                body: JSON.parse(body)
            })
        })
    })
}

module.exports = {
    tenants
}
