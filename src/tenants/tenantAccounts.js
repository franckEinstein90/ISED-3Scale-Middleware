/*****************************************************************************/
"use strict"
/*****************************************************************************/
const validator = require('validator')
/*****************************************************************************/
const alwaysResolve = require('@src/utils/alwaysResolve').alwaysResolve

const addAccountInterface = tenantProto => {

   tenantProto.getAccountList = function() {
      //returns array all accounts for that tenant
      let apiCall = [`https://${this.adminDomain}/admin/api/`,
       `accounts.json?access_token=${this.accessToken}`
      ].join('')

      let bad = null
      let processGoodResponse = function(body) {
         if (validator.isJSON(body)) {
           let accounts = JSON.parse(body)
           if ('accounts' in accounts) accounts = accounts.accounts
           if (accounts !== undefined) return accounts
           return body
         }
         return bad //couldn't parse response
      }

      return alwaysResolve(apiCall, {
         good: processGoodResponse,
         bad
      })
   }
   
   tenantProto.getAccounts = function() {
      return new Promise((resolve, reject) => {
          this.getAccountList()
              .then(function(accountList) {
                  resolve(accountList.map(accObj => accObj.account))
              })
         })
   }
}


module.exports = {
   addAccountInterface
}
