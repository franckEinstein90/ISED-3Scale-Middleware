"use strict";

const utils = require('@src/utils').utils
const t = require('@src/responses').tenants
const cache = require('memory-cache')
const UserAccount = require('@src/accounts').accounts.UserAccount

const tenantsManager = (function() {

    let env, applicationAPIURI, tenants,
        userInfoResponse,
        apiReqResponse, tenantToUserPlans, tenantToApiInfo,
        userApiInfoResponse, getApiName

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

    userInfoResponse = function(userEmail, language) {
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
                        let appClone = {
                            name: application.name,
                            state: application.state,
                            created_at: application.created_at,
                            user_key: application.user_key,
                            links: application.links
                        }
                        appClone.links.push(newLink(tenant, application))
                        appClone.apiname = getApiName({
                            tenant,
                            serviceID: application.service_id,
                            language
                        })
                        apps.push(appClone)
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

    userApiInfoResponse = function(requestResult, user, language) {
		let response = []

		tenants.forEach( tenant => {
			let tenantResponse = {
				name: tenant.name, 
                description: tenant.tenantDescription(language),
                maintainers: {
                    fn: language === 'fr' ? "Equipe du magasin API" : "GC API Store Team",
                    email: "ic.api_store-magasin_des_apis.ic@canada.ca",
                    url: "https://api.canada.ca"
                },
                apis: [], 
                authenticatedUser: user.email, 
                
			}
			tenant.services.forEach((service, serviceID) => {
				//does this service have a set of bilingual definitions
				if(!service.hasBillingualDoc()) return
				//do the service plans match? 
                let servicePlanAccess = service.servicePlanAccess()
                let apiDescription = service.outputAPIDescription(language)
                //no servicePlan mean public service
                if (servicePlanAccess.public === true){
					tenantResponse.apis.push(apiDescription)
					return 
				}
				//If this user isn't registered with this tenant, AND the service isn't public
                if(!user.accountPlans.has(tenant.name)) return
				let userAccess = user.accountPlans.get(tenant.name)
                
                if((servicePlanAccess.gcInternal && userAccess.gcInternal) || (servicePlanAccess.depInternal  && userAccess.depInternal)) {
					tenantResponse.apis.push(apiDescription)
					return
				}
                return
            })
            response.push(tenantResponse)
        })
		return JSON.stringify(response)
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


        //Called by cron job, updates all 
        //tenant information in memory
        updateTenantInformation: async function() {
            return Promise.all(tenants.map(t => t.getApiInfo()))
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
            tenants.sort((t1, t2) => t1.name.localeCompare(t2.name))
        },

        getApiInfo: function({
            userEmail,
            language
        }) {
            if (userEmail === null) {
                return JSON.stringify(tenants.map(t => tenantToApiInfo(t, language)))
            }
            //if there is an email associated with the request
            let user = new UserAccount(userEmail)
            let planUpdatePromises  = tenants.map(tenant => user.getPlans(tenant))
            return Promise.all(planUpdatePromises)
                .then(function(result){
                    return  userApiInfoResponse(result, user, language)
                })
            },

        getUserInfo: async function({
            userEmail,
            language
        }) {

            return Promise.all(tenants.map(tenant => tenant.getUserInfo(userEmail)))
                .then(function(results) {
                    return userInfoResponse(userEmail, language)
                })
        }
    }
})()

module.exports = {
    tenantsManager
}
