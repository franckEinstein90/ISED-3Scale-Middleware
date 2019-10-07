"use strict";
const t = require('@src/tenants').tenants;


const tenantsManager = (function() {

    let tenants = []

    return {

        languages: {
            francais: 2,
            english: 1
        },

        //on ready is run once at application startup
        onReady: function(dataJSON) {
            //construct tenant instances from dataJSON
            dataJSON.tenants.forEach(tenantInfo => {
                if (tenantInfo.visible) {
                    let newTenant = new t.Tenant(tenantInfo);
                    tenants.push(newTenant)
                }
            })
        },


        getApiInfo:  async function({
            userEmail, 
            language
        }){
            let apiCallPromises = tenants.map( tenant => tenant.getApiInfo())
            Promise.all(apiCallPromises)
            .then(function (results){
                console.log(result)
            })
          },

        getUserInfo: async function({
            userEmail,
            language
        }) {
          
            let apiCallPromises = tenants.map( tenant => tenant.getAccountInfo(userEmail))
            Promise.all(apiCallPromises)
            .then(function(results) {
                console.log(results)
             })
        }

    }
})()

module.exports = {
    tenantsManager
}
