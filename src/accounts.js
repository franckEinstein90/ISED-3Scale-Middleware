"use strict";
const moment = require('moment');

const accounts = (function() {
    return {
        Account: class {
            constructor(accountID) {
                this.AccountID = accountID
/*                this.links = accountInfo.links
                this.uniqueAccountID = accountInfo.unique_account_id || null
                this.creationDate = moment(accountInfo.created_at)
                this.lastUpdate = moment(accountInfo.updated_at)
                this.applications = []*/
            }
        }
    }
})()

accounts.Account.prototype.addApplication = function (application){
    let app = application.application
    let newApp = {
        id: application.application.id,
        state: application.application.state,
        created_at: application.application.created_at, 
        user_key: application.application.user_key,
        service_id : application.application.service_id, 
        links: application.application.links, 
        description: application.application.description, 
        name: application.application.name

    }
    this.applications.push(newApp)
}
module.exports = {
    accounts
}