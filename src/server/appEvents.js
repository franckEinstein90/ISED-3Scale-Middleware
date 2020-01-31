/*******************************************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * Application APICan
 * -------------------------------------
 *  appEvents.js : configures the apps recurring events 
 *
 ******************************************************************************/
"use strict"

const scheduler = require('@src/cron/timer.js').scheduler
const tenantsManager = require('@services/tenantsManager').tenantsManager
const users = require('@users/users').users

let checkResults = function(updateResults) {
    let updateErrors = []
    updateResults.forEach(
        updateReport => {
            if (!updateReport.updateOk()) { //flag update errors
                updateErrors.push(updateReport.tenantName)
            }
        })
    if (updateErrors.length > 0) { //if there were errors, go back and fix
        return tenantsManager.updateTenantInformation(updateErrors)
            .then(checkResults)
    }
}

let updateTenants = function() {
    try {
        tenantsManager.updateTenantInformation()
            .then(results => checkResults(results))
    } catch (err) {
        console.log(err)
    }
}

let getProviderAccountUsers = function(tenantNames) {
    return Promise.all(tenantNames.map(tenantName => {
        let t = tenantsManager.getTenantByName(tenantName)
        return t.getProviderAccountUserList()
    }))
}

const appEvents = (function() {

    let otpEnforce = function() {
        let tenants = tenantsManager.tenants()
            .map(t => t.name)
            .filter(tenantName => tenantName !== 'cra-arc')

        getProviderAccountUsers(tenants)
        .then(tenantAdminAccounts => {
                let userEmails = []
                tenantAdminAccounts.forEach(adminAccounts => {
                    adminAccounts.forEach(account => {
                        if (!userEmails.includes(account.user.email)) {
                            userEmails.push(account.user.email)
                        }
                    })
                })
                let keyCloakProfiles = userEmails.map(email => users.getUserList(email))
                return Promise.all(keyCloakProfiles)
        })
        .then(keycloakAccounts => {
                let userEmails = keycloakAccounts
                    .filter(account => 'totp' in account && account.totp === false)
                    .filter(account => !(account.requiredActions.includes('CONFIGURE_TOTP')))
                    .filter(account => !(account.username === 'fbinard'))
                    .map(account => account.email)
                return Promise.all(userEmails.map(email => users.enforceTwoFactorAuthentication(email)))
            })
        .then(x => {
                console.log('fdsa')
            })
        //enforces otp for API Store users
    }

    return {
        configureTenantRefresh: function(frequency) {
            return scheduler.newEvent({
               eventTitle: 'tenant info refresh', 
               description: 'refreshes service info for each tenant', 
               frequency,
               callback: updateTenants
            })
        },
        configureOTPEnforce: function(frequency) {
            return scheduler.newEvent({
                eventTitle: 'Enforce otp', 
                description: 'Enforces 2FA for tenant admins (xcpt cra)', 
                frequency,
                callback: otpEnforce
            })
        }
    }
})()

module.exports = {
    appEvents
}