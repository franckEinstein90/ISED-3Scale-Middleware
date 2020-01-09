/*******************************************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * -------------------------------------
 *  routingSystem.js
 *
 *  sets up the routing plumbing for the app
 ******************************************************************************/
"use strict"
const express = require('express')
const cors = require('cors')

const indexRouting = require('@routes/index').indexRouting
const tenantRoutes = require('@routes/tenants').tenantRoutes
const apiStoreUserRoutes = require('@routes/apiStoreUsers').apiStoreUserRoutes

const appStatus = require('@server/appStatus').appStatus


const routingSystem = (function() {

    let router = express.Router()
    let corsOptions = {
        origin: 'https://dev.api.canada.ca'
    }

    return {
        configure: function({
            app
        }) {

            app.use('/', router)
            indexRouting.configure(router)

            router.get('/appStatus', appStatus.output)
            router.get('/getTenantNames', tenantRoutes.getTenantNames)
            router.get('/getTenantAccounts', tenantRoutes.getTenantAccounts)
            router.get('/findUsers', apiStoreUserRoutes.findUsers) 
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
            });
        }
    }

})()

module.exports = {
    routingSystem
}