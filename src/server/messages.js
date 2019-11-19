/***************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 ***************************************/

"use strict"
const tenantsManager = require('@services/tenantsManager').tenantsManager
const messages = (function(){
    let _io = null
    return{
        init: function(io){
            _io = io
            _io.on('connection', function(socket){
                console.log('user connected')
            })
        }, 
        emitRefreshFront: function(){
            _io.emit('refresh page', tenantsManager.tenants().map(t => {
                return {name: t.name}
            }))
        }
    }
})()

module.exports = {
    messages
}