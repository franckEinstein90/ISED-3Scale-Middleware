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
const userGroupsDialog = require('./dialogs/userGroupsDialog').userGroupsDialog
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
    }

    return {
        init: function() {
            socket = io()
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