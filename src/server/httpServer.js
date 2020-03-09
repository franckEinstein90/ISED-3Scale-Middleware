/*******************************************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware - 2020
 *
 * Application APICan
 * -------------------------------------
 *  httpServer.js 
 *
 *  set's up the http server, debug and logging
 ******************************************************************************/
"use strict"

/*****************************************************************************/

const http = require('http')
const debug = require('debug')('ised-3scale-middleware:server');



const onError = function(port, error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string' ?
        'Pipe ' + port :
        'Port ' + port;

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

const onListening = function(addr) {
    var bind = typeof addr === 'string' ?
        'pipe ' + addr :
        'port ' + addr.port;
    debug('Listening on ' + bind);
}

const httpServer = function( apiCan ){

    let expressStack 	= apiCan.expressStack
    let port 		    = apiCan.data.port
    expressStack.set( 'port', port ) 
    let _server = http.createServer( expressStack )
    
    apiCan.server = {}
    apiCan.server.start = function(){
        _server.listen( port ) 
        apiCan.io = require('socket.io')(_server)
        _server.on('error', x     => onError(port))
        _server.on('listening', x => onListening(_server.address()))
        apiCan.say (`App running on port ${port}`)
    }
    return apiCan 
}


module.exports = {
    httpServer
}
