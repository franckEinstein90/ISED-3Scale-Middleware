"use strict";
const t = require('@src/tenants').tenants;


const tenantsManager = (function() {

    let env, applicationAPIURI, tenants
    tenants = []

    return {

        languages: {
            francais: 2,
            english: 1
        },

        //on ready is run once at application startup
        onReady: function(dataJSON) {
            env = dataJSON.env
            applicationAPIURI = (env === "dev"? ".dev" : "") + ".api.canada.ca/admin/applications/"
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
            let newLink = function(tenant, account, application){
                let link = {
                    rel: "self_new", 
                    href: [`https://${tenant.name}`, 
                            `${applicationAPIURI}${application.id}`].join('') 
                }
                return link
            }

            let apiCallPromises = tenants.map( tenant => tenant.getAccountInfo(userEmail))
            Promise.all(apiCallPromises)
            .then(function(results) {
                let tenantsWithApplications = results.filter(x => x instanceof t.Tenant)
                tenantsWithApplications.forEach(tenant => {
                    tenant.accounts.forEach((account, email) =>{
                        account.applications.forEach(application =>{
                            application.application.links.push(newLink(tenant, account, application.application))
                        })
                    })
                })
                console.log(tenantsWithApplications)


                //results.filter( x ...)
             })
        }

    }
})()

module.exports = {
    tenantsManager
}
