/***************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 ***************************************/

"use strict";

const request = require('request')
const accounts = require('./accounts').accounts

const tenants = (function() {

    return {
        codes:{
            noAccount: 1, 
            noApplications: 2, 
            updatedAccountInfo:3, 
            applicationsNotFound: 4, 
            serviceNotFound: 5
        }, 
        Tenant: class {

            constructor(tenantJSONInfo) {
                this.name = tenantJSONInfo.name
                this.adminDomain = tenantJSONInfo.admin_domain
                this.domain = tenantJSONInfo.domain
                this.description = {
                    en: tenantJSONInfo.description_en,
                    fr: tenantJSONInfo.description_fr
                }
                this.accounts = new Map() //indexed by email addresses
                this.accessToken = tenantJSONInfo.access_token
                this.accountAdminBaseURL = {
                    accounts: `https://${this.adminDomain}/admin/api/accounts/`,
                    services: `https://${this.adminDomain}/admin/api/services.json?access_token=${this.accessToken}`
                }
            }
        }
    }

})()

tenants.Tenant.prototype.getAccountInfo = async function(clientEmail){
    let apiCall = this.getAccountInfoPromise(clientEmail)
    let that = this
    return new Promise((resolve, reject) =>{
        apiCall.then( function(result){
            if(result === tenants.codes.noAccount){
                return resolve(result)
            }else{
                console.log(`adding account ${result.id} to tenant ${that.name}`)
                that.accounts.set(clientEmail, new accounts.Account(result));
                return tenants.codes.updatedAccountInfo 
            }
        }, function(){
            console.log("failed")
        })
        .then(function(result){
            if(result === tenants.codes.noAccount){ //did not found any accounts
                resolve(result)
            }
            else{
                let apiCall2 = that.getTenantSubscriptionKeysForUserPromise({userEmail: clientEmail})
                apiCall2.then(function(result){
                    if(result === tenants.codes.applicationsNotFound){
                        resolve(result)
                    }
                    else{
                       resolve("updated this") 
                    }
                })
            }
        })
        
    })
}


tenants.Tenant.prototype.getAccountInfoPromise = function(clientEmail) {
    //returns a promise that gets the user info from the api

    let apiCall = [this.accountAdminBaseURL.accounts,
        "find.json?",
        `access_token=${this.accessToken}&`,
        `email=${encodeURIComponent(clientEmail)}`
    ].join('')


    return new Promise((resolve, reject) => {
        request(apiCall, function(err, response, body) {
            if (err) {
                return resolve(`{"status":"Not Found"}`)
            }
            try {
                let result = JSON.parse(body)
                if('status' in result){
                    console.log('bad')
                    return resolve(tenants.codes.noAccount)
                }
                else{
                    let accountInfo = JSON.parse(body).account
                    resolve(accountInfo)
                }
          } catch (e) {
                resolve(e)
            }
        })
    })
}

tenants.Tenant.prototype.getTenantSubscriptionKeysForUserPromise = function({ userEmail }) {
    let apiCall, accountID, that
    that = this

    if(this.accounts.has(userEmail)){
        accountID = this.accounts.get(userEmail).AccountID
        apiCall = [this.accountAdminBaseURL.accounts,
            accountID,
            `/applications.json?access_token=${this.accessToken}`
        ].join('')
    
        return new Promise((resolve, reject) => {
            request(apiCall, function(err, response, body) { 
                if(err) {resolve(`{"status":"Not Found"}`)}
                try{
                    console.log(that.name)
                    let applications = JSON.parse(body).applications
                    if (applications.length === 0){
                        resolve(tenants.codes.applicationsNotFound)
                    }
                    else{
                        //add the applications to the correspnding accont
                        applications.forEach(application => that.accounts.get(userEmail).applications.push(application))
                        resolve(applications)
                    }
                } catch(e){
                    resolve(e)
                }
            })
        })
    }
}

tenants.Tenant.prototype.getApiInfo = async function() {
   return new Promise((resolve, reject) => {
       this.getApisPromise()
        .then( function (result){
            console.log(result)
        })
   }) 
}

tenants.Tenant.prototype.getApisPromise = function(){
    let that = this
    return new Promise((resolve, reject) => {
        request(that.accountAdminBaseURL.services, function(err, response, body) {
            if (err){
                return resolve(tenants.codes.serviceNotFound)
            }
            try {
                let result = JSON.parse(body)
                return resolve(result)
            }catch (e) {
                resolve(e)
            }
        })
    })
}
module.exports = {
    tenants
}
