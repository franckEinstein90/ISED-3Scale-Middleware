/*******************************************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * -------------------------------------
 * All to do with the application's keeping of logs 
 ******************************************************************************/
"use strict"
/******************************************************************************/
const tenantsManager = require('@src/tenants/tenantsManager').tenantsManager
/******************************************************************************/


//see Req 2a 
//https://wiki.ised-isde.canada.ca/display/~franck.binard@canada.ca/Requirement+2%3A+Answer+api.json+Requests
let tenantToAPIJson = function(tenant, language) {
    let featureSelect = s => {
        return s.features.size === 0
    }
    let name            = tenant.name
    let description     = tenant.description(language)
    let maintainerTag   = tenant.maintainerTag(language)

    let apis  = 
        tenant.services.filter(s => s.bilingual && featureSelect(s))
        .map(s => s.outputAPIDescription(language))

    return {
        name, 
        description, 
        maintainerTag,
        apis
    }
}


const getApiInfo = function({
    userEmail,
    language, 
    tenantDomain
}) {
    let tenants = tenantsManager.tenants()
    if (userEmail === null) {
        if( tenantDomain.length > 0){
            let tenantDomainTemp = tenantDomain.map( tName => tenants.find(t => t.name === tName))
            tenantDomain = tenantDomainTemp
        } else {
            tenantDomain = tenants 
        }

        return JSON.stringify(tenantDomain.map(t => tenantToAPIJson(t, language)))
    }
    //if there is an email associated with the request
    let user = new UserAccount(userEmail)
    let planUpdatePromises = tenants.map(tenant => user.getPlans(tenant))
    return Promise.all(planUpdatePromises)
        .then(function(result) {
            return userApiInfoResponse(result, user, language)
        })
}

module.exports = {
    getApiInfo
}