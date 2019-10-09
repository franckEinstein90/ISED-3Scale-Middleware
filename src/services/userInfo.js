"use strict";
const t = require('@src/tenants').tenants;
const cache = require('memory-cache')

const tenantsManager = (function() {

    let env, applicationAPIURI, tenants, outputResponse, getApiName
    tenants = []

    getApiName = function({tenant, serviceID, language}){
        let cachedApiName, key
        key = [tenant.name, serviceID, language].join('-')
        console.log("checking this key: " + key) 
        cachedApiName =  cache.get(key)
        if(cachedApiName) return cachedApiName
        key = [tenant.name, serviceID, "default"].join('-')
        cachedApiName = cache.get(key)
        if(cachedApiName) return cachedApiName
        return serviceID
    }
    
   outputResponse = function(userEmail, language){
        let outputJSON, apps, newLink

        outputJSON = {
                userEmail: userEmail
        }
        newLink = function(tenant,  application){
            let link = {
                rel: "self_new", 
                href: [`https://${tenant.name}`, 
                        `${applicationAPIURI}${application.id}?`, 
                        `lang=${language}`].join('') 
            }
            return link
        }
        outputJSON.tenants = tenants.map( function(tenant) {
                apps = []
                if(tenant.accounts.has(userEmail)){
                    tenant.accounts.get(userEmail).applications.forEach(
                        application => {
                            application.links.push(newLink(tenant, application))
                            application.apiname = getApiName({tenant, serviceID: application.service_id, language})
                            delete application.service_id
                            delete application.id
                            apps.push(application)
                        }
                    )
                }
               return {
                    name: tenant.name,
                    description: tenant.tenantDescription(language),
                    applications: apps
                    }
        })
        return JSON.stringify(outputJSON)
    }
    

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
           let apiCallPromises = tenants.map( tenant => tenant.getAccountInfo(userEmail))
           return Promise.all(apiCallPromises)
            .then(function(results) {
                return outputResponse(userEmail, language)
            })
            
        }
    }
})()

module.exports = {
    tenantsManager
}
