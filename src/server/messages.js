/***********************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * -------------------------------------
 *  Module messages / server side
 *
 *  - passes messages between client and server 
 **********************************************************/

"use strict"

const tenantsManager = require('@services/tenantsManager').tenantsManager

const messages = (function(){
    let _io = null

    

    return{
	   tenantInfo: function(){
           //information on tenants passed to the front end
           return tenantsManager.tenants().map( t => {
                return {
                    name: t.name, 
                    lastUpdate: t.lastUpdate, 
                    services: t.services.listServices() 
                }
        	})
    	},

      init: function(io){
            _io = io
            _io.on('connection', function(socket){
                console.log('user connected')
            })
        }, 

        emitRefreshFront: function(){
            _io.emit('refresh page', messages.tenantInfo()) 
        }
    }
})()

module.exports = {
    messages
}
