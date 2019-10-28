"use strict";
const moment = require('moment')
const validator = require('validator')
const alwaysResolve = require('@src/utils').utils.alwaysResolve

const accounts = (function() {
    return {
        UserAccount: class {
            constructor(email) {
                this.email = email
                this.accountPlans = new Map()
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
		debugger
		if(Array.isArray(accountPlanFeatures)){
			accountPlanFeatures.forEach(
				feature => {
					if(feature.feature.system_name === "gc-internal"){
						accessRights.gcInternal = true
					}
					if(feature.feature.system_name === `${tenant.name}-internal`){
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


accounts.UserAccount.prototype.addPlans = async function(tenant, plans) {
    let tenantPlans = plans.plans[0].plan
    if (tenantPlans === undefined) {
        debugger
    }
    let accountPlan = tenantPlans.filter(
        plan => plan.type[0] === "account_plan"
    )
    return accountPlan[0].id[0]
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
/*        .then(processResults)
        .then(plans => {
            if (plans) return this.addPlans(tenant, plans)
            return null
        })
        .then(accountPlanID => {
            if (accountPlanID === null) return null
            return this.getAccountPlanFeatures(tenant, accountPlanID)
        })
		  .then(planFeatures => this.processAccountPlanFeatures(tenant, planFeatures))
		  .then(x => resolve(x))*/
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
