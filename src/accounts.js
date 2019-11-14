"use strict";
const moment = require('moment')
const validator = require('validator')
const alwaysResolve = require('@src/utils').utils.alwaysResolve
const Plan = require('@src/plans').plans.Plan
const Feature = require('@src/features').features.Feature

const accounts = (function() {
    return {
        UserAccount: class {
            constructor(email) {
                this.email = email
                this.tenantAccounts = new Map() //(tenant name x account plan)
            }
        },
        TenantAccount: class {
            constructor({tenant, id, createdAt}) {
				this.tenant = tenant
                this.accountID = id
                this.creationDate = createdAt
                this.applications = []
            }
        }
    }
})()



accounts.UserAccount.prototype.processTenantAccountInfo = function(tenant, accountInfo){
    if(accountInfo === null ) return null
    if(typeof(accountInfo) === 'object' && 'account' in accountInfo) {
        let tenantAccount = new accounts.TenantAccount({
            tenant, 
            id: accountInfo.account.id, 
            createdAt: accountInfo.account.created_at})
        this.tenantAccounts.set(tenant.name, tenantAccount)
        return tenantAccount
    }
    return null 
}

accounts.UserAccount.prototype.getSubscriptions = async function(tenant){
   
    let addAccountSubscriptions = applicationArray => {
        if(applicationArray === null) return null
        let tenantAccount = this.tenantAccounts.get(tenant.name)
        applicationArray.forEach(application => tenantAccount.applications.push(application))
        return 1
    }

    return new Promise((resolve, reject)=>{
        tenant.getUserAccount(this.email)
		.then(accountInfo => this.processTenantAccountInfo(tenant, accountInfo))
        .then(tenantAccount => tenant.getUserAccountSubscriptions(tenantAccount))
        .then(applicationArray => resolve(addAccountSubscriptions(applicationArray)))
        
    })
}

accounts.UserAccount.prototype.getAccountPlanFeatures = function(accountPlan, tenant) {
    //this user has an account plan for this tenant
    //now fetching the features of the plan
    //to obtain access rights 
    let apiCall = [tenant.baseURL,
        `account_plans/${accountPlan.id}/features.json?`,
        `access_token=${tenant.accessToken}`
    ].join('')
    let processGoodResponse = function(body) {
        if (validator.isJSON(body)) {
		let featureArray = JSON.parse(body).features
		featureArray.forEach(
			feature => {
				accountPlan.features.push(new Feature(feature.feature))
			})
	}
        return null
    }
    return alwaysResolve(apiCall, {
        good: processGoodResponse,
        bad: null
    })
}

accounts.UserAccount.prototype.getPlans = async function(tenant){
   let processAccountPlan = accountPlanInfo => {
       console.log(this)
       if(accountPlanInfo === null) return null
       let tenantAccount = this.tenantAccounts.get(tenant.name)
       let accountPlan = new Plan({
           type: 'account_plan', 
           id: accountPlanInfo.account_plan.id, 
           state: accountPlanInfo.account_plan.state})
       tenantAccount.accountPlan = accountPlan 
       return accountPlan
   }
   return new Promise((resolve, reject) => {
        tenant.getUserAccount(this.email)
        .then(accountInfo => this.processTenantAccountInfo(tenant, accountInfo))
        .then(tenantAccount => tenant.getUserAccountPlan(tenantAccount))
        .then(processAccountPlan)
        .then(accountPlan => this.getAccountPlanFeatures(accountPlan, tenant))
   }) 
}

module.exports = {
    accounts
}
