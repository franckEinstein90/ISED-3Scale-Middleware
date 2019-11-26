/******************************************************************************
 * HEADER goes here
 *
 * ****************************************************************************/
"use strict";

const errors = require('@src/errors').errors

//initiate winston logger
const winston = require('winston')
const appLogger = winston.createLogger({
    format: winston.format.json(),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({
            filename: 'info.log'
        })
    ]
});

const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const config = require('config')



const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const utils = require('@src/utils.js').utils
const tenantsManager = require('@services/tenantsManager').tenantsManager

const cronJob = require('node-cron')
const timer = require('@src/cron/timer.js').cacheManage

const messages = require('@server/messages').messages
const statusCodes = require('@server/appStatus').statusCodes
const appStatus = require('@server/appStatus').appStatus


let initISEDMiddleWare = async function() {
    let JSONData, setTimerRefresh

    appLogger.log('info', 'Initializing application')
    JSONData = config.get('master')


	 //function to detect and correct api errors
    let correctFetchErrors =  (tenantsUpdateReport) => {
        let tenantUpdateErrors = [] //ist of tenants for which there was an error during the update
		tenantsUpdateReport.forEach (

			tenantReport => {
				if ( tenantReport.updateOk() ){
                    return errors.codes.Ok
				}
				else{
                    console.log(`There was an error updating ${tenantReport.tenantName}, recovering`)
                    tenantUpdateErrors.push(tenantReport.tenantName)
                }
            })
            if (tenantUpdateErrors.length > 0){
                return tenantsManager.updateTenantInformation(tenantUpdateErrors)
                .then(correctFetchErrors)
            }
	 }

    setTimerRefresh = function(){
        appStatus.run() //the app is ready to answer requests
        messages.emitRefreshFront()

        console.log('*******************************************')
        console.log('App is running and ready to receive requests')
        console.log('*******************************************')

        timer.setRefreshTime(1) //refresh information every 5 minutes
        cronJob.schedule('* * * * *', timer.cronUpdate)
        return 1
    }

    tenantsManager.onReady(JSONData)
    //initial data fetching on loading
    tenantsManager.updateTenantInformation()
        .then(correctFetchErrors)
        .then(setTimerRefresh)
    //set up info fetch cycle
}

initISEDMiddleWare()
const app = express()


let initViews = async function(){
   // view engine setup
   app.set('views', path.join(__dirname, 'views'));
   app.set('view engine', 'hbs');
}

let startServer = async function() {
	 initViews()
    app.use(logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded({
        extended: false
    }));
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, 'public')));


    app.use('/', indexRouter);
    app.use('/users', usersRouter);

    // catch 404 and forward to error handler
    app.use(function(req, res, next) {
        next(createError(404));
    });


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

startServer()
module.exports = app;
