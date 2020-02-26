/*******************************************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * Application APICan - 2020
 * -------------------------------------
 *  Module services.js
 *
 *  routes definition for service information
 ******************************************************************************/
"use strict"

/*****************************************************************************/
const tenantsManager = require('@tenants/tenantsManager').tenantsManager
/*****************************************************************************/
const serviceInspectRoutes = (function() {

    return {
        
        getServiceInfo: async function(req, res, next) {

            let tenantName  = req.query.tenant
            let serviceID   = req.query.service

            let tenant = tenantsManager.getTenantByName(tenantName)
            let service = tenant.services.register.get(Number(serviceID))
            let documentation = []
            service.documentation.forEach((docSet, docName) => {
                documentation.push({
                    docSet,
                    docName
                })
            })
            let serviceInfoResponse = {
                state: service.state,
                tenantName,
                serviceID,
                documentation,
                registrationRequired: service.end_user_registration_required,
                systemName: service.system_name,
                created_at: service.created_at,
                updatedAt: service.updated_at, 
                plans: service.plans
            }
            if (tenantName === 'ised-isde') {
                service.getServiceUsageMetrics()
                    .then(response => {
                        if (response) {
                            serviceInfoResponse.stats = response
                        }
                    })
                    .finally(x => res.send(serviceInfoResponse))
            } else {
                res.send(serviceInfoResponse)
            }
        }
    }
})()


module.exports = {
    serviceInspectRoutes
}


