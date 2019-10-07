require('module-alias/register')

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const config = require('config');


const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const utils = require('@src/utils.js').utils
const tenantsManager = require('@services/userInfo.js').tenantsManager

let loadDataFromFile = async function(){
    //read master info file, use it to create the tenants register
   // let JSONData = await utils.readServerDataFile()
   let JSONData = config.get('master')
   tenantsManager.onReady(JSONData)
}

loadDataFromFile()
const app = express()

async function startServer(){

// view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');

  app.use(logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
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
