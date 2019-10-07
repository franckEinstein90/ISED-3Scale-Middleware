"use strict";
const moment = require('moment');

const accounts = (function() {
    return {
        Account: class {
            constructor(accountInfo) {
                this.AccountID = accountInfo.id
                this.links = accountInfo.links
                this.uniqueAccountID = accountInfo.unique_account_id || null
                this.creationDate = moment(accountInfo.created_at)
                this.lastUpdate = moment(accountInfo.updated_at)
                this.applications = []
            }
        }
    }
})()

module.exports = {
    accounts
}