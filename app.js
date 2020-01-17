#!/usr/bin/env node

/*******************************************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * Application APICan
 * -------------------------------------
 *  app.js : entry point
 *
 *  Server setup
 ******************************************************************************/
"use strict"
require('module-alias/register')

const features = {
   testGetUser: 1
} 
 
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

const Keycloak = require('keycloak-connect')
const express = require('express')
const session = require('express-session')

const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')




const appStatus = require('@server/appStatus').appStatus


appLogger.log('info', 'Initializing application')
const tenantsManager = require('@services/tenantsManager').tenantsManager

let correctFetchErrors =  (tenantsUpdateReport) => {
  let tenantUpdateErrors = [] //ist of tenants for which there was an error during the update
	tenantsUpdateReport.forEach ( tenantReport => {
		if ( tenantReport.updateOk() ){
      return errors.codes.Ok
		} else{
      console.log(`There was an error updating ${tenantReport.tenantName}, recovering`)
      tenantUpdateErrors.push(tenantReport.tenantName)
    }
  })
  if (tenantUpdateErrors.length > 0){
      return tenantsManager.updateTenantInformation( tenantUpdateErrors )
      .then( correctFetchErrors )
  }
}



const scheduler = require('@src/cron/timer.js').scheduler
const appEvents = require('@server/appEvents').appEvents

let setTimerRefresh = function(){
  let id =  appEvents.configureTenantRefresh( 50 )
  let optEnforceID = appEvents.configureOTPEnforce( 20 )
  appStatus.configure ({tenantRefreshEventID: id})
  scheduler.start( )
  appStatus.run() //the app is ready to answer requests
  messages.emitRefreshFront()
  return 1
}

   
const db = require('@server/db').appDatabase
const APICan = require('@src/APICan').APICan
const users = require('@users/users').users
const groups = require('@users/groups').groups

db.configure({filePath: './settings.db'})
.then( APICan.configure )
.then( users.onReady )
.then( groups.onReady )

.then(x => {
	if(x) appStatus.enableKeyCloak()
	})
.then( tenantsManager.configure )
.then( tenantsManager.updateTenantInformation )
.then( correctFetchErrors )
.then( setTimerRefresh )

const app = express()
const favicon = require('express-favicon')
const viewSystem = require('@server/views/viewSystem.js').viewSystem
const memoryStore = new session.MemoryStore()
//const keycloak = new Keycloak({store: memoryStore })

let configureExpress = async function() {

  viewSystem.configure({app, root: __dirname})
	app.use(session({
		 secret: 'fdafdsajfndas', 
		 resave: false, 
		 saveUninitialized: true, 
		 store: memoryStore
	 }))
	//app.use(keycloak.middleware())
    app.use(logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded({
        extended: false
    }));
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, 'public')))
    app.use(favicon(__dirname + '/public/LOGO139x139.png'))
}

const routingSystem = require('@server/routingSystem').routingSystem
configureExpress()
routingSystem.configure({app})
const server = require('@server/httpServer').httpServer(app)


const debug = require('debug')('ised-3scale-middleware:server');


console.log(`App running on port ${server.port}`)

server.on('error', onError);
server.on('listening', onListening);


const io = require('socket.io')(server.server())
const messages = require('@server/messages').messages
messages.init(io)

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

module.exports = {
    app, 
    server
}
