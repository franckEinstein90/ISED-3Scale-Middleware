/*******************************************************************************
 * Franck Binard, ISED - 2020
 * FranckEinstein90 - franck.binard@canada.ca
 * 
 * Production application code at: https://github.com/ised-isde-canada/apican
 * 
 * Application APICan
 * -------------------------------------
 *  tenantRoutes.js : Implements tenant related routes 
 *
 *  Server setup
 ******************************************************************************/
"use strict"
/*****************************************************************************/
const tenantsManager = require('@tenants/tenantsManager').tenantsManager

const tenantRoutes = (function(){

    return{
        getRefreshTenants: function(req, res, next){
           tenantsManager.updateTenantInformation() 
        }, 

        getTenants: async function(req, res, next){
            res.send(tenantsManager.tenants().map(t => {
                let response = {
                    name: t.name,
                    numServices: t.services.register.size
                }
                return response
            }))
        }, 
        
        getTenantAccounts: async function(req, res, next){
            let tenantName = req.query.tenantName
            let tenant = tenantsManager.getTenantByName(tenantName)
            tenant.getAccounts()
            .then(x => {
                res.send(x)
            })
        }

    }
})()

module.exports = {
    tenantRoutes
}