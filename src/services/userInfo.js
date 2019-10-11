"use strict";


const t = require('@src/tenants/tenantsApiRequests').tenants;
const cache = require('memory-cache')

const tenantsManager = (function() {

            let env, applicationAPIURI, tenants,
                outputUserInfoResponse, outputApiInfoResult, outputUserPlans, 
                getApiName

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

            outputUserPlans = function(userEmail, language){
                console.log('here')
            }
            outputApiInfoResult = function(userEmail, language) {
                let outputObject = {
                    test: "hello world"
                }
                return JSON.stringify(outputObject)
            }

            return {

                forEachTenant(tenantHandler){
                    tenants.forEach(tenant => tenantHandler(tenant))
                },

                languages: {
                    francais: 2,
                    english: 1
                },

                alive: function(){
                    tenants.forEach( tenant => console.log(tenant.name))
                }, 
                //on ready is run once at application startup
                onReady: function(dataJSON) {
                    env = dataJSON.env
                    applicationAPIURI = (env === "dev" ? ".dev" : "") + ".api.canada.ca/admin/applications/"
                    //construct tenant instances from dataJSON
                    dataJSON.tenants.forEach(tenantInfo => {
                        if (tenantInfo.visible) {
                            let newTenant = new t.Tenant(tenantInfo);
                            tenants.push(newTenant)
                        }
                    })
                },

                getApiInfo: async function({ userEmail, language }) {
                    if (userEmail === null) {
                        return Promise.all(tenants.map(tenant => tenant.getApiInfo()))
                    } 
                    else {
                            return Promise.all(tenants.map(tenant => tenant.getUserPlans(userEmail)))
                            .then(function(results){
                                return outputUserPlans(userEmail, language)
                            })
                        }
                    },

                    getUserInfo: async function({ userEmail, language }) {

                        return Promise.all(tenants.map(tenant => tenant.getAccountInfo(userEmail)))
                            .then(function(results) {
                                return outputUserInfoResponse(userEmail, language)
                            })
                    }
                }
            })()

        module.exports = {
            tenantsManager
        }
