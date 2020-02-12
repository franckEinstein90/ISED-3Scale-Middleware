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
const tenantsManager = require('@tenants/tenantsManager').tenantsManager
/******************************************************************************/

const messages = (function() {

    let _io = null

    return {

        tenantInfo: function() {
            //information on tenants passed to the front end
            return tenantsManager.tenants().map(t => {
                let totalServiceCount     = t.services.length()
                let bilingualServiceCount = t.services.length({
                    bilingual : true
                })

                return {
                    name: t.name,
                    id: t.id,
                    totalServiceCount,  
                    bilingualServiceCount,
                    numVisibleServices: t.services.length({
                        visibleOnly: 1
                    }),
                    services: t.services.listServices()
                }
            })
        },

        init: function(io) {
            _io = io
            _io.on('connection', function(socket) {
                console.log('user connected')
            })
        },

        emitRefreshFront: function() {
            _io.emit('refresh page', messages.tenantInfo())
        },

        emitRefreshBottomStatusBar: function(message) {
            _io.emit('updateBottomStatusInfo', {
                message
            })
        }
    }
})()

module.exports = {
    messages
}