const tenantsManager = require('@services/userInfo').tenantsManager

const cacheManage = (function() {

    return {
        cronUpdate: function() {
            if (this.runningMinutes === undefined) {
                this.runningMinutes = 0
            }
            this.runningMinutes += 1
            console.log(`- app has been running for ${this.runningMinutes} mins`)
            console.log(`Managing tenants:`)
            tenantsManager.alive()
        },

        updateCache: function() {

        }
    }

})()

module.exports = {
    cacheManage
}