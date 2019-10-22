"use strict";
const moment = require('moment');

const accounts = (function() {
    return {
        Account: class {
            constructor(accountID, email) {
                this.accountID = accountID
	        this.accountEmail = email
           }
        }
    }
})()

accounts.Account.prototype.setBasicAccountInfo = function(accountInfo){
	this.links = accountInfo.links
        this.uniqueAccountID = accountInfo.unique_account_id || null
        this.creationDate = moment(accountInfo.created_at)
        this.lastUpdate = moment(accountInfo.updated_at)
        this.applications = []
}

accounts.Account.prototype.addApplication = function (application){
   this.applications.push(application)
}

accounts.Account.prototype.associatePlans = function(planIDs){
   	this.plans = planIDs 
}
module.exports = {
    accounts
}
