/***************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 ***************************************/

"use strict";

const request = require('request')
const accounts = require('./accounts').accounts

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

    let apiCall = [this.accountAdminAccountBaseURL,
        "find.json?",
        `access_token=${this.accessToken}&`,
        `email=${encodeURIComponent(clientEmail)}`
    ].join('')

    let that = this

    return new Promise((resolve, reject) => {
        request(apiCall, function(err, response, body) {
            if (err) {
                return resolve(`{"status":"Not Found"}`)
            }
            try {
                let accountInfo = JSON.parse(body).account
                that.addAccount({userEmail:clientEmail, accountInfo})
             //////////////   resolve(JSON.parse(body).account)
                let secondRequest = that.getTenantSubscriptionKeysForUserPromise({
                    userEmail:clientEmail
                })
                secondRequest.then(x => console.log(x))
            } catch (e) {
                resolve(e)
            }
        })
    })
}

tenants.Tenant.prototype.getTenantSubscriptionKeysForUserPromise = 
function({ userEmail }) {
    let apiCall, accountID
    if(this.accounts.has(userEmail)){
        accountID = this.accounts.get(userEmail).AccountID
        apiCall = [this.accountAdminAccountBaseURL,
            accountID,
            `/applications.json?access_token='${this.accessToken}'`
        ].join('')
    
        return new Promise((resolve, reject) => {
            request(apiCall, function(err, response, body) {  
                let info = JSON.parse(body)
                console.log(info)
            })
        })
    }
}

tenants.Tenant.prototype.addAccount = function({
    userEmail,
    accountInfo
}) {
    this.accounts.set(userEmail, new accounts.Account(accountInfo));
}


module.exports = {
    tenants
}
