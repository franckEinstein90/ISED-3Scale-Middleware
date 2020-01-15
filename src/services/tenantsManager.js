/***********************************************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * -------------------------------------
 *  Module tenantsManager / server side
 *
 *  - manages a store of tenants
 *  - replies to API requests userInfo.json and apiInfo.json
 *  - updates the tenant and service information on a schedule
 **********************************************************************************/


"use strict"

const APICanData = require('@src/APICanData').APICanData
const t = require('@src/responses').tenants
const UserAccount = require('@src/accounts').accounts.UserAccount
const errors = require('@src/errors').errors
const moment = require('moment')
const db = require('@server/db').appDatabase

const tenantsManager = (function() {

    let userInfoResponse, tenantToApiInfo,
        userApiInfoResponse

    let _applicationAPIURI = null

    let tenants = []
    let updateRegister = new Map()

    userInfoResponse = function(user, language) {
        let JSONResponse = {
            userEmail: user.email,
            tenants: []
        }

        let applicationInfo = (application, service) => {
            let serviceDocumentation = service.outputAPIDescription(language)
            let links = application.links
            links.push({
                rel: "self_new",
                href: `https://${service.tenant.name}.dev.api.canada.ca/admin/applications/${application.id}?lang=${language}`
            })
            return {
                application: {
                    name: application.name,
                    state: application.state,
                    created_at: application.created_at,
                    user_key: application.user_key,
                    links: links,
                    apiName: serviceDocumentation.name
                }
            }
        }

        let displayApplications = tenantAccount => {
            let applications = []
            let tenantServices = tenantAccount.tenant.services.register
            tenantAccount.applications.forEach(
                application => {
                    let service = tenantServices.get(application.service_id)
                    if (service.hasBillingualDoc()) {
                        applications.push(applicationInfo(application, service))
                    }
                })
            return applications
        }
        user.tenantAccounts.forEach(
            (tenantAccount, tenantName) => {
                let tenant = tenants.find(tenant => tenant.name === tenantName)
                let tenantInfo = {
                    name: tenantName,
                    description: tenant.tenantDescription(language),
                    applications: {
                        applications: displayApplications(tenantAccount)
                    }
                }
                JSONResponse.tenants.push(tenantInfo)
            })
        JSONResponse.tenants.sort((t1, t2) => t1.name.localeCompare(t2.name))
        return JSON.stringify(JSONResponse)
    }

    userApiInfoResponse = function(requestResult, user, language) {
        let response = []

        tenants.forEach(tenant => {
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
                if (!service.hasBillingualDoc()) return
                //do the service plans match? 
                let servicePlanAccess = service.servicePlanAccess()
                let apiDescription = service.outputAPIDescription(language)
                //no servicePlan mean public service
                if (servicePlanAccess.public === true) {
                    tenantResponse.apis.push(apiDescription)
                    return
                }
                //If this user isn't registered with this tenant, AND the service isn't public
                if (!user.tenantAccounts.has(tenant.name)) return
                let tenantAccount = user.tenantAccounts.get(tenant.name)
                let accessRights = tenantAccount.accountPlan.accessRights
                if ((servicePlanAccess.gcInternal && accessRights.ca_gov_wide) ||
                    (servicePlanAccess.depInternal && accessRights.dep_internal)) {
                    tenantResponse.apis.push(apiDescription)
                    return
                }
                return
            })
            response.push(tenantResponse)
        })
        return JSON.stringify(response)
    }


    return {

        configure: function(dataJSON) {
            let env = APICanData.env() 
            _applicationAPIURI = (env === "dev" ? ".dev" : "") + ".api.canada.ca/admin/applications/"

            APICanData.tenantsConfigurationInfo().forEach(tenantInfo => {
                if (tenantInfo.visible) {
                    let newTenant = new t.Tenant( tenantInfo, APICanData.env() )
                    tenants.push(newTenant)
                }
            })
            tenants.sort((t1, t2) => t1.name.localeCompare(t2.name))
            //set up index by name
            tenants.forEach( tenant => updateRegister.set(tenant.name, null))
            db.setTenants( tenants.map(t => t.name)  )
        },

        getTenantByName: function(tenantName) {
            let tenant = tenants.find(t => t.name === tenantName)
            return tenant
        },
        tenants: function() {
            return tenants
        },

        lastTenantUpdate: function(tenantName) {
            //returns the last updated time of a tenant
            if (updateRegister.has(tenantName)) {
                if (updateRegister.get(tenantName) !== null) {
                    return updateRegister.get(tenantName).format('MMM Do YYYY, h:mm:ss a')
                }
            }
            return "Not updated yet"
        },

        updateTenantInformation: async function(listToUpdate = null) {
            //Called by cron job, updates all 
            //tenant information in memory

            //if listToUpdate specified, tenant manager 
            //only updates specified tenants
            let tenantsToUpdate = null
            if (listToUpdate) {
                tenantsToUpdate = listToUpdate.map(tName => tenants.find(t => t.name === tName))
            } else {
                tenantsToUpdate = /*all*/ tenants
            }

            let registerUpdatedTenants = (tenantsUpdateReport) => {
                tenantsUpdateReport.forEach(
                    updateReport => {
                        let currentTime = moment()
                        updateReport.endUpdateTime = currentTime
                        if (updateReport.updateSuccess === errors.codes.Ok) {
                            updateRegister.set(updateReport.tenantName, currentTime)
                        }
                    })
                return tenantsUpdateReport
            }

            return Promise.all(tenantsToUpdate.map(t => t.updateApiInfo()))
                .then(registerUpdatedTenants)
        },

        languages: {
            francais: 2,
            english: 1
        },

        alive: function() {
            return tenants.map(tenant => tenant.name).join('<BR/>')
        },

        getApiInfo: function({
            userEmail,
            language
        }) {
            if (userEmail === null) {
                return JSON.stringify(tenants.map(t => t.apiJsonAnswer(language)))
            }
            //if there is an email associated with the request
            let user = new UserAccount(userEmail)
            let planUpdatePromises = tenants.map(tenant => user.getPlans(tenant))
            return Promise.all(planUpdatePromises)
                .then(function(result) {
                    return userApiInfoResponse(result, user, language)
                })
        },

        getUserInfo: async function({
            userEmail,
            language
        }) {
            let user = new UserAccount(userEmail)
            return Promise.all(tenants.map(tenant => user.getSubscriptions(tenant)))
                .then(function(results) {
                    return userInfoResponse(user, language)
                })
        }
    }
})()

module.exports = {
    tenantsManager
}
