"use strict"

const tenantsManager = require('@tenants/tenantsManager').tenantsManager

const tenantRoutes = (function(){

    return{
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