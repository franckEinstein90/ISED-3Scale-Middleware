/*******************************************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * -------------------------------------
 *  routingSystem.js
 *
 *  Sets up the routing for the app
 ******************************************************************************/

"use strict"

/*****************************************************************************/

const express = require('express')
const cors = require('cors')

const tenantRoutes = require('@routes/tenants').tenantRoutes
const appRoot = require('@server/routes/appRoot').appRoot

const apiStoreUserRoutes = require('@routes/apiStoreUsers').apiStoreUserRoutes
const userGroupRoutes = require('@server/routes/userGroupRoutes').userGroupRoutes

const appStatus = require('@server/appStatus').appStatus


const routingSystem = function({
    app
}) {

    let router = express.Router()
    let whiteList = ['https://dev.api.canada.ca', 'https://api.canada.ca']
    let corsOptions = {
        origin: function(origin, callback) {
            if (whiteList.indexOf(origin) !== 1) {
                callback(null, true)
            } else {
                callback(new Error('Not allowed by CORS'))
            }
        }
    }

    app.use('/', router)
    router.get('/', appRoot.render)
    router.get('/appStatus', appStatus.output)

    //tenant information
    router.get('/tenants', tenantRoutes.getTenants)
    router.get('/getTenantAccounts', tenantRoutes.getTenantAccounts)

    //get sets of users based on various criteria           
    router.get('/findUsers', userGroupRoutes.findUsers)
    router.get('/groupUsers', userGroupRoutes.getGroupUsers)


    router.post('/newUserGroup', apiStoreUserRoutes.postNewUserGroup)
    router.delete('/group', apiStoreUserRoutes.deleteUserGroup)
    router.get('/userinfo.json', apiStoreUserRoutes.getUserInfo)
    router.get('/api.json', apiStoreUserRoutes.getApi)
    router.post('/support', cors(corsOptions), apiStoreUserRoutes.postJiraRequest)
    router.post('/enforceOTP', apiStoreUserRoutes.postEnforceOTP)

    app.use(function(req, res, next) {
        next(createError(404));
    })

    // error handler
    app.use(function(err, req, res, next) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        res.render('error');
    })
}

module.exports = {
    routingSystem
}