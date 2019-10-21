"use strict";

const utils = require('@src/utils').utils
const t = require('@src/tenants/tenantsApiRequests').tenants;
const cache = require('memory-cache')

const tenantsManager = (function() {

    let env, applicationAPIURI, tenants,
        outputUserInfoResponse, 
	apiReqResponse, tenantToUserPlans, tenantToApiInfo, 
	outputUserPlans, getApiName

    tenants = []

    getApiName = function({
        tenant,
        serviceID,
        language
    }) {
        let cachedApiName, key
        key = [tenant.name, serviceID, language].join('-')
        console.log("checking this key: " + key)
        cachedApiName = cache.get(key)
        if (cachedApiName) return cachedApiName
        key = [tenant.name, serviceID, "default"].join('-')
        cachedApiName = cache.get(key)
        if (cachedApiName) return cachedApiName
        return serviceID
    }

    outputUserInfoResponse = function(userEmail, language) {
        let outputJSON, apps, newLink

        outputJSON = {
            userEmail: userEmail
        }
        newLink = function(tenant, application) {
            let link = {
                rel: "self_new",
                href: [`https://${tenant.name}`,
                    `${applicationAPIURI}${application.id}?`,
                    `lang=${language}`
                ].join('')
            }
            return link
        }
        outputJSON.tenants = tenants.map(function(tenant) {
            apps = []
            if (tenant.accounts.has(userEmail)) {
                tenant.accounts.get(userEmail).applications.forEach(
                    application => {
                        application.links.push(newLink(tenant, application))
                        application.apiname = getApiName({
                            tenant,
                            serviceID: application.service_id,
                            language
                        })
                        delete application.service_id
                        delete application.id
                        apps.push(application)
                    }
                )
            }
            return {
                name: tenant.name,
                description: tenant.tenantDescription(language),
                applications: apps
            }
        })
        return JSON.stringify(outputJSON)
    }

    tenantToUserPlans = function(tenant, userEmail, language) {
        return {
            name: tenant.name,
            maintainers: {
                fn: language === 'fr' ? "Equipe du magasin API" : "GC API Store Team",
                email: "ic.api_store-magasin_des_apis.ic@canada.ca",
                url: "https://api.canada.ca"
            },
            description: tenant.tenantDescription(language),
            apis: [],
            authenticatedUser: userEmail
        }
    }

    tenantToApiInfo = function(tenant, language) {
        return {
            name: tenant.name,
            description: tenant.tenantDescription(language),
            maintainers: tenant.maintainers(language), 
            apis: tenant.apiDescriptions(language)
        }
    }
    return {
        tenants: function() {
            return tenants
        },


        //called by cron job, updates all 
        //tenant information in memory
        updateTenantInformation: async function() {
            let resolveCheck = function(updateErrors) {
                //checks for update errors and recovers
                console.log(tenants)
            }
            console.log(`updating tenant information`)
            return Promise.all(tenants.map(t => t.getApiInfo()))
                .then(updateErrors => resolveCheck(updateErrors))
        },

        languages: {
            francais: 2,
            english: 1
        },

        alive: function() {
            tenants.forEach(tenant => console.log(tenant.name))
        },
        //on ready is run once at application startup
        onReady: function(dataJSON) {
            env = dataJSON.env
            applicationAPIURI = (env === "dev" ? ".dev" : "") + ".api.canada.ca/admin/applications/"
            //construct tenant instances from dataJSON
            dataJSON.tenants.forEach(tenantInfo => {
                if (tenantInfo.visible) {
                    let newTenant = new t.Tenant(tenantInfo, env)
                    tenants.push(newTenant)
                }
            })
        },

        getApiInfo: function({
            userEmail,
            language
        }) {
            if (userEmail === null) {
		        let answer = JSON.stringify(
                    tenants
                        .map(t => tenantToApiInfo(t, language))
                        .sort((t1,t2) => t1.name.localeCompare(t2.name)))
            	return answer
            } 
            //if there is an email associated with the request
           return Promise.all(tenants.map(tenant => tenant.getUserPlans(userEmail)))
                   .then(res => console.log(res))
//                        JSON.stringify(tenants.map(
 //                           tenant => tenantToUserPlans(tenant, userEmail, language))))
            
        },

        getUserInfo: async function({
            userEmail,
            language
        }) {

            return Promise.all(tenants.map(tenant => tenant.getUserInfo(userEmail)))
                .then(function(results) {
                    return outputUserInfoResponse(userEmail, language)
                })
        }
    }
})()

module.exports = {
    tenantsManager
}
