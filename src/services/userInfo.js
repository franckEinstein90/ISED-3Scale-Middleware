"use strict";
const t = require('@src/tenants').tenants;


const tenantsManager = (function() {

    let tenants, getClientAccounts;

    tenants = []

    getClientAccounts = async function({userEmail}) {
        //maps every tenant to an API call promise
        //and waits for all of them to be xcuted
        //then updates tenant objects
        let apiCallPromises = tenants.map(
            tenant => tenant.getAccountInfoPromise(userEmail))
        Promise.all(apiCallPromises)
            .then(function(results) {
                results.forEach((result, idx) => {
                    if (typeof result === 'object') {
                        let tenant = tenants[idx]
                        console.log(`adding account ${result.id} to tenant ${tenant.name}`)
                      //  tenant.addAccount({userEmail,accountInfo: result})
                    }
             })
         })
         return 1
    }

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


        getUserInfo: async function({
            userEmail,
            language
        }) {
            //update each tenant with the accounts
            //associated to that email
            let updateTenantAccounts = await getClientAccounts({
                userEmail
            })

        }

    }
})()

module.exports = {
    tenantsManager
}
