"use strict"

const keyCloakUsers = (function(){
    let userProfiles = []

    return {
        showUsers:function(userData){
            userProfiles = userData
            $('#userSelectionTable').empty()
            userData.forEach(userProfile => {
                if('notFound' in userProfile){
                    addUserRow({
                        email: userProfile.email, 
                        keyCloakAccount: 'no', 
                        otpEnabled: 'N/A', 
                        otpVerified: 'N/A', 
                    })
//                    $('#userSelectionTable').append(`<tr><td>${userProfile.email}</td><td>No</td></tr>`)
                    //${emailVerified}${otpVerified}${enableOTP}</tr>`)
                }
                if('id' in userProfile){
                    let otpEnabled = userProfile.disableableCredentialTypes.includes('otp') || userProfile.requiredActions.includes('CONFIGURE_TOTP')
                    let emailVerified = `<td>${userProfile.emailVerified}</td>`
                    let otpVerified = `<td>${userProfile.disableableCredentialTypes.includes('otp')}</td>`
                    addUserRow({
                            email: userProfile.email, 
                            keyCloakAccount: 'yes', 
                            otpEnabled: `${otpEnabled?'Yes':'No'}`,
                            otpVerified, 
                    })
//                    $('#userSelectionTable').append(`<tr><td>${userProfile.email}</td><td>Yes</td>${otpStatus}${otpVerified}${enableOTP}</tr>`)
                }
            })
        }
    }
})()

module.exports = {
   keyCloakUsers 
}