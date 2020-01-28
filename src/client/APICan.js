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

        $('#visibleAPISelect').on('change', function() {
            ui.showVisibleAPITable(this.value)
        })  
        $('#selectedUsersList tbody').on('click', 'tr', function(){
            $(this).toggleClass('selected')
            let selectedUserEmail = storeUsers.selectUserFromSelectedTableRow(this) 
            selectedUsers.toggleSelectedUser(selectedUserEmail)
        })
    }

    return {
        init: function() {
            socket = io()
            socket.on('updateBottomStatusInfo', function(data){
                $('#bottomStatusBar').text(data.message)
            })
        
            tenants.onReady(setUI)
            storeUsers.onReady({
                userDisplayList: $('#selectedUsersList')
            })
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
