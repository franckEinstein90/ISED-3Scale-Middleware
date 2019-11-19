/***************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 ***************************************/


"use strict"

const utils = require('@src/utils').utils
const t = require('@src/responses').tenants
const UserAccount = require('@src/accounts').accounts.UserAccount
const errors = require('@src/errors').errors

const tenantsManager = (function() {

    let env,  tenants, userInfoResponse,  tenantToApiInfo,
    userApiInfoResponse , applicationAPIURI

    tenants = []

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
                name: application.name , 
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
                   if(service.hasBillingualDoc()){
                        applications.push(applicationInfo(application, service))
                   }})
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
                JSONResponse.tenants.push( tenantInfo  )
           })
        return JSON.stringify(JSONResponse)
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
                if(!user.tenantAccounts.has(tenant.name)) return
				let tenantAccount = user.tenantAccounts.get(tenant.name)
                let accessRights = tenantAccount.accountPlan.accessRights 
                if( (servicePlanAccess.gcInternal && accessRights.ca_gov_wide) || 
                    (servicePlanAccess.depInternal  && accessRights.dep_internal)) {
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
        tenants: function() {
            return tenants
        },


        //Called by cron job, updates all 
        //tenant information in memory
        updateTenantInformation: async function() {
            let checkResults = updateResults =>{
                let faultyUpdates = updateResults.filter(
                    report => {
                        if( ('updateResult' in report) && (report.updateResult === errors.codes.Ok)){
                            return false
                        }
                        return true
                    })
                if (faultyUpdates.length === 0){ //no faulty updates
                    return errors.codes.Ok 
                } 
                return faultyUpdates
            }
            //updates service information for all tenants
            return Promise.all(tenants.map(t => t.updateApiInfo()))
            .then(checkResults)
        },

        languages: {
            francais: 2,
            english: 1
        },

        alive: function() {
            return tenants.map(tenant => tenant.name).join('<BR/>')
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
                return JSON.stringify(tenants.map(t => t.apiJsonAnswer(language)))
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
