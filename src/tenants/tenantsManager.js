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

/**********************************************************************************/
const moment = require('moment')
const errors = require('@src/errors').errors
/**********************************************************************************/
const Tenant = require('@src/responses').tenants.Tenant
/**********************************************************************************/

const tenantsManager = (function() {

    let _tenants = []
    let _updateRegister = new Map()

    return {
        tenants: _ => _tenants,

        configure: function( apiCan ) {
            return new Promise((resolve, reject) => {
                apiCan.data.tenants.forEach((tenantInfo, tenantName) => {
                    if (tenantInfo.visible) {
                        _tenants.push(new Tenant(tenantInfo, apiCan.env))
                        apiCan.say(`Added ${tenantName} to tenant register`)
                    }
                })
                return resolve(apiCan)
            })
        },

        updateTenantInformation: async function(listToUpdate = null) {
            /********************************************************
             * Called by cron job, updates all tenant information in 
             * memory. If listToUpdate specified, tenant manager 
             * only updates specified tenants
             * *****************************************************/
            let tenantsToUpdate = listToUpdate 
                    ? listToUpdate.map(tName => _tenants.find(t => t.name === tName))
                    : /*all*/ _tenants

            let registerUpdatedTenants = tenantsUpdateReport => {
                tenantsUpdateReport.forEach(updateReport => {
                    let currentTime = moment()
                    updateReport.endUpdateTime = currentTime
                    if (updateReport.updateSuccess === errors.codes.Ok) {
                        _updateRegister.set(updateReport.tenantName, currentTime)
                    }
                })
                return tenantsUpdateReport
            }

            return Promise.all(tenantsToUpdate.map(tenant => {
                    return tenant.updateApiInfo()
                }))
                .then(updateReports => {
                    return registerUpdatedTenants(updateReports)
                })
        }
    }
})()

module.exports = {
    tenantsManager
}
