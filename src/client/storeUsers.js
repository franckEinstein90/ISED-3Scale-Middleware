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
 
/******************************************************************************/
const APICan = require('./APICan').APICan
const userActions = require('./userActions').userActions
const dataExchangeStatus = require('./dataExchangeStatus').dataExchangeStatus
const tenants = require('./tenants').tenants
/******************************************************************************/


const getGroupFormInputs = function(){
	//gets the parameters from a new group
	//creation

	let requestTenants = []
	let userProperties = []
	let groupDescription = $('#userGroupDescription').val()
   let newGroupName = $('#userGroupName').val()
   let groupEmailPattern = $('#groupEmailPattern').val()
		
	tenants.names().forEach( tName =>{
    	if($(`#${tName}SearchSelect`).is(":checked")){
        		requestTenants.push(tName)
          }
      })
	if($('#providerAccountSearchSelect').is(":checked")){
                userProperties.push('providerAccount')
            }
            if($('#keyCloakAccountSelect').is(":checked")){
                userProperties.push('keyCloakAccount')
            }
            if($('#otpNotEnabledSelect').is(":checked")){
                userProperties.push('otpNotEnabled')
            }
	return {
		'tenants[]':requestTenants, 
		'userProperties[]':userProperties, 
		name:newGroupName,
		groupDescription,
		groupEmailPattern
	}
}

const resetGroupFormInputs = function(){
 $('#userGroupDescription').val("")
 $('#userGroupName').val("")
 $('#groupEmailPattern').val("")
}

const storeUsers = (function(){

    let _groups = new Map()

    let dataTableHandle = null
    let newGroupDefaultName = _ => `group_${groups.size}` 

    let displayGroupsListInForm = function(groupName, groupID){
        $('#userFormGroupList tbody').append(
            [   `<tr>`,
                `<td class="w3-text-green">${groupName}</td>` , 
                `<td><i class="fa fa-eye w3-large w3-text-black groupCmd" id="${groupName}View"></i></td>`, 
                `<td><i class="fa fa-gears  w3-large w3-text-black groupCmd"></i></td>`, 
                `<td><i class="fa fa-trash w3-large w3-text-black groupCmd" id="${groupName}Delete"></i></td>`, 
                `</tr>`
            ].join(''))

            $('#' + groupName+'Delete').click(function(event){  
                storeUsers.deleteGroup(groupName)
            })

            $('#' + groupName+'View').click(function(event){ 
                event.preventDefault() 
                storeUsers.displayGroupUsers(groupName)
            })

    }
    let displayGroupsListInLeftNav = function(groupName){
        $('#leftNavUserGroupList tbody').append(
            [   `<tr>`,
                `<td class="groupLeftNavLink">`, 
                `<a href="#">${groupName}</a></td>` , 
                `</tr>`
            ].join(''))
    }
    let displayGroups = function(groupName){
        //Displays groups stored in register
        $('#userFormGroupList tbody').empty()
        $('#leftNavUserGroupList tbody').empty()
        _groups.forEach((_, groupName)=>{
           displayGroupsListInForm(groupName) 
           displayGroupsListInLeftNav(groupName)
        })
    }


    return{
        onReady: function({userDisplayList}){ 
            dataTableHandle = userDisplayList 
            dataTableHandle.DataTable()
            $.get('/Groups', {}, function(groups){
                groups.forEach(group =>{
                    let groupProperties = {
                        ID: group.ID
                    }
                    _groups.set(group.name, groupProperties)
                })
            })
            .done( displayGroups )
            .fail(error=>{
                    debugger
            })
        },
        
        deleteGroup: function(groupName){
            $.ajax({
                method: "DELETE", 
                url: '/group',
                data: {groupName} 
            })
            .done(function(msg){
                _groups.delete(groupName)
                displayGroups()
            })
            .fail(x => {
                alert('failed')
            })
        },
        
        displayGroupUsers: function( groupName ){
            document.getElementById('userGroupsModal').style.display='none'
            dataExchangeStatus.setLoading()
            //fetches and shows user daya associated with this user group
            let group = {group: groupName}
            $.get('/GroupUsers', group, function(data){
                dataExchangeStatus.setInactive()
                dataTableHandle.clear().draw()
                keyCloakUsers.showUsers(data)
            })
        },

        Group: function(){
          	let formInput = getGroupFormInputs() 
            $.post('/newUserGroup', formInput)
            .done( x => {
                _groups.set(formInput.name, 1)
					 resetGroupFormInputs()
                displayGroups()
            })
            .fail( x => {
                alert('error')
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
