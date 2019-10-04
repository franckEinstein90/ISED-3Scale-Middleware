"use strict";
const t = require('./tenants').tenants;


const userInfo = (function() {

    let tenants, getTenantClientIDs;

    tenants = []
    getClientAccounts = async function({userEmail}) {
        let apiCallPromises = tenants.map(tenant => tenant.getAccountInfoPromise(userEmail))
        Promise.all(apiCallPromises)
        .then(function(results) {
            results.forEach((result, idx) => {
                if (typeof result === 'object') {
                    tenants[idx].addAccount({userEmail,accountInfo: result})
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
            dataJSON.master.tenants.forEach(tenantInfo => {
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
            let firstFetch = await getClientAccounts({
                userEmail
            })
        }

    }
})()

module.exports = {
    userInfo
}
