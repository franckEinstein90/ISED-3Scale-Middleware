/*******************************************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * Application APICan - 2020
 * -------------------------------------
 *  Module services.js
 *
 *  class definition and implementation for services 
 *
 ******************************************************************************/
"use strict"

const validator = require('validator')
const flatten   = require('array-flatten').flatten
/*****************************************************************************/
const alwaysResolve     = require('@src/utils/alwaysResolve').alwaysResolve
const errors            = require('@errors').errors
const appDatabase       = require('@server/db').appDatabase
const ServiceProto      = require('@services/serviceProto').ServiceProto
const DocumentationSet  = require('@services/documentationSet').DocumentationSet
const Plan              = require('@clientServerCommon/plans').Plan
/*****************************************************************************/

const services = (function() {
    let _features = []

    return {
        ready: function() {
            //read the features from the database
            appDatabase.getAllTableRows({
                    table: 'tblFeatures'
                })
                .then(rows => {})
        },

        codes: {
            updateServiceFeaturesOk: "update service feature ok",
            updateServiceFeaturesNotOk: "update service feature not ok"
        },

        updateOk: function(serviceID) {
            return {
                serviceID: serviceID,
                updated: 'ok'
            }
        },

        updateNotOk: function(serviceID, err) {
            return {
                serviceID: serviceID,
                updated: 'not ok',
                err: err
            }
        },


        ServiceDocumentation: class {
            constructor(serviceID) {
                this.serviceID = serviceID
                this.fr = null
                this.en = null
            }
        },

        Service: class extends ServiceProto {
            constructor(serviceID, tenant) {
                super({
                    id              : serviceID,
                    serviceProvider : tenant
                })
                this.documentation      = new Map()
                this.publishable        = false
                this.public             = false
            }

            get tenant() {
                return this.serviceProvider
            }

            get bilingual() {
                return this.documentation.size === 2
            }
        }
    }
})()

services.Service.prototype.outputAPIDescription = function(language) {
    let documentationHandle = `${this.system_name.toLowerCase()}-${language}`
    //service.system_name is used to link the french and the english versions
    //of the documentation. We only display the API and its associated information
    //if both linguistic versions are present
    if (this.documentation.has(documentationHandle)) {
        let docInfo, swaggerBody, apiDescription
        docInfo = this.documentation.get(documentationHandle)
        if (!(validator.isJSON(docInfo.body))) return
        swaggerBody = JSON.parse(docInfo.body)

        apiDescription = {
            name: swaggerBody.info.title,
            description: swaggerBody.info.description,
            baseURL: `https://${swaggerBody.host}${swaggerBody.basePath}`,
            humanUrl: [`https://${this.tenant.name}`,
                (this.tenant.env === "dev" ? ".dev" : ""),
                `.api.canada.ca/${language}`,
                `/detail?api=${this.system_name}`
            ].join('')
        }
        if ('tags' in docInfo) {
            if (Array.isArray(docInfo.tags)) {
                apiDescription.tags = docInfo.tags
            } else {
                apiDescription.tags = [docInfo.tags]
            }
        }
        if (swaggerBody.info.contact) {
            apiDescription.contact = {
                FN: swaggerBody.info.contact.name,
                email: swaggerBody.info.contact.email
            }
        }
        return apiDescription
    }
    return null
}

services.Service.prototype.updateDefinition = function(defObj) {
    try {
        if (typeof(defObj) === 'object' &&
            'id' in defObj &&
            defObj.id === this.id) {

            Object.assign(this, defObj)
            return services.updateOk(this.id)
        }
    } catch (err) {
        return services.updateNotOk(this.id, err)
    }
}

services.Service.prototype.addDocumentationSet = function(docObj, tenantUpdateReport) {

    let serviceReport = tenantUpdateReport.serviceReport(this.id)

    if (/\-fr$/i.test(docObj.system_name)) {
        //French documentation		
        serviceReport.languageUpdate.french = errors.codes.Ok
    } else if (/\-en$/i.test(docObj.system_name)) {
        //English documentation		
        serviceReport.languageUpdate.english = errors.codes.Ok
    } else {
        //neither English nor French documentation
        return
    }

    if( docObj.published){
        this.documentation.set(docObj.system_name.toLowerCase(), new DocumentationSet(docObj))
        if(this.documentation.size === 2) this.publishable = true
    }

}

services.Service.prototype.updatePlans = async function( ) {
    //get all plans associated with this service
    return Promise.all([
        this.tenant.getApplicationPlans(this.id), 
        this.tenant.getServicePlans(this.id)
    ])
    .then ( plans => {
        //store the plans within the service
        let allPlans = plans[0].plans.concat(plans[1].plans) 
        this.plans = allPlans.map(plan => {
            if('application_plan' in plan) return new Plan({
                id      : plan.application_plan.id,
                planType: "application",
                planInfo: plan.application_plan
            })
            if('service_plan' in plan) return new Plan({
                id          : plan.service_plan.id,
                planType    : "service",
                planInfo    : plan.service_plan
            })
        })
        return this
    })
    .then( _ => {   //get the features of the plans associated with this service
        return Promise.all( this.plans.map( plan => this.getPlanFeatures(plan)))
    })
    .then( features => {

        if(features.map(f => f.features).filter(f => f !== null).length === 0){
            this.public = true
            return this
        }

        features.forEach(planFeatures => {
            if(planFeatures.features === null) return
            let plan = this.plans.find( plan => plan.id === planFeatures.planID)
            plan.features = planFeatures.features.map(f => f.feature)
        })

        let publishedPlansFeatures = flatten( 
            this.plans.filter( p => p.planInfo.state === "published")
            .filter(p => p.features.length > 0)
            .map(p => p.features.map(f => f.system_name)))
        if(publishedPlansFeatures.some(f => /intern/.test(f))){
            this.public = false
            return this
        }
        //now we have collected the features for all the 
        //plans, and can decide if the service is "public"
        //2A2A
        let servicePlan = this.plans.find(p => p.isServicePlan)
        if(servicePlan){
            if(servicePlan.planInfo.state === "published" && servicePlan.features.length === 0){
                this.public = true 
            }else if(servicePlan.planInfo.state === 'hidden'){

            } 
        }
        return this
    })
}

services.Service.prototype.getPlanFeatures = function(plan){

    let planFeaturesPromise = null
    let serviceTenant = this.tenant

    if( plan.isApplicationPlan ){
        planFeaturesPromise =  serviceTenant.getApplicationPlanFeatures(plan.id)
    } else if ( plan.isServicePlan ){
        planFeaturesPromise =  serviceTenant.getServicePlanFeatures(plan.id)
    } else {
        debugger
    }

    return planFeaturesPromise
    .then( features => {
        return {
            planID: plan.id, 
            features
        } 
    })
}

services.Service.prototype.getServiceUsageMetrics = async function() {
    let thisServiceID = this.id
    let apiCall = [
        `https://${this.tenant.adminDomain}/stats/services/${thisServiceID}/`,
        `usage.json?access_token=`,
        `c527a90b5735f5148ff0de902bb4fba6dcef628523e5a66ae6811b415febedfb&`,
        'metric_name=hits&since=2019-06-01&until=2020-02-20&granularity=month&skip_change=true'
    ].join('')
    let processGoodResponse = function(body) {
        if (validator.isJSON(body)) {
            return JSON.parse(body)
        }
    }
    let bad = null
    return alwaysResolve(apiCall, {
        good: processGoodResponse,
        bad
    })
}

services.Service.prototype.servicePlanAccess = function() {
    let servicePlanAccess = {
        public: true,
        gcInternal: true,
        depInternal: true
    }
    //if no service plans, returns all access (public api)
    if (!('features' in this)) return servicePlanAccess
    let servicePlanFeatures = this.features.filter(feature => feature.scope === 'service_plan')
    if (servicePlanFeatures.length === 0) return servicePlanAccess
    servicePlanAccess.public = false
    servicePlanAccess.gcInternal = false
    servicePlanAccess.depInternal = false
    servicePlanFeatures.forEach(
        serviceFeature => {
            if (serviceFeature.system_name === 'gc-internal') servicePlanAccess.gcInternal = true
            if (serviceFeature.system_name === `${this.tenant.name}-internal`) servicePlanAccess.depInternal = true
        })
    return servicePlanAccess
}


module.exports = {
    services
}