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
    let _app = null
    let _updateRegister = new Map()

    return {  

        getTenantByName: tenantName => _tenants.find(t => t.name === tenantName),

        tenants: _ => _tenants,

        lastUpdate  : tenant => {
            if(_updateRegister.has(tenant)) {
                return _updateRegister.get(tenant)
            }
            else{ 
                return "Not Updated"
            }
        }, 
        
        configure: function( apiCan ) {
            _app = apiCan
            apiCan.tenants.list.forEach( t => {
                apiCan.tenants.register.set(t.name, new Tenant(t, apiCan.data.env.env))
            })
        },            

        updateTenantInformation: async function(listToUpdate = null) {
            /********************************************************
             * Called by cron job, updates all tenant information in 
             * memory. If listToUpdate specified, tenant manager 
             * only updates specified tenants
             * *****************************************************/
            let _tenants = _app.tenants.list
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


const addTenantManagementModule = function( app ){
    tenantsManager.configure(app)
    app.tenants.updateTenantInformation = tenantsManager.updateTenantInformation
}
module.exports = {
   addTenantManagementModule 
}
