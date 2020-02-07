"use strict"

const Tenant = require('@src/responses').tenants.Tenant

const tenantsManager = (function(){

    let _tenants = []

    return {
        configure: function( appData ){
            return new Promise((resolve, reject) => {
                appData.data.tenants.forEach( (tenantInfo, tenantName) => {
                    if (tenantInfo.visible) {
                        _tenants.push ( new Tenant( tenantInfo, appData.env ))
                        appData.say(`Added ${tenantName} to tenant register`)
                    }
                })
                resolve( appData )
            })
        }
    }
})()

module.exports = {
    tenantsManager
}