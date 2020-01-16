
"use strict"

const dataExchangeStatus = require('./dataExchangeStatus').dataExchangeStatus
const tenants = require('./tenants').tenants

const storeUsers = (function(){

    let dataTableHandle = null
    let groups = new Map()
    let newGroupDefaultName = _ => `group_${groups.size}` 


    return{
        onReady: function(dth){
            dataTableHandle = dth
        },

        Group: function(){

            this.tenants = [] 
            this.userProperties = [] 

            let newGroupName = $('#userGroupName').val()
            let groupEmailPattern = $('#groupEmailPattern').val()

            tenants.names().forEach( tName =>{
                if($(`#${tName}SearchSelect`).is(":checked")){
                    this.tenants.push(tName)
                }
            })

            if($('#providerAccountSearchSelect').is(":checked")){
                this.userProperties.push('providerAccount')
            }
            if($('#keyCloakAccountSelect').is(":checked")){
                this.userProperties.push('keyCloakAccount')
            }
            if($('#otpNotEnabledSelect').is(":checked")){
                this.userProperties.push('otpNotEnabled')
            }

            $.post('/newUserGroup', {
                'userProperties[]':this.userProperties, 
                name: newGroupName, 
                groupEmailPattern, 
                'tenants[]': this.tenants
            })
            groups.set(newGroupName, this)
            $('#userFormGroupList tbody').append(
                [   `<tr>`, 
                    `<td><span class='w3-text-red'>${newGroupName}</span></td>`,
                    `<td><button id='${newGroupName}View'> view </button></td>`,
                    `<td><button id='${newGroupName}properties'> properties </button></td>`,
                    `<td>fdsa</td>`,
                    `</tr>`
                ].join(''))

            storeUsers.viewButton(newGroupName, {tenants: this.tenants, userProperties: this.userProperties})
        },

        viewButton : function(groupName, parameters){
            $('#' + groupName+'View').click(function(event){
                event.preventDefault()
                document.getElementById('userGroupsModal').style.display='none'
                dataExchangeStatus.setLoading()
                //fetches and shows user daya associated with this user group
                userSelectionTable
                $.get('/findUsers', parameters, function(data){
                    dataExchangeStatus.setInactive()
                    dataTableHandle.clear().draw()
                    keyCloakUsers.showUsers(data)
                })
            })
        },

        selectUserFromSelectedTableRow : function(dataRow){
            let selectedUser = (dataTableHandle.row(dataRow).data())[0]
            return selectedUser
        },

        addUserRow : function({
            email, 
            keyCloakAccount,
            otpEnabled, 
            otpVerified
        }){
    
        dataTableHandle.row.add([
            email,
            keyCloakAccount, 
            otpEnabled,
            otpVerified
        ]).draw( false )
      }

    }

})()

const keyCloakUsers = (function(){
    let userProfiles = []

    return {
        showUsers:function(userData){ 
            userProfiles = userData
            $('#userSelectionTable').empty()
            userData.forEach(userProfile => {
                if('notFound' in userProfile){
                    users.addUserRow({
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
                    users.addUserRow({
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
    storeUsers, 
    keyCloakUsers 
}