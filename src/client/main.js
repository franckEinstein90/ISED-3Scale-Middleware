/***********************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * -------------------------------------
 *  main.js / client side
 *
 **********************************************************/

"use strict"
const keyCloakUsers = require('./showUsers').keyCloakUsers
const timer = (function(){
    return {
        eachMinute: function(){
            $.get('/appStatus', {}, function(data){
                $('#appStatus').text(
                    [`ISED API Store Middleware - status ${data.state}`, 
                     `online: ${data.runningTime} mins`, 
                     `next refresh: ${data.nextTenantRefresh} mins`].join(' - ')
                )
            })
        }
    }
})()
$(function(){

    const socket = io()

    //status msg in top nav
    timer.eachMinute()
    setInterval(timer.eachMinute, 10000)

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


