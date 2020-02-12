/*******************************************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * Application APICan
 * -------------------------------------
 *  tenantProto.js : prototype class for Tenant class
 *
 ******************************************************************************/

"use strict"

/*****************************************************************************/
const validator = require('validator')
const errors = require('@errors').errors
const alwaysResolve = require('@utils/alwaysResolve').alwaysResolve
const ServiceRegister = require('@src/services/serviceRegister').ServiceRegister
/*****************************************************************************/
let planJsonObjectToserviceID = function(planInfo) {
    let serviceLink = planInfo.links.find(link => {
        return link.rel === "service"
    })
    let serviceID = /\d+$/.exec(serviceLink.href)
    return {
        serviceID: Number(serviceID[0]), //service id
        planID: planInfo.id
    }
}

class ServiceProvider {
    constructor({
        accessToken,
        id,
        name,
        adminDomain
    }) {
        this.accessToken = accessToken
        this.id = id
        this.name = name
        this.services = new ServiceRegister(this)
        this.adminDomain = adminDomain
        this.baseURL = `https://${this.adminDomain}/admin/api/`
        this.accountAdminBaseURL = {
            services: `https://${this.adminDomain}/admin/api/services.json?access_token=${this.accessToken}`,
            activeDocs: `${this.baseURL}active_docs.json?access_token=${this.accessToken}`,
            userPlans: email => `${this.baseURL}accounts/find?access_token=${this.accessToken}&email=${encodeURIComponent(email)}`
        }
    }
}

ServiceProvider.prototype.getBaseInfo = function() {
    return Promise.all([
        this.getServicePlans(),
        this.getApplicationPlans()
    ])
}

ServiceProvider.prototype.getApplicationPlans = function() {
    return new Promise((resolve, reject) => {
        this.getApplicationPlanInfo()
            .then(applicationPlans => {
                let applicationPlanInfo = applicationPlans.map(planJsonObjectToserviceID)
                applicationPlanInfo.forEach(planInfo => {
                    if (!this.services.has(planInfo.serviceID)) {
                        this.services.set({
                            id: planInfo.serviceID,
                            tenant: this
                        })
                    }
                    let s = this.services.get(planInfo.serviceID)
                    s.applicationPlanIDs.push(planInfo.planID)
                    resolve(`${applicationPlanInfo.length} application plans`)
                })
            })
    })
}
ServiceProvider.prototype.getServicePlans = function() {
    return new Promise((resolve, reject) => {
        this.getServicePlanInfo()
            .then(servicePlans => {
                let servicePlanInfo = servicePlans.map(planJsonObjectToserviceID)
                servicePlanInfo.forEach(planInfo => {
                    if (!this.services.has(planInfo.serviceID)) {
                        this.services.set({
                            id: planInfo.serviceID,
                            tenant: this
                        })
                    }
                    let s = this.services.get(planInfo.serviceID)
                    s.servicePlanIDs.push(planInfo.planID)
                    resolve(`${servicePlanInfo.length} service plans`)
                })
            })
    })
}
ServiceProvider.prototype.getApplicationPlanInfo = function() {
    let apiCall = [
        `https://${this.adminDomain}/admin/api/`,
        `application_plans.json?access_token=${this.accessToken}`
    ].join('')
    let bad = null
    let good = function(body) {
        if (validator.isJSON(body)) {
            let applicationPlans = JSON.parse(body).plans.map(p => p.application_plan)
            return applicationPlans
        }
    }
    return alwaysResolve(apiCall, {
        good,
        bad
    })
}
ServiceProvider.prototype.getServicePlanInfo = function() {
    let apiCall = [
        `https://${this.adminDomain}/admin/api/`,
        `service_plans.json?access_token=${this.accessToken}`
    ].join('')

    let bad = null
    let good = function(body) {
        if (validator.isJSON(body)) {
            let servicePlans = JSON.parse(body).plans.map(x => x.service_plan)
            return servicePlans
        } else {
            return null
        }
    }
    return alwaysResolve(apiCall, {
        good,
        bad
    })
}
ServiceProvider.prototype.getServiceList = function(tenantUpdateReport = null) {

    let apiCall = [
        `https://${this.adminDomain}/admin/api/`,
        `services.json?access_token=${this.accessToken}`
    ].join('')

    let bad = null //tenants.codes.serviceUpdateError

    let good = function(body) {
        if (validator.isJSON(body)) {
            let apis = JSON.parse(body).services
            if (tenantUpdateReport) {
                tenantUpdateReport.fetches.serviceList = errors.codes.Ok
            }
            return apis
        }
        return bad
    }

    return alwaysResolve(apiCall, {
        good,
        bad
    })
}


module.exports = {
    ServiceProvider
}