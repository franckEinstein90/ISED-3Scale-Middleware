/***************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 ***************************************/

"use strict";
const utils = require('@src/utils').utils
const log = require('@src/utils').utils.log
const errHandle = require('@errors').errors.errorHandler
const accounts = require('@src/accounts').accounts
const ServiceRegister = require('@src/services').services.ServiceRegister

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


        Tenant: class {

            constructor(tenantJSONInfo, env) {
                this.env = env
                this.name = tenantJSONInfo.name
                this.maintainers = function(lang) {
                    let maintainerObject = {
                        email: "ic.api_store-magasin_des_apis.ic@canada.ca",
                        url: "https://api.canada.ca",
                        fn: utils.langMsg(lang, {
                            fr: "Equipe du magasin API",
                            en: "GC API Store Team"
                        })
                    }
                    return maintainerObject
                }

                this.apiDescriptions = function(language) {

                    let listOfApis = []
                    this.services.register.forEach(
                        (service, serviceID) => {
                            //checks if there is a valid set of documentation 
                            //attached to this service
                            let apiDesc = service.outputAPIDescription(language)
                            if (apiDesc) listOfApis.push(apiDesc)
                        }
                    )
                    return listOfApis
                }
                this.adminDomain = tenantJSONInfo.admin_domain
                this.domain = tenantJSONInfo.domain
                this.tenantDescription = function(lang) {
                    return (lang === 'en') ? tenantJSONInfo.description_en : tenantJSONInfo.description_fr
                }
                this.accounts = new Map() //indexed by email addresses
                this.visibleServices = []
                this.services = new ServiceRegister(this)
                this.accessToken = tenantJSONInfo.access_token
                this.baseURL = `https://${this.adminDomain}/admin/api/`
                this.accountAdminBaseURL = {
                    services: `https://${this.adminDomain}/admin/api/services.json?access_token=${this.accessToken}`,
                    activeDocs: `${this.baseURL}active_docs.json?access_token=${this.accessToken}`,
                    userPlans: email => `${this.baseURL}accounts/find?access_token=${this.accessToken}&email=${encodeURIComponent(email)}`
                }
            }
        }
    }

})()


tenants.Tenant.prototype.getAccountPlan = function(planInfo, userEmail) {
    if (this.name === "ised-isde") debugger
    //creates a new account object for userEmail 
    // and associates it with its plan ids
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


tenants.Tenant.prototype.getUserApiInfo = async function(userEmail) {

    let accountPlans = new Promise((resolve, reject) => {
        this.getUserPlans(userEmail)
            .then(result => this.getAccountPlan(result, userEmail))
            .then(accountPlan => this.checkAccountPlanFeatures(userEmail, accountPlan))
            .then(x => resolve(x))
    })

}



module.exports = {
    tenants
}
