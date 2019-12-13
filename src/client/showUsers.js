"use strict"

const keyCloakUsers = (function(){
    let userProfiles = []

    return {
        showUsers:function(userData){
            userProfiles = userData
            $('#userSelectionTable').empty()
            userData.forEach(userProfile => {
                if('notFound' in userProfile){
                    $('#userSelectionTable').append(`<tr><td>${userProfile.email}</td><td>No</td></tr>`)//${emailVerified}${otpVerified}${enableOTP}</tr>`)
                }
                if('id' in userProfile){
                    let otpEnabled = userProfile.disableableCredentialTypes.includes('otp') || userProfile.requiredActions.includes('CONFIGURE_TOTP')
                    let otpStatus = `<td>${otpEnabled?'Yes':'No'}</td>`
                    let emailVerified = `<td>${userProfile.emailVerified}</td>`
                    let otpVerified = `<td>${userProfile.disableableCredentialTypes.includes('otp')}</td>`
                    let enableOTP = `<td><input class="w3-check enforceOTPCheck" value='${userProfile.email}' type="checkbox" ${otpEnabled?'disabled':''}></td>`
                    $('#userSelectionTable').append(`<tr><td>${userProfile.email}</td><td>Yes</td>${otpStatus}${otpVerified}${enableOTP}</tr>`)
                }
            })
        }
    }
})()

module.exports = {
   keyCloakUsers 
}