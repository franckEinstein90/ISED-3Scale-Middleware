/*******************************************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * 2019-2029
 * --------------------------------------------------------
 *  Module messages / server side
 *  passes messages between client and server 
 ******************************************************************************/
"use strict"

/******************************************************************************/
/******************************************************************************/

const messages = function( app ) {
    app.io.on('connection', function(socket) {
        console.log('user connected')
    }) 
    app.addComponent({label: 'clientMessages'}) 
    app.clientMessages.emitRefreshBottomStatus = function(message) {
        app.io.emit('updateBottomStatusInfo', {
            message
        })
    }  
    app.clientMessages.tenantInfo = function() {
        //information on tenants passed to the front end
        return app.tenants.list.map(t => {
            let totalServiceCount     = t.services.length()
            let bilingualServiceCount = t.services.length({
                bilingual : true
            })
            let services = t.services.listServices()
            return {
                name: t.name,
                id: t.id,
              //  lastUpdate  : tenantsManager.lastUpdate(t.name).format('H:m'), 
                totalServiceCount,  
                bilingualServiceCount,
                numVisibleServices: t.services.length({
                    visibleOnly: 1
                }),
                services
            }
        })
    }
}
/*
    let _io = null
    let _app = null

    return {

      

        init: function( app ) {
            _app = app
            _io = app.io
        
        },

        emitRefreshFront: function() {
            _io.emit('refresh page', messages.tenantInfo())
        },

       
    }
}
*/
const addClientMessages = function( app ){
    return messages(app)
}

module.exports = {
   addClientMessages
}