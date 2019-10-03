"use strict";
const rp = require('request-promise')
const accounts = require('./accounts').accounts

const tenants = (function(){

    return{ 

        Tenant: class { 
            constructor(tenantJSONInfo){
                this.name = tenantJSONInfo.name
                this.adminDomain = tenantJSONInfo.admin_domain
                this.domain = tenantJSONInfo.domain
                this.description = {
                    en: tenantJSONInfo.description_en, 
                    fr: tenantJSONInfo.description_fr
                }
                this.accounts = new Map() //indexed by email addresses
                this.accountAdminAccountBaseURL = `https://${this.adminDomain}/admin/api/accounts/`
                this.accessToken = tenantJSONInfo.access_token
            }
        }
    }

})()

tenants.tenant.prototype.getAccountInfo = function(clientEmail){

    let newAccount, apiCall;
    let that = this; 

    apiCall  =   this.accountAdminAccountBaseURL + 
                    `find.json?access_token=${this.accessToken}&email=${encodeURIComponent(clientEmail)}`
    let options = {
        uri: apiCall, 
        headers: {
            'Content-Type': 'application/json', 
            'Accept': 'applicaton/json', 
            'User-Agent': 'ISED Middleware'
        } , 
        transform: function(body, response, resolveWithFullResponse){
           let parsedBody
           if(response.headers['content-type'] === 'application/json; charset=utf-8'){
               parsedBody = JSON.parse(body)
           }
           if(parsedBody.status && parsedBody.status === "Not found") {return null}
           let newAccount = new accounts.Account(parsedBody)
           if(that.accounts.has(clientEmail)){
               that.accounts.get(clientEmail).push(new accounts.Account(parsedBody))
           }
           else{
                that.accounts.set(clientEmail, [new accounts.Account(parsedBody)])
                return newAccount
           }
        }
    }

    //let apiCallResult =
    rp(options)
    /*    .then(x => {
            console.log(x)
        })
        .catch(function(err){
            console.log("call failed")
        })*/
}

module.exports = {
    tenants
}
