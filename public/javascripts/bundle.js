(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict"


const dataExchangeStatus = (function(){
    let dataLoading = false
    return{
        setLoading: function(){
            dataLoading = true
            document.getElementById('loadingIndicator').style.display='block'
        },
        setInactive: function(){
            dataLoading = false
            document.getElementById('loadingIndicator').style.display='none'
        }
    }
})()

module.exports = {
    dataExchangeStatus
}
},{}],2:[function(require,module,exports){
/***********************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * -------------------------------------
 *  main.js / client side
 *
 **********************************************************/

"use strict"
const tenantsInfo = require('./showUsers').tenantsInfo
const users = require('./showUsers').users
const keyCloakUsers = require('./showUsers').keyCloakUsers

const timer = (function(){
    return {
        eachMinute: function(){
            $.get('/appStatus', {}, function(data){
                $('#appStatus').text(
                    [`ISED API Store Middleware - status ${data.state}`, 
                     `online: ${data.runningTime} mins`, 
                     `next refresh: ${data.nextTenantRefresh} mins`].join(' - ')
                )
            })
        }
    }
})()




const selectedUsers = (function(){
    let selectedUsers = new Map()

    return{
        toggleSelectedUser: function(userEmail){
            if(selectedUsers.has(userEmail)){
                selectedUsers.delete(userEmail)
            }
            else{
                selectedUsers.set(userEmail, 1)
            }
            
            $('#individuallySelectedUsers').text('fdsa')
        }

    }
})()





$(function(){

    const socket = io()
    tenantsInfo.onReady()

    users.onReady($('#selectedUsersList').DataTable())
     
    //status msg in top nav
    timer.eachMinute()
    setInterval(timer.eachMinute, 10000)

    
    let appStatus = $('#appStatus').text()
	
    if (appStatus === 'running'){
	
    }

    $('#createNewGroup').click(function(event){
        event.preventDefault()
        if(tenantsInfo.ready()){
            let newUserGroup = new users.Group()
        }
    })

    socket.on('refresh page', function(tenants){

    })
    
  
    $('#manageUsersBtn').click(function(event){
        $('#searchResults').empty()
        document.getElementById('id01').style.display='block'
    }) 

    $('#selectedUsersList tbody').on('click', 'tr', function(){
		$(this).toggleClass('selected')
		let selectedUserEmail = users.selectUserFromSelectedTableRow(this) 
		selectedUsers.toggleSelectedUser(selectedUserEmail)
    })

    $('#userActions').click(function(event){
        event.preventDefault()
        let emails = []
        let otpEnforceEmail = $('.enforceOTPCheck')
        otpEnforceEmail.each( function() {
            if ($(this).is(':checked')){
                emails.push($(this).val())
            }
        })

        $.get('/enforceOTP', {emails})
        console.log('e')
    })


    $("#searchUser").click(function(event){
        event.preventDefault()
        $('#searchResults').empty()
        let filter = {
            tenants: [], 
            provideraccounts: $('#providerAccountSearchSelect').is(":checked")
        }
        
        tenantsFilter.forEach((state, tName)=>{
            if($(`#${tName}SearchSelect`).is(":checked")){
                tenantsFilter.set(tName, 'on')
                filter.tenants.push(tName)
            }
            else{
                tenantsFilter.set(tName, 'off')
            }
        })
    
        let parameters = {
            search: $('#userEmail').val(), 
            filter
        }
        $.get('/findUsers', parameters, keyCloakUsers.showUsers)
    })

  
})



},{"./showUsers":3}],3:[function(require,module,exports){
"use strict"
const dataExchangeStatus = require('./dataExchangeStatus').dataExchangeStatus

const tenantsInfo = (function(){

    let tenantsInfo = new Map()
    let tenantsInfoReady = false

    return {
        ready: function(){
            return tenantsInfoReady
        },
        names: function(){
            let tenantNames = []
            tenantsInfo.forEach((_, tName) => tenantNames.push(tName))
            return tenantNames
        }, 
        onReady: function(){
            $.get('/getTenantNames', {}, data => {
               data.forEach(tName => tenantsInfo.set(tName, ''))
            })
            .done(x => {
                tenantsInfoReady = true
            })
        }
    }
})()

const users = (function(){

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

            tenantsInfo.names().forEach( tName =>{
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

            let groupName = newGroupDefaultName() 
            groups.set(groupName, this)
            $('#userGroupsList').append(
                [   `<tr>`, 
                    `<td><span class='w3-text-red'>${groupName}</span></td>`,
                    `<td><button id='${groupName}View'> view </button></td>`,
                    `<td><button id='${groupName}properties'> properties </button></td>`,
                    `</tr>`
                ].join(''))

            users.viewButton(groupName, {tenants: this.tenants, userProperties: this.userProperties})
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
    tenantsInfo, 
    users, 
    keyCloakUsers 
}
},{"./dataExchangeStatus":1}]},{},[2]);
