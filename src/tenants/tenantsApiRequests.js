/*******************************************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * 2019-2020
 * --------------------------------------------------
 *  Module tenantsApiRequests.js
 * --------------------------------------------------
 *  functions that retrieve various tenant information
 *  through the rest APIs of various related system 
 ******************************************************************************/
"use strict"

/*****************************************************************/
const validator = require('validator')
const parseXML = require('xml2js').parseString
/*****************************************************************/
const errors = require('@errors').errors
const tenants = require('@tenants/tenantsFirst').tenants
const alwaysResolve = require('@utils/alwaysResolve').alwaysResolve
const Application = require('@src/applications/applications').applications.Application

/***********************API Requests******************************* */
tenants.Tenant.prototype.getUserAccount = function(clientEmail) {
    let apiCall = [
        `https://${this.adminDomain}/admin/api/`,
        `accounts/find.json?access_token=${this.accessToken}`,
        `&email=${encodeURIComponent(clientEmail)}`
    ].join('')

    let bad = null
    let good = function(body) {
        if (validator.isJSON(body)) {
            let parsedAnswer = JSON.parse(body)
            return parsedAnswer
        }
        return bad
    }

    return alwaysResolve(apiCall, {
        good,
        bad
    })
}

tenants.Tenant.prototype.getUserAccountPlan = function(tenantAccount) {
    if (tenantAccount === null) return null
    let apiCall = [
        `https://${this.adminDomain}/admin/api/accounts/`,
        tenantAccount.accountID,
        `/plan.json?access_token=${this.accessToken}`
    ].join('')
    let bad = null
    let good = function(body) {
        if (validator.isJSON(body)) {
            let parsedAnswer = JSON.parse(body)
            return parsedAnswer
        }
        return bad
    }
    return alwaysResolve(apiCall, {
        good,
        bad
    })
}

tenants.Tenant.prototype.getUserAccountSubscriptions = function(tenantAccount) {
    if (tenantAccount === null) return null
    let apiCall = [
        `https://${this.adminDomain}/admin/api/accounts/`,
        tenantAccount.accountID,
        `/applications.json?access_token=${this.accessToken}`
    ].join('')

    let bad = null
    let good = function(body) {
        if (validator.isJSON(body)) {
            let parsedAnswer = JSON.parse(body)
            if ('applications' in parsedAnswer) {
                return parsedAnswer.applications.map(
                    applicationInfo => new Application(applicationInfo)
                )
            }
            return parsedAnswer
        }
        return bad
    }
    return alwaysResolve(apiCall, {
        good,
        bad
    })
}

tenants.Tenant.prototype.getActiveDocsList = function(tenantUpdateReport = null) {
    let apiCall = this.accountAdminBaseURL.activeDocs

    let bad = tenants.codes.activeDocsUpdateError

    let processGoodResponse = function(body) {
        if (validator.isJSON(body)) {
            let apiDocs = JSON.parse(body).api_docs
            if (tenantUpdateReport) {
                tenantUpdateReport.fetches.activeDocs = errors.codes.Ok
            }
            return apiDocs
        }
        return bad //couldn't parse response
    }

    return alwaysResolve(apiCall, {
        good: processGoodResponse,
        bad
    })
}

tenants.Tenant.prototype.getUserPlans = function(tenantAccount) {
    //Note: 
    //1. This is a different call than the userAccount call
    //2. This call returns xml as opposed to JSON
    let apiCall = this.accountAdminBaseURL.userPlans(userEmail)
    let processGoodResponse = function(body) {
        let jsonResult
        parseXML(body, function(err, result) {
            jsonResult = result
        })
        return jsonResult
    }

    return alwaysResolve(apiCall, {
        good: processGoodResponse,
        bad: null
    })
}
/*******************************************************************************
 * Plans and Features
 ******************************************************************************/
tenants.Tenant.prototype.getTenantPlanFeatures = function(planID) {
    let apiCall = [this.baseURL,
        `account_plans/${planID}/features.json?`,
        `access_token=${this.accessToken}`
    ].join('')
    let processGoodResponse = function(body) {
        return JSON.parse(body).features
    }
    return alwaysResolve(apiCall, {
        good: processGoodResponse,
        bad: null
    })
}


tenants.Tenant.prototype.getAccountUsers = function(accountID, returnMap) {
    let apiCall = [`https://${this.adminDomain}/admin/api/`,
        `accounts/${accountID}/users.json?access_token=${this.accessToken}`
    ].join('')

    let bad = null
    let processGoodResponse = function(body) {
        if (validator.isJSON(body)) {
            let users = JSON.parse(body)
            users.users.forEach(usr => {
                let user = usr.user
                if (!returnMap.has(user.email)) returnMap.set(user.email, user)
            })
            return users
        }
        return bad //couldn't parse response
    }

    return alwaysResolve(apiCall, {
        good: processGoodResponse,
        bad
    })
}

tenants.Tenant.prototype.getProviderAccountUsers = function() {
    let apiCall = [`https://${this.adminDomain}/admin/api/`,
        `users.json?access_token=${this.accessToken}`
    ].join('')
    let bad = null
    let good = function(body) {
        if (validator.isJSON(body)) {
            let users = JSON.parse(body)
            return users
        }
        return bad
    }
    return alwaysResolve(apiCall, {
        good,
        bad
    })
}

tenants.Tenant.prototype.getUsers = function(returnStructure) {
    return this.getAccountList()
        .then(x => {
            let accountIDs = x.map(obj => obj.account.id)
            return Promise.all(accountIDs.map(
                accID => this.getAccountUsers(accID, returnStructure)))
        })
        .then(x => x)
}


tenants.Tenant.prototype.getApplicationPlanFeatures = function(planID) {
    let apiCall = [
        `https://${this.adminDomain}/admin/api/`,
        `application_plans/${planID}/features.json?`,
        `access_token=${this.accessToken}`
    ].join('')

    let bad = null
    let processGoodResponse = function(body) {
        let result = JSON.parse(body)
        if ('features' in result) {
            if (Array.isArray(result.features)) {
                if (result.features.length > 0) {
                    return result.features
                }
            }
        }
        return null
    }

    return alwaysResolve(apiCall, {
        bad,
        good: processGoodResponse
    })
}

tenants.Tenant.prototype.getServicePlanFeatures = function(planID) {
    let apiCall = [
        `https://${this.adminDomain}/admin/api/`,
        `service_plans/${planID}/features.json?`,
        `access_token=${this.accessToken}`
    ].join('')

    let bad = null
    let good = body => {
        let results = JSON.parse(body)
        if ('features' in results) {
            if (Array.isArray(results.features)) {
                if (results.features.length > 0) {
                    return results.features
                }
            }
        }
        return null
    }
    return alwaysResolve(apiCall, {
        good,
        bad
    })
}

module.exports = {
    tenants
}