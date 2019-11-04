require('module-alias/register')


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

let initISEDMiddleWare = async function() {
    let JSONData, checkFetchResults
	JSONData = config.get('master')

	 checkFetchResults = function(fetchResults){
        console.log('finished fetching tenant information')
		console.log('ready to receive requests')
		return 1
	 }

     tenantsManager.onReady(JSONData)
     //initial data fetching on loading
     tenantsManager.updateTenantInformation()
     .then(checkFetchResults)
     //set up info fetch cycle
     timer.setRefreshTime(5) //refresh information every 5 minutes
     cronJob.schedule('* * * * *', timer.cronUpdate)
}

initISEDMiddleWare()
const app = express()

let startServer = async function() {

    // view engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'jade');

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
