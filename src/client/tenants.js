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
        onReady: function(){
            $.get('/getTenantNames', {}, data => {
               data.forEach(tName => tenantsInfo.set(tName, ''))
            })
            .done(x => {
                tenantsInfoReady = true
            })
        }
    }
})()

module.exports = {
    tenants
}