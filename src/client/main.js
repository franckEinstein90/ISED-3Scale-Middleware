"use strict"

$(function(){
    const socket = io()

    socket.on('refresh page', function(tenants){
   	tenants.forEach(t => 		
		$('#tenantCards').append(`<p>${t.name}</p>`))
    })
 

})


