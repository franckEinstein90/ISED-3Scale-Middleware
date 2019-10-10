/***************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 ***************************************/

"use strict";

const request = require('request')
const accounts = require('@src/accounts').accounts

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
                this.services = []
                this.accessToken = tenantJSONInfo.access_token
                this.baseURL = `https://${this.adminDomain}/admin/api/`
                this.accountAdminBaseURL = {
                    accounts: `https://${this.adminDomain}/admin/api/accounts/`,
                    services: `https://${this.adminDomain}/admin/api/services.json?access_token=${this.accessToken}`,
                    apiDocs: `${this.baseURL}/active_docs.json?access_token=${this.accessToken}`,
                    apiService: function(serviceID) {
                        return `${this.baseURL}/services/${serviceID}/features.json?access_token=${this.accessToken}`
                    }
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

tenants.Tenant.prototype.processApiInfoResponse = async function(promiseResult) {
    let that = this;
    this.getActiveDocsPromise()
        .then(function(x) {
            that
            console.log(x)
        })
}

tenants.Tenant.prototype.getApiInfo = async function() {

    return new Promise((resolve, reject) => {
        this.getApisPromise()
            .then(x => this.processApiInfoResponse(x))
            //  .then(apiDocs => this.processApiDocs(x))
            .then(x => resolve(x))
        /*    this.getApisPromise()
             .then( function (result){
                 console.log(result)
             })*/
    })
}

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

tenants.Tenant.prototype.getApisPromise = function() {
    let apiCall = this.accountAdminBaseURL.services
    let that = this
    return new Promise((resolve, reject) => {
        request(apiCall, function(err, response, body) {
            if (err) {
                resolve(tenants.codes.serviceNotFound)
            }
            try {
                let services = JSON.parse(body).services
                services.forEach(service => that.services.push(service))
                resolve(services)
            } catch (e) {
                resolve(e)
            }
        })
    })
}

tenants.Tenant.prototype.getActiveDocsPromise = function() {
    let apiCall = this.accountAdminBaseURL.apiDocs
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

tenants.Tenant.prototype.validateAPI = function() {
    let apiCall = this.accountAdminBaseURL.apiServices(serviceID)
    return new Promise((resolve, reject) => {
        request(apiCall, function(err, response, body) {
            if (err) {
                resolve(tenants.codes.noApiValidation)
            }
        })
    })
}
module.exports = {
    tenants
}