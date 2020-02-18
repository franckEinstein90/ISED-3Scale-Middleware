/*******************************************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * -------------------------------------
 *  routingSystem.js
 *
 *  Sets up the api plumbing for the app
 ******************************************************************************/

"use strict"

/*****************************************************************************/
const express = require('express')
const cors = require('cors')
/*****************************************************************************/
const tenantRoutes          = require('@server/routes/tenantRoutes').tenantRoutes
const appRoot               = require('@server/routes/appRoot').appRoot
const apiStoreUserRoutes    = require('@server/routes/apiStoreUsers').apiStoreUserRoutes
const userGroupRoutes       = require('@server/routes/userGroupRoutes').userGroupRoutes
const eventsRoutes          = require('@server/routes/eventRoutes').eventsRoutes
const serviceInspectRoutes = require('@server/routes/serviceInspectRoutes').serviceInspectRoutes
/*****************************************************************************/
const appStatus = require('@server/routes/appStatus').appStatus
/*const scheduler = require('@src/cron/timer').scheduler
const logs = require('@server/logs').logs*/
/*****************************************************************************/

const routingSystem = function( apiCan ) {
    let _apiCan = apiCan
    let router = express.Router()
    let expressStack = apiCan.expressStack

    expressStack.use('/', router)
    router.get('/', appRoot.render)
    
    //tenant routes
    router.get('/tenants',           tenantRoutes.getTenants)
    router.get('/refreshTenants',    tenantRoutes.getRefreshTenants)
    router.get('/getTenantAccounts', tenantRoutes.getTenantAccounts)
 
    //events
    router.get('/events', _apiCan.clock.getEvents) 
    router.get('/serviceInspect', serviceInspectRoutes.getServiceInfo)
/*
    

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
*/

   
    router.get('/appStatus', appStatus.getStatus)

/*    router.get('/schedule', scheduler.getSchedule)
    router.get('/logs', logs.getLogs)
	    
    //get sets of users based on various criteria           
    router.get('/findUsers', userGroupRoutes.findUsers)*/
    router.get('/groupUsers', userGroupRoutes.getGroupUsers)
    router.get('/groups', userGroupRoutes.getGroupList)
    router.delete('/group', userGroupRoutes.deleteUserGroup)
    router.post('/newUserGroup', userGroupRoutes.postNewUserGroup)

/*
    router.get('/userinfo.json', apiStoreUserRoutes.getUserInfo)
  */router.get('/api.json', apiStoreUserRoutes.getApiInfo)/*
    router.post('/support', cors(corsOptions), apiStoreUserRoutes.postJiraRequest)
    router.post('/enforceOTP', apiStoreUserRoutes.postEnforceOTP)

	*/
    expressStack.use(function(req, res, next) {
        next(createError(404));
    })

    // error handler
    expressStack.use(function(err, req, res, next) {
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
