"use strict"

const tenants = require('@src/tenants/tenantsApiRequests').tenants
const log = require('@src/utils').utils.log
const tenantServices = require('@src/tenants/tenantServices').tenantServices
const accounts = require('@src/accounts').accounts

tenants.Tenant.prototype.processAccountInfoResponse = function(clientEmail, promiseResult) {
    if (promiseResult === null) {
        return null
    }
    if (typeof(promiseResult) === 'object' && 'status' in promiseResult && promiseResult.status === "Not found") {
        return null
    }

    if (typeof(promiseResult) === 'object' && 'account' in promiseResult) {
        promiseResult = promiseResult.account
    }
    let newAccount = new accounts.Account(promiseResult.id, clientEmail)
    newAccount.setBasicAccountInfo(promiseResult)
    this.accounts.set(clientEmail, newAccount)
    return newAccount
}

tenants.Tenant.prototype.processSubscriptions = function(applications, email) {
    if (Array.isArray(applications)) { //the promise resolves to an array of applications if successful
        applications.forEach(app => {
            let application = app.application
            this.accounts.get(email).addApplication(application)
        })
    }
    return applications
}


//processes userInfo.json
tenants.Tenant.prototype.getUserInfo = async function(clientEmail) {
    return new Promise((resolve, reject) => {
        this.getAccountInfoPromise(clientEmail)
            .then(x => this.processAccountInfoResponse(clientEmail, x))
            .then(newAccount => this.getTenantSubscriptionKeys(newAccount))
            .then(x => resolve(this.processSubscriptions(x, clientEmail)))
    })
}

module.exports = {
  tenants
}





