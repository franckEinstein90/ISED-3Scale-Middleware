"use strict";

const accounts = (function() {
    return {
        Account: class {
            constructor(accountJSONInfo) {
                this.AccountID = accountJSONInfo.account.id
            }
        }
    }
})()

module.exports = {
    accounts
}