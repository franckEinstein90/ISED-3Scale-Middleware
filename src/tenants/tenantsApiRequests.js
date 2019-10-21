"use strict";

const request = require('request')
const tenants = require('@src/tenants').tenants
const parseXML = require('xml2js').parseString
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

tenants.Tenant.prototype.getTenantSubscriptionKeysForUserPromise = function({
    userEmail
}) {
    let apiCall, accountID, that
    that = this

    if (this.accounts.has(userEmail)) {
        accountID = this.accounts.get(userEmail).AccountID
        apiCall = [this.accountAdminBaseURL.accounts,
            accountID,
            `/applications.json?access_token=${this.accessToken}`
        ].join('')

        return new Promise((resolve, reject) => {
            request(apiCall, function(err, response, body) {
                if (err) {
                    resolve(`{"status":"Not Found"}`)
                }
                try {
                    let applications = JSON.parse(body).applications
                    if (applications.length === 0) {
                        console.log(`found no applications for ${that.name}`)
                        resolve(tenants.codes.applicationsNotFound)
                    } else {
                        //add the applications to the correspnding accont
                        console.log(`found ${applications.length} applications for ${that.name}`)
                        applications.forEach(application =>
                            that.accounts.get(userEmail).addApplication(application))
                        resolve(applications)
                    }
                } catch (e) {
                    resolve(e)
                }
            })
        })
    }
}

tenants.Tenant.prototype.requestServiceListing = function() {
    let apiCall = this.accountAdminBaseURL.services
    return new Promise((resolve, reject) => {
        request(apiCall, function(err, response, body) {
            if (err)  return resolve([])
            resolve(JSON.parse(body).services)
        })
    })
}

tenants.Tenant.prototype.requestActiveDocsListing = function() {
    let apiCall = this.accountAdminBaseURL.activeDocs
    return new Promise((resolve, reject) => {
        request(apiCall, function(err, response, body) {
            if (err) return resolve(tenants.codes.activeDocsNotFound)
            resolve(JSON.parse(body).api_docs)
        })
    })
}

tenants.Tenant.prototype.requestUserPlan = function(userEmail){
    let apiCall = this.accountAdminBaseURL.userPlans(userEmail)
    //Note: 
    //1. This is a different call than the userAccount call
    //2. This call returns xml as opposed to JSON
    return new Promise((resolve, reject)=>{
        request(apiCall, function(err, response, body){
            let jsonResult
            if(err) return resolve(null)
            if(body === "") return resolve(null)
            parseXML(body, function(err, result){
                jsonResult = result
            })
            resolve(jsonResult)
        })
    })
}

tenants.Tenant.prototype.requestValidateAPI = function(serviceID) {
    let apiCall = this.accountAdminBaseURL.apiService(serviceID)
    return new Promise((resolve, reject) => {
        request(apiCall, function(err, response, body) {
            if (err) return resolve(tenants.codes.noApiValidation)
            resolve({service: serviceID, body: JSON.parse(body)})
        })
    })
}

module.exports = {
    tenants
}
