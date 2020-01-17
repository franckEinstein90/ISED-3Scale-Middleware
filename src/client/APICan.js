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

    let setUI = function(){

        $('#createNewGroup').click(function(event){
            event.preventDefault()
            if(tenants.ready()){
                let newUserGroup = new storeUsers.Group()
            }
        })

        $('.navGroupLink').click(function(event){
            debugger
        })

    }

    return {
        init: function() {
            socket = io()
            tenants.onReady()
            storeUsers.onReady($('#selectedUsersList').DataTable())
            setUI()
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