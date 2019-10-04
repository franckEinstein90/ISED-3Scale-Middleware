"use strict";
const request = require('request')
//const accounts = require('./accounts').accounts

const tenants = (function() {

    return {

        Tenant: class {

            constructor(tenantJSONInfo) {
                this.name = tenantJSONInfo.name
                this.adminDomain = tenantJSONInfo.admin_domain
                this.domain = tenantJSONInfo.domain
                this.description = {
                    en: tenantJSONInfo.description_en,
                    fr: tenantJSONInfo.description_fr
                }
                this.accounts = new Map() //indexed by email addresses
                this.accountAdminAccountBaseURL = `https://${this.adminDomain}/admin/api/accounts/`
                this.accessToken = tenantJSONInfo.access_token
            }
        }
    }

})()

tenants.Tenant.prototype.getAccountInfoPromise = function(clientEmail) {
    //returns a promise that gets the user info from the api

    let newAccount, apiCall, apiCallOptions;
    let that = this;

    apiCall = [this.accountAdminAccountBaseURL,
        "find.json?",
        `access_token=${this.accessToken}&`,
        `email=${encodeURIComponent(clientEmail)}`
    ].join('')


    return new Promise((resolve, reject) => {
        request(apiCall, function(err, response, body) {
            if (err) {
                return resolve(`{"status":"Not Found"}`)
            }
            try {
                resolve(JSON.parse(body).account)
            } catch (e) {
                resolve(e)
            }
        })
    })
}

tenants.Tenant.prototype.getTenantSubscriptionKeysForUserPromise = function({
    userEmail
}) {
    let apiCall, accountID
    accountID = (this.accounts.has(userEmail)) ? this.accounts.get(userEmail).id : NaN
    if (!NaN(accountID)) {
        apiCall = [this.accountAdminAccountBaseURL,
            accountID,
            `/applications.json?access_token='${this.accessToken}'`
        ].join()
    }
    return new Promise((resolve, reject) => {
	    if(NaN(accountID)) {resolve(`{"status":"Not Found"}`)}
	    else{
		resolve("valid"); 
	    }
    })
}

tenants.Tenant.prototype.addAccount = function(email, accountInfo) {
    this.accounts.set(email, accountInfo.account);
}


module.exports = {
    tenants
}
