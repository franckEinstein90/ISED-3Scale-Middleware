/***********************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * -------------------------------------
 *  main.js / client side
 *
 **********************************************************/

"use strict"
const keyCloakUsers = require('./showUsers').keyCloakUsers

$(function(){

    const socket = io()

    let appStatus = $('#appStatus').text()
	
    if (appStatus === 'running'){
	
    }

    socket.on('refresh page', function(tenants){
        location.reload(true)
    })
    
  
    $('#manageUsersBtn').click(function(event){
        $('#searchResults').empty()
        document.getElementById('id01').style.display='block'
    }) 


    $("#searchUser").click(function(event){
        event.preventDefault()
        $('#searchResults').empty()
        let parameters = {search: $('#userEmail').val()}
        $.get('/searchUser', parameters, keyCloakUsers.showUsers)
    })

  
})


