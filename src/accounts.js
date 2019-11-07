"use strict";
const moment = require('moment')
const validator = require('validator')
const alwaysResolve = require('@src/utils').utils.alwaysResolve

const accounts = (function() {
    return {
        UserAccount: class {
            constructor(email) {
                this.email = email
                this.tenantAccountPlans = new Map() //(tenant name x account plan)
                this.accountPlans = new Map()
            }
        },
        TenantAccountPlan: class {
            constructor(tenant, planInfo) {
                //planinfo is formatted as per 
                //the result of the xml api fetch call
                Object.getOwnPropertyNames(planInfo).forEach(
                    propertyName => {
                        if (propertyName !== '$') {
                            Object.defineProperty(this, propertyName, {
                                value: planInfo[propertyName][0]
                        })
                    }
                })
            }
        },
        Account: class {
            constructor(accountID, email) {
                this.accountID = accountID
                this.accountEmail = email
            }
        }
    }
})()


accounts.UserAccount.prototype.processAccountPlanFeatures =
    function(tenant, accountPlanFeatures) {
        let accessRights = {
            gcInternal: false,
            depInternal: false
        }
        if (Array.isArray(accountPlanFeatures)) {
            accountPlanFeatures.forEach(
                feature => {
                    if (feature.feature.system_name === "gc-internal") {
                        accessRights.gcInternal = true
                    }
                    if (feature.feature.system_name === `${tenant.name}-internal`) {
                        accessRights.depInternal = true
                    }
                })
        }
        this.accountPlans.set(tenant.name, accessRights)
    }

accounts.UserAccount.prototype.getAccountPlanFeatures = function(tenant, planID) {
    //this user has an account plan for this tenant
    //now fetching the features of the plan
    //to obtain access rights 
    let apiCall = [tenant.baseURL,
        `account_plans/${planID}/features.json?`,
        `access_token=${tenant.accessToken}`
    ].join('')
    let processGoodResponse = function(body) {
        if (validator.isJSON(body)) return JSON.parse(body).features
        return null
    }
    return alwaysResolve(apiCall, {
        good: processGoodResponse,
        bad: null
    })
}


accounts.UserAccount.prototype.addTenantAccountPlan = async function(tenant, plans) {
    if (plans === null) return null

    let tenantPlans = plans.plans[0].plan

    if (tenantPlans === undefined) {
        return null
    }

    let accountPlan = tenantPlans.filter(
        plan => plan.type[0] === "account_plan"
    )

    if (accountPlan.length >= 1) {
        this.tenantAccountPlans.set(
            tenant.name,
            new accounts.TenantAccountPlan(tenant, accountPlan[0]))

        return accountPlan[0].id[0]
    }
    return null
}

accounts.UserAccount.prototype.getPlans = async function(tenant) {
    let processResults = function(results) {
        if (results === null) return null
        if (!('account' in results)) return null
        let accountInfo = results.account
        if ('plans' in accountInfo && Array.isArray(accountInfo.plans)) {
            return {
                plans: accountInfo.plans
            }
        }
        debugger //shouldn't happen
    }
    return new Promise((resolve, reject) => {
        tenant.getUserPlans(this.email)
            .then(processResults)
            .then(plans => this.addTenantAccountPlan(tenant, plans))
            .then(accountPlanID => {
                if (accountPlanID === null) return null
                return this.getAccountPlanFeatures(tenant, accountPlanID)
            })
            .then(planFeatures => resolve(this.processAccountPlanFeatures(tenant, planFeatures)))
    })
}

accounts.Account.prototype.setBasicAccountInfo = function(accountInfo) {
    this.links = accountInfo.links
    this.uniqueAccountID = accountInfo.unique_account_id || null
    this.creationDate = moment(accountInfo.created_at)
    this.lastUpdate = moment(accountInfo.updated_at)
    this.applications = []
}

accounts.Account.prototype.addApplication = function(application) {
    this.applications.push(application)
}

accounts.Account.prototype.associatePlans = function(planIDs) {
    this.plans = planIDs
}

module.exports = {
    accounts
}
