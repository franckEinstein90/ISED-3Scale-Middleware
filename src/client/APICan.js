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
const storeNewsArticles = require('./store/storeNewsArticles').storeNewsArticles
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

        storeNewsArticles.onReady()

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
