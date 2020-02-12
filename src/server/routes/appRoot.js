/*******************************************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * -------------------------------------
 *  server/routes/appRoot.js
 *
 *  Serves site root
 *******************************************************************************/
"use strict"

/******************************************************************************/
const messages  = require('@server/messages').messages
/*
const appStatus = require('@server/appStatus').appStatus
const groups    = require('@users/groups').groups*/
/******************************************************************************/


const appRoot = (function() {

    let router = null

    return {
        render: function(req, res, next) {
            let pageData = {
                title: "APICan",
                state: 'initializing',
                tenants: messages.tenantInfo(),
               // definedUserGroups: groups.definedGroups()
            }

//            if (appStatus.isRunning()) {
 //               pageData.state = 'running'
  //          }
            res.render('index', pageData)
        }
    }

})()

module.exports = {
    appRoot
}