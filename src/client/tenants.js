/*******************************************************************************
 * Franck Binard, ISED (FranckEinstein90)
 *
 * APICan Canada API Store control application - 2020
 * -----------------------------------------------------------------------------
 *  Canadian Gov. API Store middleware - client side
 *
 *  tenants.js: tenant related routines 
 *
 ******************************************************************************/
"use strict"

/******************************************************************************/
const tenants = (function(){

    let tenantsInfo = new Map()
    let tenantsInfoReady = false

    return {
        ready: function(){
            return tenantsInfoReady
        },
        names: function(){
            let tenantNames = []
            tenantsInfo.forEach((_, tName) => tenantNames.push(tName))
            return tenantNames
        }, 
        onReady: function(cb){
            $.get('/tenants', {}, tenants => {
               tenants.forEach(tenant => tenantsInfo.set(
                   tenant.name, {
                   services : tenant.numServices
                }))
            })
            .done(x => {
                cb()
                tenantsInfoReady = true
            })
        }
    }
})()

module.exports = {
    tenants
}