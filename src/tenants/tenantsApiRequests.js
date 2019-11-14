"use strict";

const validator = require('validator')
const error = require('@errors').errors
const request = require('request')
const tenants = require('@src/tenants').tenants
const parseXML = require('xml2js').parseString
const alwaysResolve= require('@src/utils').utils.alwaysResolve
const Application = require('@src/applications').applications.Application
/***********************API Requests******************************* */


tenants.Tenant.prototype.getUserAccount = function(clientEmail){
	let apiCall = [
		`https://${this.adminDomain}/admin/api/`, 
		`accounts/find.json?access_token=${this.accessToken}`, 
		`&email=${encodeURIComponent(clientEmail)}`].join('')

	let bad = null
	let good = function(body){
		if(validator.isJSON(body)){
			let parsedAnswer = JSON.parse(body)
			return parsedAnswer
		}
		return bad
	}
						
	return alwaysResolve(apiCall, {good, bad})
}

tenants.Tenant.prototype.getUserAccountPlan = function(tenantAccount){
    if(tenantAccount === null) return null
    let apiCall = [
        `https://${this.adminDomain}/admin/api/accounts/`, 
        tenantAccount.accountID, 
        `/plan.json?access_token=${this.accessToken}`].join('')
    let bad = null
    let good = function(body){
        if(validator.isJSON(body)){
            let parsedAnswer = JSON.parse(body)
            return parsedAnswer
        }
	return bad 
    }
    return alwaysResolve(apiCall, {good, bad})
}

tenants.Tenant.prototype.getUserAccountSubscriptions = function(tenantAccount) {
    if(tenantAccount === null) return null
    let apiCall = [
		`https://${this.adminDomain}/admin/api/accounts/`, 
        tenantAccount.accountID,
        `/applications.json?access_token=${this.accessToken}` ].join('')

    let bad = null
    let good = function(body){
        if(validator.isJSON(body)){
            let parsedAnswer = JSON.parse(body)
            if('applications' in parsedAnswer) {
                return parsedAnswer.applications.map(
                    applicationInfo => new Application(applicationInfo)
                )}
            return parsedAnswer
        }
        return bad
    }
    return alwaysResolve(apiCall, {good, bad}) 
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
           //logError  
           return tenants.codes.activeDocsUpdateError
       }
   }
   return alwaysResolve(apiCall, {good: processGoodResponse,  bad: tenants.codes.activeDocsUpdateError})
}

tenants.Tenant.prototype.getUserPlans = function(tenantAccount) {
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
