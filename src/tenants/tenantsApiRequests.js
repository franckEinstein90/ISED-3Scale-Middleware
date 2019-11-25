"use strict";

const validator = require('validator')
const errors = require('@errors').errors
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


tenants.Tenant.prototype.getServiceList = function( tenantUpdateReport = null ) {

    let apiCall = [`https://${this.adminDomain}/admin/api/`, 
                    `services.json?access_token=${this.accessToken}`].join('')

    let bad = tenants.codes.serviceUpdateError
    let good = function(body){
        if(validator.isJSON(body)) {
            let apis = JSON.parse(body).services
            if(tenantUpdateReport) {
                tenantUpdateReport.serviceListUpdate = errors.codes.Ok
            }
            return apis
        }
        return bad
    }

    return alwaysResolve(apiCall, {good, bad})
}

tenants.Tenant.prototype.getActiveDocsList = function(tenantUpdateReport = null) {
   let apiCall = this.accountAdminBaseURL.activeDocs
   let bad = tenants.codes.activeDocsUpdateError 
   let processGoodResponse = function(body){
       if(validator.isJSON(body)){
           let apiDocs = JSON.parse(body).api_docs
           if(tenantUpdateReport){
                tenantUpdateReport.activeDocsUpdate = errors.codes.Ok
           }
          return apiDocs 
       }
       return bad //couldn't parse response
    }
   
   return alwaysResolve(apiCall, {good: processGoodResponse,  bad})
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
