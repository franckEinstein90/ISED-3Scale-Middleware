"use strict"

const keyCloakUsers = (function(){
    let userProfiles = []

    return {
        showUsers:function(userData){
            userProfiles = userData
            userData.forEach(userProfile => {
                let otpEnabled = userProfile.disableableCredentialTypes.includes('otp') || userProfile.requiredActions.includes('CONFIGURE_TOTP')
                let emailVerified = `<td>${userProfile.emailVerified}</td>`
                let otpVerified = `<td>${userProfile.disableableCredentialTypes.includes('otp')}</td>`
                let enableOTP = `<td><input class="w3-check" type="checkbox" ${otpEnabled?'disabled':''}></td>`
                $('#searchResults').append(`<tr><td>${userProfile.email}</td>${emailVerified}${otpVerified}${enableOTP}</tr>`)
            })
        }
    }
})()

module.exports = {
   keyCloakUsers 
}