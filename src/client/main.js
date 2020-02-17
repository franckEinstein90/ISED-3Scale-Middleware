/*******************************************************************************
 * Franck Binard, ISED (FranckEinstein90)
 *
 * APICan application - 2020
 * -------------------------------------
 *  Canadian Gov. API Store middleware - client side
 *
 *  main.js: entry point 
 *
 ******************************************************************************/
"use strict"

/******************************************************************************/
const timer = require('./timer.js').timer
/*const APICan = require('./APICan').APICan
const storeUsers = require('./storeUsers').storeUsers
const userActions = require('./userActions').userActions
/******************************************************************************/


$(function() {
    let socket = null
    socket = io()

    let apiCanClient = {

        adminTools          : null,
        handleError         : null, 
        server              : {

        }, 
        ui                  : null,

        features: {

            ui: false,
            adminTools: false, 
            errorHandling: false

        }
    }
    timer.configure( apiCanClient )
    require('./ui').ui(apiCanClient)
    require('./errors/errors').addErrorHandling(apiCanClient)
    require('./data/data').addServerComFeature(apiCanClient)
    require('./adminTools').addAdminTools(apiCanClient)
	
    timer.eachMinute()
    setInterval(timer.eachMinute, 10000)
    let storeServices = require('./storeServices').storeServices
    storeServices.configure( apiCanClient )
    /*    let setUp = function() {
            try {
                console.group("Init APICan Client")
                APICan.init()
                console.groupEnd()
                return true

            } catch (err) {
                errors(err)
                return false
            }
        }

        if (setUp()) {
            try {
                APICan.run()
            } catch (err) {
                errors(err)
            }
        }*/
})

/*
   

    let userGroupNames = $('#userGroupNames').text().split(',').map(name => name.trim())
    userGroupNames.splice(userGroupNames.length - 1, 1)
	    
    timer.eachMinute()
    setInterval(timer.eachMinute, 10000)

    
    let appStatus = $('#appStatus').text()
	
    if (appStatus === 'running'){
	
    }


  
    socket.on('refresh page', function(tenants){

    })
    
  
    $('#manageUsersBtn').click(function(event){
        $('#searchResults').empty()
        document.getElementById('id01').style.display='block'
    }) 

  
    $('#userActions').click(function(event){
        event.preventDefault()
        let emails = []
        let otpEnforceEmail = $('.enforceOTPCheck')
        otpEnforceEmail.each( function() {
            if ($(this).is(':checked')){
                emails.push($(this).val())
            }
        })

        $.get('/enforceOTP', {emails})
        console.log('e')
    })


	$('#userActionGo').on('click', function(){
		selectedUsers.applySelectedActions()
    })
    
    $("#searchUser").click(function(event){
        event.preventDefault()
        $('#searchResults').empty()
        let filter = {
            tenants: [], 
            provideraccounts: $('#providerAccountSearchSelect').is(":checked")
        }
        
        tenantsFilter.forEach((state, tName)=>{
            if($(`#${tName}SearchSelect`).is(":checked")){
                tenantsFilter.set(tName, 'on')
                filter.tenants.push(tName)
            }
            else{
                tenantsFilter.set(tName, 'off')
            }
        })
    
        let parameters = {
            search: $('#userEmail').val(), 
            filter
        }
        $.get('/findUsers', parameters, keyCloakUsers.showUsers)
    })
*/
