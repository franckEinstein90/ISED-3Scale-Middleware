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

/******************************************************************************/
const tenants = require('./tenants').tenants
const storeUsers = require('./storeUsers').storeUsers
const storeServices = require('./storeServices').storeServices
/******************************************************************************/
const timer = require('./timer.js').timer
const userGroupsDialog = require('./dialogs/userGroupsDialog').userGroupsDialog
const ui = require('./ui').ui
/******************************************************************************/

const selectedUsers = (function() {

    let userStore = new Map()

    let toEmailList = function() {
        let userList = []
        userStore.forEach((_, userEmail) => userList.push(userEmail))
        return userList
    }

    let displayCurrentUserSelection = function() {
        $('#individuallySelectedUsers').text(toEmailList().join("\n"))
    }

    return {

        toggleSelectedUser: function(userEmail) {
            if (userStore.has(userEmail)) {
                userStore.delete(userEmail)
            } else {
                userStore.set(userEmail, 1)
            }
            displayCurrentUserSelection()
        },

        applySelectedActions: function() {
            userActions.update(toEmailList())
        }

    }
})()

const APICan = (function() {
    let socket = null

    let setUI = function() {
        userGroupsDialog({
            jqCreateNewGroupButton: $('#createNewGroup')
        })

        $('.navGroupLink').click(function(event) {
            debugger
        })

        $('.groupCmdRow').each(function(grpCmds) {
            debugger
        })

        $('#selectedUsersList tbody').on('click', 'tr', function() {
            $(this).toggleClass('selected')
            let selectedUserEmail = storeUsers.selectUserFromSelectedTableRow(this)
            selectedUsers.toggleSelectedUser(selectedUserEmail)
        })

        $('#showScheduler').on('click', function(event){
            event.preventDefault()
            document.getElementById('scheduleInspectModal').style.display = 'block'
            $.get('/schedule', {}, function(events) {
                $('#scheduleInfo tbody').empty()
                events.forEach(info => {
                $('#scheduleInfo tbody').append(`<tr><td>${info.id}</td><td>${info.eventTitle}</td><td>${info.description}</td><td>${info.frequency}</td><td>${info.lastRefresh}</td></tr>`)
                })
            })
        })
    }


    let storeModulesReady = function() {
        storeUsers.onReady({
            userDisplayList: $('#selectedUsersList')
        })

        storeServices.onReady({

        })

    }

    return {
        init: function() {
            socket = io()
            socket.on('updateBottomStatusInfo', function(data) {
                $('#bottomStatusBar').text(data.message)
            })

            tenants.onReady(setUI)
            storeModulesReady()
            timer.eachMinute()
            setInterval(timer.eachMinute, 10000)

        },
        run: function() {

        }

    }
})()

module.exports = {
    APICan
}

},{"./dialogs/userGroupsDialog":3,"./storeServices":5,"./storeUsers":6,"./tenants":7,"./timer.js":8,"./ui":9}],2:[function(require,module,exports){
"use strict"


const dataExchangeStatus = (function() {
    let dataLoading = false
    return {
        setLoading: function() {
            dataLoading = true
            document.getElementById('loadingIndicator').style.display = 'block'
        },
        setInactive: function() {
            dataLoading = false
            document.getElementById('loadingIndicator').style.display = 'none'
        }
    }
})()

module.exports = {
    dataExchangeStatus
}
},{}],3:[function(require,module,exports){
/*******************************************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware - 2020
 * Application APICan
 * -------------------------------------
 *  dialogs/userGroupsDialog.js
 * 
 * Inits userGroupDialog 
 ******************************************************************************/

"use strict"

/*****************************************************************************/
const storeUsers = require('../storeUsers').storeUsers
const tenants = require('../tenants').tenants
/*****************************************************************************/

let userGroupsDialog = function({
    jqCreateNewGroupButton
}){
    let tenantSelectionCell = tName => {
        return [
            `<td class='tenantSelection'>`, 
            `<label class="w3-text-blue">${tName} &nbsp;&nbsp;</label>`,
            `<input class="w3-check tenantFilterCheckBox" id='${tName}SearchSelect' `, 
            `type="checkbox"></input>`, 
            '</td>'
        ].join('')
    }

    jqCreateNewGroupButton.click(function(event) {
        event.preventDefault()
        if (tenants.ready()) {
            let newUserGroup = new storeUsers.Group()
        }
    })

    let currentRow = ""
    tenants.names().forEach((tenant, index) => {
        if( currentRow.length === 0){
            currentRow = `<TR>${tenantSelectionCell(tenant)}`
        }
        else {
            $('#tenantSelectionTable').append(`${currentRow}${tenantSelectionCell(tenant)}</TR>`)
            currentRow = ""
        }
    })
    if(currentRow.length > 0){
        $('#tenantSelectionTable').append(`${currentRow}<td>&nbsp;</td></TR>`)
    }
}


module.exports = {
    userGroupsDialog
}

},{"../storeUsers":6,"../tenants":7}],4:[function(require,module,exports){
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
const storeUsers = require('./storeUsers').storeUsers
const userActions = require('./userActions').userActions
/******************************************************************************/


$(function() {

    let setUp = function() {
        try {
            console.group("Init APICan Client")
            APICan.init()
            console.groupEnd()
            return true

        } catch (err) {
            errors(err)
            return false
        }
    }

    if (setUp()) {
        try {
            APICan.run()
        } catch (err) {
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


  
    socket.on('refresh page', function(tenants){

    })
    
  
    $('#manageUsersBtn').click(function(event){
        $('#searchResults').empty()
        document.getElementById('id01').style.display='block'
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
},{"./APICan":1,"./storeUsers":6,"./userActions":10}],5:[function(require,module,exports){
/*******************************************************************************
 * Franck Binard, ISED (FranckEinstein90)
 *
 * APICan application - 2020
 * -------------------------------------
 *  Canadian Gov. API Store middleware - client side
 *
 *  storeService.js: client api services module 
 *
 ******************************************************************************/

"use strict"

/******************************************************************************/
const ui = require('./ui').ui
/******************************************************************************/

let drawGraph = function(stats){
	let ctx = document.getElementById('statsGraph').getContext('2d')
	let myChart = new Chart(ctx, {
		type: 'bar',
		data:{
			labels:[
				'june','july','aug','sept','oct','nov','dec','jan','feb'
			],
			datasets:[{
				label:'hits per month',
				data:stats.values
			}], 
			backgroundColor: stats.values.map(s => 'rgba(255, 0, 0, 0.7)'), 
			borderColor: stats.values.map(s => 'rgba(0, 255, 0, 0.7)') 
            
		},
		options:{}
	})
}
let openServiceInspectDialog = function({
	tenant, 
	serviceID
	}){

	document.getElementById('serviceInspectModal').style.display = 'block'
	$('#serviceModalTenantName').text(tenant)
	$('#serviceModalID').text(serviceID) 
	$.get('/serviceInspect', {tenant, service:serviceID}, function(apiInfo) {

		$('#apiInspectFormState').val(apiInfo.state)
		$('#apiInspectFormTenantName').val(apiInfo.tenantName)
		$('#apiInspectFormServiceID').val(apiInfo.serviceID)
		$('#apiInspectFormSystemName').val(apiInfo.systemName)
		$('#apiInspectFormLastUpdate').val(apiInfo.updatedAt)
		$('#apiInspectFormCreationDate').val(apiInfo.created_at)
		$('#apiInspectFormFeatures').html(`${apiInfo.features.map(x => x.name).join('<br/>')}`)
		$('#englishDoc').val(apiInfo.documentation[0].docSet.body)
		$('#frenchDoc').val(apiInfo.documentation[1].docSet.body)
		let tags =[]
		apiInfo.documentation.forEach(d => {
			if('tags' in d.docSet){
				d.docSet.tags.forEach(t => tags.push(t))
			}
		})
		$('#apiTags').text(tags.join(','))
		if('stats' in apiInfo) drawGraph(apiInfo.stats)
	})
	.fail(error => {
		debugger
	})
}

const storeServices = (function() {

    let _setUI = function() {
        $('#visibleAPISelect').on('change', function() {
            ui.showVisibleAPITable(this.value)
        })
		  $('.serviceInspect').click( event => {
				event.preventDefault()
			   let parentTable = event.currentTarget.offsetParent 
			   let tenant = parentTable.id.replace('VisibleAPI', '')
			   let serviceID = Number((event.currentTarget.cells[1]).innerText)
			   openServiceInspectDialog({
					tenant, 
					serviceID
				})
		  })
    }

    return {
        onReady: function(options) {
            _setUI()
        }

    }

})()

module.exports = {
    storeServices
}

},{"./ui":9}],6:[function(require,module,exports){
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
const ui = require('./ui').ui
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

    let dataTableHandle = null //table that displays user information
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
                ui.scrollToSection("userTableSection")
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
},{"./APICan":1,"./dataExchangeStatus":2,"./tenants":7,"./ui":9,"./userActions":10}],7:[function(require,module,exports){
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

/******************************************************************************/
const tenants = (function() {

    let tenantsInfo = new Map()
    let tenantsInfoReady = false

    return {
        ready: function() {
            return tenantsInfoReady
        },
        names: function() {
            let tenantNames = []
            tenantsInfo.forEach((_, tName) => tenantNames.push(tName))
            return tenantNames
        },
        onReady: function(cb) {
            $.get('/tenants', {}, tenants => {
                    tenants.forEach(tenant => tenantsInfo.set(
                        tenant.name, {
                            services: tenant.numServices
                        }))
                })
                .done(x => {
                    cb()
                    tenantsInfoReady = true
                })
        }
    }
})()

module.exports = {
    tenants
}
},{}],8:[function(require,module,exports){
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
const timer = (function() {
    return {
        eachMinute: function() {
            $.get('/appStatus', {}, function(data) {
                $('#appStatus').text(
                    [`ISED API Store Middleware - status ${data.state}`,
                        `online: ${data.runningTime} mins`,
                        `next refresh: ${data.nextTenantRefresh} mins`
                    ].join(' - ')
                )
            })
        }
    }
})()

module.exports = {
    timer
}
},{}],9:[function(require,module,exports){
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
/******************************************************************************/

const ui = (function() {
    return {
        scrollToSection: function(sectionID) {
            let hash = $('#' + sectionID)
            $('html, body').animate({
                scrollTop: hash.offset().top
            }, 800, _ => window.location.hash = hash)
        },
        showVisibleAPITable: function(tenant, event) {
            $('.tenantsVisibleAPI').hide()
            let apiPaneID = tenant + 'VisibleAPI'
            $('#' + apiPaneID).show()

        }
    }
})()

module.exports = {
    ui
}
},{}],10:[function(require,module,exports){
/*************************************************************************
 * Client side, trigger user actions
 * 
 *************************************************************************/

"use strict"

const userActions = (function() {

    let actions = [{
        action: 'enforceOTP',
        route: 'enforceOTP'
    }]
    return {
        update: function(userEmailList, actionList) {
            //giving a liste of user addresses
            //enact actions of those users
            let actions = ['enforceOTP']
            let inputData = {
                users: userEmailList
            }
            $.post('/enforceOTP', inputData, function(data) {

            })
        }
    }
})()

module.exports = {
    userActions
}
},{}]},{},[4]);
