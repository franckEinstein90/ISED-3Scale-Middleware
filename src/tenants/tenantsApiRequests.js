"use strict";

const request = require('request')
const tenants = require('@src/tenants').tenants
/***********************API Requests******************************* */

tenants.Tenant.prototype.getAccountInfoPromise = function(clientEmail) {
    //returns a promise that gets the user info from the api

    let apiCall = [
        this.accountAdminBaseURL.accounts,
        "find.json?",
        `access_token=${this.accessToken}&`,
        `email=${encodeURIComponent(clientEmail)}`
    ].join('')


    return new Promise((resolve, reject) => {
        request(apiCall, function(err, response, body) {
            if (err) {
                resolve(`{"status":"Not Found"}`)
            }
            try {
                let result = JSON.parse(body)
                if ('status' in result) {
                    resolve(tenants.codes.noAccount)
                } else {
                    let accountInfo = JSON.parse(body).account
                    resolve(accountInfo)
                }
            } catch (e) {
                resolve(e)
            }
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

tenants.Tenant.prototype.requestServiceList = function() {
    let apiCall = this.accountAdminBaseURL.services
    return new Promise((resolve, reject) => {
        request(apiCall, function(err, response, body) {
            if (err) {
                resolve([])
            }
            try {
                resolve(JSON.parse(body).services)
            } catch (e) {
                resolve(e)
            }
        })
    })
}

tenants.Tenant.prototype.requestActiveDocsListing = function() {
    let apiCall = this.accountAdminBaseURL.activeDocs
    return new Promise((resolve, reject) => {
        request(apiCall, function(err, response, body) {
            if (err) {
                resolve(tenants.codes.activeDocsNotFound)
            }
            try {
                let activeDocs = JSON.parse(body).api_docs
                resolve(activeDocs)

            } catch (e) {
                resolve(e)
            }

        })
    })
}
/*
'https://' 
 tenantWithResource.admin_domain 
 '/admin/api/services/' 
 api.service.id 
 '/features.json?access_token=' + tenantWithResource.access_token;
 */
tenants.Tenant.prototype.requestValidateAPI = function(serviceID) {
    let apiCall = this.accountAdminBaseURL.apiService(serviceID)
    return new Promise((resolve, reject) => {
        request(apiCall, function(err, response, body) {
            if (err) {
                resolve(tenants.codes.noApiValidation)
            }
            try {
                let apiValidation = JSON.parse(body)
                resolve(apiValidation)
            } catch (e) {
                resolve(e)
            }
        })
    })
}

module.exports = {
    tenants
}
