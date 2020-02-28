/*******************************************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * Application APICan
 * -------------------------------------
 *  tenants.js : Defines tenant class
 *  used in various parts of this application
 *
 ******************************************************************************/

"use strict"

/*****************************************************************************/
const utils = require('@src/utils').utils
const errors = require('@errors').errors
const log           = require('@src/utils').utils.log
const accounts      = require('@users/accounts').accounts
const TenantProto   = require('@src/tenants/serviceProvider').ServiceProvider
const alwaysResolve = require('@src/utils/alwaysResolve').alwaysResolve
/*****************************************************************************/
const validator     = require('validator')
const tenants = (function() {

    return {
        codes: {
            noAccount: 1,
            noApplications: 2,
            updatedAccountInfo: 3,
            applicationsNotFound: 4,
            serviceNotFound: 5,
            activeDocsUpdateError: "active docs update not OK",
            activeDocsUpdateOK: "active docs update OK",
            noApiValidation: 7,
            serviceUpdateError: "service definition update not ok",
            serviceUpdateOK: "service definition update ok",
            tenantUpdateOk: "tenant successfully updated",
            tenantUpdateNotOk: "tenant not successfuly updated"
        },


        Tenant: class extends TenantProto {

            constructor(tenantJSONInfo, env) {
                super({
                    accessToken: tenantJSONInfo.access_token,
                    id: tenantJSONInfo.id,
                    name: tenantJSONInfo.name,
                    adminDomain: tenantJSONInfo.admin_domain
                })
                this.env = env
                this.lastUpdateTime = "not updated"
                this.maintainerTag = lang => {
                    return {
                        email: "ic.api_store-magasin_des_apis.ic@canada.ca",
                        url: "https://api.canada.ca",
                        fn: utils.langMsg(lang, {
                            fr: "Equipe du magasin API",
                            en: "GC API Store Team"
                        })
                    }
                }
                this.description = lang => lang === 'en' ? tenantJSONInfo.description_en : tenantJSONInfo.description_fr

                this.domain = tenantJSONInfo.domain
                this.accounts = new Map() //indexed by email addresses
                this.visibleServices = []

            }
        }
    }

})()

tenants.Tenant.prototype.updateActiveDocs = async function(apiDocsInfo, updateReport) {
    //if the document fetch operation resulted in an error, return here
    if (updateReport.fetches.activeDocs !== errors.codes.Ok) return
    apiDocsInfo.forEach(
        apiDocObject => {
            if(apiDocObject.api_doc.published){
                this.services.updateServiceDocs( apiDocObject, updateReport)
            }
        })
}

tenants.Tenant.prototype.getAccountPlan = function(planInfo, userEmail) {
    let accountID, newAccount, planIDs
    if (planInfo === null) return null
    accountID = planInfo.account.id[0]
    newAccount = new accounts.Account(accountID, userEmail)
    //within the plans included with this user, 
    this.accounts.set(userEmail, newAccount)
    //only one has a plan of type "account_plan"
    //that's the one we need
    let accountPlan = planInfo.account.plans[0].plan.filter(plan => plan.type[0] === "account_plan")[0]
    //    planIDs = planInfo.account.plans[0].plan.map(plan => plan.id[0])
    //   newAccount.associatePlans(planIDs)
    return accountPlan
    //at this point, we only care abou tthe plan that has type: account_plan
    //1. get that account info
    //2. get the features for that account
    //so for 161, get feature 31, once that's in: 
    //extract the system name (in this case gc-internal)
    //k
}

tenants.Tenant.prototype.getApplicationPlans = async function(serviceID){
    let apiCall = [
            `https://${this.adminDomain}/admin/api/`,
            `services/${serviceID}/application_plans.json?access_token=${this.accessToken}`
        ].join('')

    let good = body => {
        if (validator.isJSON(body)){
            let parsedAnswer = JSON.parse(body)
            return parsedAnswer
        }
    }
    let bad = null
    return alwaysResolve(apiCall, {
        good, 
        bad
    }) 
}

tenants.Tenant.prototype.getServicePlans = async function( serviceID ){
    let apiCall = [
        `https://${this.adminDomain}/admin/api/`,
        `services/${serviceID}/service_plans.json?access_token=${this.accessToken}`
    ].join('')

    let good = body => {
        if (validator.isJSON(body)){
            let parsedAnswer = JSON.parse(body)
            return parsedAnswer
        }
    }

    let bad = null

    return alwaysResolve(apiCall, {
        good, 
        bad
    }) 
}

tenants.Tenant.prototype.publicAPIList = function(language) {
    //returns an array of public services for this tenant
    let billingualApis =
        this.services.filter(
            service => service.documentation.size >= 2
        )
    let returnedAPIs = billingualApis.filter(
        service => {
            if (!('features' in service)) return true
            let serviceFeatures = service.features.filter(feature => {
                return feature.scope === "service_plan"
            })
            if (serviceFeatures.length === 0) return true
            return false
        })
    let listOfApis = []
    returnedAPIs.forEach(
        service => {
            //checks if there is a valid set of documentation 
            //attached to this service
            let apiDesc = service.outputAPIDescription(language)
            if (apiDesc) listOfApis.push(apiDesc)
        }
    )
    return listOfApis
}

tenants.Tenant.prototype.getUserApiInfo = async function(userEmail) {

    let accountPlans = new Promise((resolve, reject) => {
        this.getUserPlans(userEmail)
            .then(result => this.getAccountPlan(result, userEmail))
            .then(accountPlan => this.checkAccountPlanFeatures(userEmail, accountPlan))
            .then(x => resolve(x))
    })

}

tenants.Tenant.prototype.getAccounts = function() {
    return new Promise((resolve, reject) => {
        this.getAccountList()
            .then(function(accountList) {
                resolve(accountList.map(accObj => accObj.account))
            })
    })
}

tenants.Tenant.prototype.getProviderAccountUserList = function() {
    return new Promise((resolve, reject) => {
        this.getProviderAccountUsers()
            .then(x => {
                if (x === null) {
                    return resolve('invalid response')
                }
                return resolve(x.users)
            })
    })
}

tenants.Tenant.prototype.getAllUsers = function(options) {
    //returns the admin users for this tenant

    return new Promise((resolve, reject) => {
        this.getAccountList()
            .then(accounts => {
                return accounts.map(acc => {
                    if ('account' in acc) return acc.account //answer is not consistent. Someimes wrapped in account property, sometimes not
                    return acc
                })
            })
            .then(accounts => accounts.map(acc => acc.id))
            .then(accountIDs => accountIDs.map(accID => this.getAccountUsers(accID)))
            .then(accountUsers => Promise.all(accountUsers))
            .then(accountUsers => accountUsers.map(userInfo => {
                if ('users' in userInfo) return userInfo.users
                return userInfo
            }))
            .then(users => users.map(userArray => {
                if (Array.isArray(userArray) && userArray.length === 1) return userArray[0]
                return userArray
            }))
            .then(users => users.map(user => user.user))
            .then(x => {
                debugger
            })
    })
    return [{
        firstName: 'paul',
        lastName: 'Dewar',
        email: 'dfa@da.ca'
    }]
}

tenants.Tenant.prototype.updateServiceDefinitions = async function({
    fetchedServices, 
    updateReport}) {
        //if the service list update generated an error, return here
        if (updateReport.fetches.serviceList !== errors.codes.Ok) {
            return      //there was an error fetching the list of services
        }
        let currentServiceIDs = fetchedServices.map( //flag services to remove
            service => service.service.id
        )

        this.services.forEach( (_, serviceID) => {
            if (!currentServiceIDs.includes(serviceID)) { //found one shouldn't be in here
                if(! 'servicesToRemove' in updateReport) updateReport.servicesToRemove = []
                updateReport.servicesToRemove.push(serviceID)
            }
        })

        log(`updating ${fetchedServices.length} service definitions for ${this.name}`)
        fetchedServices.forEach(
            service => this.services.updateServiceDefinition(service.service, updateReport)
        )
    }

tenants.Tenant.prototype.planInfoUpdatePromises = async function( serviceIDs ){
    return serviceIDs.map(id => {
        let service = this.services.get(id)
        return service.updatePlan()
    })
}

tenants.Tenant.prototype.validateAPIs = async function(tenantUpdateReport) {
    //At this stage, we've fetched the list of services from this tenant and
    //its set of documentation
    //if either the service list fetch or the active doc fetch returned errors 
    if (tenantUpdateReport.fetches.serviceList !== errors.codes.Ok ||
        tenantUpdateReport.fetches.activeDocs !== errors.codes.Ok) {
        //report a failed update
        return tenantUpdateReport //update Failed
    }

    //extract the services that have billingual documentation
    //these are the only one worth fetching the features for
    let billingualServicesReports = []
    tenantUpdateReport.servicesUpdateReports.forEach(
        serviceUpdateReport => {
            if (serviceUpdateReport.languageUpdate.french === errors.codes.Ok &&
                serviceUpdateReport.languageUpdate.english === errors.codes.Ok) {
                billingualServicesReports.push(serviceUpdateReport)
            } else {
                serviceUpdateReport.updateSuccess = errors.codes.Ok
            }
        })

    
    return tenantUpdateReport
}

tenants.Tenant.prototype.updateApiInfo = async function() {
    //called once per cron cycles 
    //1. fetches information necessary to process all requests
    //2. returns an updateReport

    //6
    let tenantUpdateReport = new errors.TenantUpdateReport(this.name)

    let serviceListingPromise = new Promise((resolve, reject) => {
        this.getServiceList(tenantUpdateReport)
            .then(services => resolve(
                this.updateServiceDefinitions({
			        fetchedServices: services, 
                    updateReport: tenantUpdateReport
		        })
            ))
    })

    let activeDocsPromise = new Promise((resolve, reject) => {
        this.getActiveDocsList(tenantUpdateReport)
            .then(activeDocs => resolve( this.updateActiveDocs(activeDocs, tenantUpdateReport)))
    })

    //fulfills both promises in paralell
    return Promise.all([serviceListingPromise, activeDocsPromise])
        .then( _ => {
            this.validateAPIs( tenantUpdateReport )
            let bilingualServices = tenantUpdateReport.servicesUpdateReports
            .filter(
                report => report.updateSuccess === "Not Ok"
            )
            .map( 
                report => this.services.get(parseInt((report.id.split('_'))[1]))
            )
            .filter(services => services.bilingual)
            if(bilingualServices.length === 0) {
                tenantUpdateReport.updateSuccess = errors.codes.Ok 
                return tenantUpdateReport
            }
            else{
                return Promise.all(bilingualServices.map(service => service.updatePlans()))
                .then(services => {
                    tenantUpdateReport.updateSuccess = errors.codes.Ok 
                    return tenantUpdateReport
                })
            }
        })
}


module.exports = {
    tenants
}
