"use strict"

const tenantsManager = require('@services/tenantsManager').tenantsManager

const tenantRoutes = (function(){

    return{
        getTenantNames: async function(req, res, next){
            res.send(tenantsManager.tenants().map(t => t.name))
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