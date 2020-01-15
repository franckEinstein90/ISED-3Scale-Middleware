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