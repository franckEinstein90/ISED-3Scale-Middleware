const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const config = require('config');
const fs = require('fs'); 
const userInfo = require('./src/userInfo').userInfo


const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

 let filePath = path.join(__dirname, 'serverData.json') 
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

let readServerDataFile= function(){
    try{
      let filePath = path.relative("", './data/serverData.json')
      let rawData = fs.readFileSync(filePath, {encoding: 'utf-8'})
      return JSON.parse(rawData)
    } catch(err){
      	console.log(err)
      	throw(err)
	}
}

try{
    userInfo.onReady(readServerDataFile())
} catch(err){
    res.send("error")
}


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

module.exports = app;
