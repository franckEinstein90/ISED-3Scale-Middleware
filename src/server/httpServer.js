/*******************************************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * Application APICan
 * -------------------------------------
 *  httpServer.js 
 *
 *  Server setup
 ******************************************************************************/
"use strict"

const http = require('http')

function normalizePort( val ) {
  let port = parseInt( val, 10 )
  if (isNaN(port))  return val
  if (port >= 0) return port
  return false
}

const httpServer = function( app ){
	let _port = normalizePort(process.env.PORT || '3000')
	app.set('port', _port)
	let _server = http.createServer(app)
	_server.listen( _port )

	return{
		on: function(message, callback){
			_server.on(message, callback)
		},
		address: _ => _server.address(),
		port: _port, 
		server: _ => _server
	}
}


module.exports = {
	httpServer
}


