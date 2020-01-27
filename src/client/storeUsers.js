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


const getGroupFormInputs = function() {
    //gets the parameters from a new group
    //creation

    let requestTenants = []
    let userProperties = []
    let groupDescription = $('#userGroupDescription').val()
    let newGroupName = $('#userGroupName').val()
    let groupEmailPattern = $('#groupEmailPattern').val()

    tenants.names().forEach(tName => {
        if ($(`#${tName}SearchSelect`).is(":checked")) {
            requestTenants.push(tName)
        }
    })
    if ($('#providerAccountSearchSelect').is(":checked")) {
        userProperties.push('providerAccount')
    }
    if ($('#keyCloakAccountSelect').is(":checked")) {
        userProperties.push('keyCloakAccount')
    }
    if ($('#otpNotEnabledSelect').is(":checked")) {
        userProperties.push('otpNotEnabled')
    }
    return {
        'tenants[]': requestTenants,
        'userProperties[]': userProperties,
        name: newGroupName,
        groupDescription,
        groupEmailPattern
    }
}

const resetGroupFormInputs = function() {
    $('#userGroupDescription').val("")
    $('#userGroupName').val("")
    $('#groupEmailPattern').val("")
}

const storeUsers = (function() {

    let _groups = new Map()

    let dataTableHandle = null	//table that displays user information
    let newGroupDefaultName = _ => `group_${groups.size}`

    let displayGroupsListInForm = function(groupName, groupID) {
        $('#userFormGroupList tbody').append(
            [`<tr>`,
                `<td class="w3-text-green">${groupName}</td>`,
                `<td><i class="fa fa-eye w3-large w3-text-black groupCmd" id="${groupName}View"></i></td>`,
                `<td><i class="fa fa-gears  w3-large w3-text-black groupCmd"></i></td>`,
                `<td><i class="fa fa-trash w3-large w3-text-black groupCmd" id="${groupName}Delete"></i></td>`,
                `</tr>`
            ].join(''))

        $('#' + groupName + 'Delete').click(function(event) {
            storeUsers.deleteGroup(groupName)
        })

        $('#' + groupName + 'View').click(function(event) {
            event.preventDefault()
            storeUsers.displayGroupUsers(groupName)
        })

    }
    let displayGroupsListInLeftNav = function(groupName) {
        $('#leftNavUserGroupList tbody').append(
            [`<tr>`,
                `<td class="groupLeftNavLink">`,
                `<a href="#">${groupName}</a></td>`,
                `</tr>`
            ].join(''))
    }
    let displayGroups = function(groupName) {
        //Displays groups stored in register
        $('#userFormGroupList tbody').empty()
        $('#leftNavUserGroupList tbody').empty()
        _groups.forEach((_, groupName) => {
            displayGroupsListInForm(groupName)
            displayGroupsListInLeftNav(groupName)
        })
    }


    return {
        onReady: function({
            userDisplayList
        }) {
            dataTableHandle = userDisplayList.DataTable()
            $.get('/Groups', {}, function(groups) {
                    groups.forEach(group => {
                        let groupProperties = {
                            ID: group.ID
                        }
                        _groups.set(group.name, groupProperties)
                    })
                })
                .done(displayGroups)
                .fail(error => {
                    debugger
                })
        },

        deleteGroup: function(groupName) {
            $.ajax({
                    method: "DELETE",
                    url: '/group',
                    data: {
                        groupName
                    }
                })
                .done(function(msg) {
                    _groups.delete(groupName)
                    displayGroups()
                })
                .fail(x => {
                    alert('failed')
                })
        },

        displayGroupUsers: function(groupName) {
            document.getElementById('userGroupsModal').style.display = 'none'
            dataExchangeStatus.setLoading()
            //fetches and shows user daya associated with this user group
            let group = {
                group: groupName
            }
            $.get('/GroupUsers', group, function(data) {
                dataExchangeStatus.setInactive()
                dataTableHandle.clear().draw()
                keyCloakUsers.showUsers(data)
            })
        },

        Group: function() {
            let formInput = getGroupFormInputs()
            $.post('/newUserGroup', formInput)
                .done(x => {
                    _groups.set(formInput.name, 1)
                    document.getElementById('userGroupsModal').style.display = 'none'
                    resetGroupFormInputs()
                    displayGroups()
                })
                .fail(x => {
                    alert('error')
                })
        },

        selectUserFromSelectedTableRow: function(dataRow) {
            let selectedUser = (dataTableHandle.row(dataRow).data())[0]
            return selectedUser
        },

        addUserRow: function({
		user, 
            email,
	created,	
            keyCloakAccount,
            otpEnabled,
            otpVerified
        }) {

            dataTableHandle.row.add([
		    user, 
                email,
		    created, 
                keyCloakAccount
            ]).draw(false)
        }

    }

})()

const keyCloakUsers = (function() {
    let userProfiles = []

    return {
        showUsers: function(userData) {
            $('#userSelectionTable').empty()
            userData.forEach(userProfile => {
		storeUsers.addUserRow({
			user: userProfile.username, 
			email: userProfile.email,
			created: userProfile.created_at, 
			keyCloakAccount: 'keyCloakAccount' in userProfile && 'id' in userProfile.keyCloakAccount ? userProfile.keyCloakAccount.id : 'no'
		})
           })
        }
    }
})()

module.exports = {
    storeUsers,
    keyCloakUsers
}
