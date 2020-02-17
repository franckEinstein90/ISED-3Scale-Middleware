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
/*****************************************************************************/
const alwaysResolve     = require('@src/utils/alwaysResolve').alwaysResolve
const errors            = require('@errors').errors
const appDatabase       = require('@server/db').appDatabase
const ServiceProto      = require('@services/serviceProto').ServiceProto
const DocumentationSet  = require('@services/documentationSet').DocumentationSet
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
    this.documentation.set(docObj.system_name.toLowerCase(), new DocumentationSet(docObj))

}

services.Service.prototype.updatePlans = async function( ) {
    return Promise.all([this.tenant.getApplicationPlans(this.id), this.tenant.getServicePlans(this.id)])
    .then ( plans => {
        this.plans = plans[0].plans.concat(plans[1].plans)
        return this
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