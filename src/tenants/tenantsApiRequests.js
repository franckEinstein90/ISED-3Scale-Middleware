"use strict";

const utils = require('@src/utils').utils
const request = require('request')
const tenants = require('@src/tenants').tenants
const parseXML = require('xml2js').parseString
/***********************API Requests******************************* */


const alwaysResolveRequest = function(apiCall, {bad, good}){
    return new Promise((resolve, reject) => {
        request(apiCall, function(err, response, body) {

        })
    })
}


tenants.Tenant.prototype.getAccountInfo = function(clientEmail) {
    //returns a promise that gets the user info from the api
    let apiCall = this.accountAdminBaseURL.userAccount(clientEmail)
    return alwaysResolveRequest(apiCall,
            {
                bad: null, 
                good: body => JSON.parse(body).account
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
    return alwaysResolveRequest(apiCall)
}
/*
tenants.Tenant.prototype.getServiceList = function() {
    let apiCall = this.accountAdminBaseURL.services
    return new Promise((resolve, reject) => {
        request(apiCall, function(err, response, body) {
            if (err) return resolve([])
            resolve(JSON.parse(body).services)
        })
    })
}
*/
tenants.Tenant.prototype.getActiveDocsListing = function() {
    let apiCall = this.accountAdminBaseURL.activeDocs
    return new Promise((resolve, reject) => {
        request(apiCall, function(err, response, body) {
            if (err) return resolve(tenants.codes.activeDocsNotFound)
            resolve(JSON.parse(body).api_docs)
        })
    })
}

tenants.Tenant.prototype.getUserPlan = function(userEmail) {
    let apiCall = this.accountAdminBaseURL.userPlans(userEmail)
    //Note: 
    //1. This is a different call than the userAccount call
    //2. This call returns xml as opposed to JSON
    return new Promise((resolve, reject) => {
        request(apiCall, function(err, response, body) {
            let jsonResult
            if (err) return resolve(null)
            if (body === "") return resolve(null)
            parseXML(body, function(err, result) {
                jsonResult = result
            })
            resolve(jsonResult)
        })
    })
}

tenants.Tenant.prototype.getTenantPlanFeatures = function(planID){
   let apiCall = [this.baseURL, 
		  `account_plans/${planID}/features.json?`, 
		  `access_token=${this.accessToken}`].join('')

   return new Promise((resolve, reject) => {
      request(apiCall, function(err, response, body){
	 if(err) return resolve(null)
	 console.log('here')
      })
   })
}

tenants.Tenant.prototype.validateAPI = function(serviceID) {
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
