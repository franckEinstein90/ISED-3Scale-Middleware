(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/*******************************************************************************
 * Franck Binard, ISED (FranckEinstein90)
 *
 * APICan application - 2020
 * -------------------------------------
 *  Canadian Gov. API Store middleware - client side
 *
 *  APICan.js: client app admin
 *
 ******************************************************************************/
"use strict"

const tenants = require('./tenants').tenants
const storeUsers = require('./storeUsers').storeUsers
const timer = require('./timer.js').timer

const APICan = (function() {
    let socket = null

    return {
        init: function() {
            socket = io()
            tenants.onReady()
            storeUsers.onReady($('#selectedUsersList').DataTable())
            timer.eachMinute()
            setInterval(timer.eachMinute, 10000)
        },
        run: function() {
            document.getElementById('userGroupsModal').style.display='block'
        }

    }
})()

module.exports = {
    APICan
}
},{"./storeUsers":4,"./tenants":5,"./timer.js":6}],2:[function(require,module,exports){
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
},{}],3:[function(require,module,exports){
/*******************************************************************************
 * Franck Binard, ISED (FranckEinstein90)
 *
 * APICan application - 2020
 * -------------------------------------
 *  Canadian Gov. API Store middleware - client side
 *
 *  main.js: entry point 
 *
 ******************************************************************************/
"use strict"

const APICan = require('./APICan').APICan
//const users = require('./showUsers').users
//const keyCloakUsers = require('./showUsers').keyCloakUsers



const userActions = require('./userActions').userActions
const selectedUsers = (function(){

    let userStore = new Map()

    let toEmailList = function(){
        let userList = []
        userStore.forEach((_, userEmail) => userList.push( userEmail ))
        return userList
    }

    let displayCurrentUserSelection = function(){
        $('#individuallySelectedUsers').text(toEmailList().join(';'))
    }
 
    return{

        toggleSelectedUser: function(userEmail){
            if(userStore.has(userEmail)){
                userStore.delete(userEmail)
            }
            else{
                userStore.set(userEmail, 1)
            }
            displayCurrentUserSelection()
       }, 

       applySelectedActions: function(){
           
           userActions.update( toEmailList() )
       }

   }
})()





$(function(){

  let setUp = function(){
       try{
            console.group("Init APICan Client")
            APICan.init()
            console.groupEnd()
            return true

        } catch( err ){
            errors(err)
            return false
        }
   }

   if( setUp( ) ){
       try {
        APICan.run()
       } catch ( err ){
           errors(err)
       }
   }
})

/*
   

    let userGroupNames = $('#userGroupNames').text().split(',').map(name => name.trim())
    userGroupNames.splice(userGroupNames.length - 1, 1)
	    
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

    socket.on('updateBottomStatusInfo', function(data){
        $('#bottomStatusBar').text(data.message)
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


	$('#userActionGo').on('click', function(){
		selectedUsers.applySelectedActions()
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
*/
  



},{"./APICan":1,"./userActions":7}],4:[function(require,module,exports){

"use strict"

const dataExchangeStatus = require('./dataExchangeStatus').dataExchangeStatus


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
    storeUsers, 
    keyCloakUsers 
}
},{"./dataExchangeStatus":2}],5:[function(require,module,exports){
/*******************************************************************************
 * Franck Binard, ISED (FranckEinstein90)
 *
 * APICan Canada API Store control application - 2020
 * -----------------------------------------------------------------------------
 *  Canadian Gov. API Store middleware - client side
 *
 *  tenants.js: tenant related routines 
 *
 ******************************************************************************/
"use strict"
const tenants = (function(){

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

module.exports = {
    tenants
}
},{}],6:[function(require,module,exports){
/*******************************************************************************
 * Franck Binard, ISED (FranckEinstein90)
 *
 * APICan application - 2020
 * -------------------------------------
 *  Canadian Gov. API Store middleware - client side
 *
 *  APICan.js: client app admin
 *
 ******************************************************************************/
"use strict"
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

module.exports = {
    timer
}
},{}],7:[function(require,module,exports){
/*************************************************************************
 * Client side, trigger user actions
 * 
 *************************************************************************/

 "use strict"

 const userActions = (function(){

    let actions = [
        { action: 'enforceOTP', route:'enforceOTP' } 
    ]
    return {
        update: function(userEmailList, actionList){
            //giving a liste of user addresses
            //enact actions of those users
            let actions = ['enforceOTP']
            let inputData = {
               users: userEmailList 
            }
            $.post('/enforceOTP', inputData, function(data){

            })
        }
    }
 })()

 module.exports = {
     userActions
 }
},{}]},{},[3]);
