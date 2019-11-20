/***********************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * -------------------------------------
 *  main.js / client side
 *
 **********************************************************/

"use strict"

$(function(){

    const socket = io()

    let appStatus = $('#appStatus').text()
	
    if (appStatus === 'running'){
	
    }

    socket.on('refresh page', function(tenants){
        location.reload(true)
    })
})


