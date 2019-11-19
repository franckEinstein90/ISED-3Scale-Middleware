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

let initISEDMiddleWare = async function() {
    let JSONData, checkFetchResults, setTimerRefresh

    appLogger.log('info', 'Initializing application')
    JSONData = config.get('master')

    checkFetchResults = function(fetchResults) {
        if(fetchResults === errors.codes.Ok){ //errors getting tenant information
            console.log('finished updating tenant')
            return 1
        }
        else{
            console.log('There were errors updating some of the tenants')
            return 0
        }
    }
    setTimerRefresh = function(){
        messages.emitRefreshFront()
        console.log('ready to receive requests')
        console.log('setting timer refresh')
        timer.setRefreshTime(1) //refresh information every 5 minutes
        cronJob.schedule('* * * * *', timer.cronUpdate)
        return 1
    }
    tenantsManager.onReady(JSONData)
    //initial data fetching on loading
    tenantsManager.updateTenantInformation()
        .then(checkFetchResults)
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
