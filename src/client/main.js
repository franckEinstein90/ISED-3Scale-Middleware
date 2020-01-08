/***********************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * -------------------------------------
 *  main.js / client side
 *
 **********************************************************/

"use strict"
const tenantsInfo = require('./showUsers').tenantsInfo
const users = require('./showUsers').users
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



const userActions = require('./userActions').userActions
const selectedUsers = (function(){

    let userStore = new Map()

    let toEmailList = function(){
        let userList = []
        userStore.forEach((_, userEmail) => userList.push( userEmail ))
        return userList
    }

    let displayCurrentUserSelection = function(){
        $('#individuallySelectedUsers').text(toEmailList().join(';'))
    }
 
    return{

        toggleSelectedUser: function(userEmail){
            if(userStore.has(userEmail)){
                userStore.delete(userEmail)
            }
            else{
                userStore.set(userEmail, 1)
            }
            displayCurrentUserSelection()
       }, 

       applySelectedActions: function(){
           
           userActions.update( toEmailList() )
       }

   }
})()





$(function(){

    const socket = io()
    tenantsInfo.onReady()

    users.onReady($('#selectedUsersList').DataTable())
     
    //status msg in top nav
    timer.eachMinute()
    setInterval(timer.eachMinute, 10000)

    
    let appStatus = $('#appStatus').text()
	
    if (appStatus === 'running'){
	
    }

    $('#createNewGroup').click(function(event){
        event.preventDefault()
        if(tenantsInfo.ready()){
            let newUserGroup = new users.Group()
        }
    })

    socket.on('updateBottomStatusInfo', function(data){
        $('#bottomStatusBar').text(data.message)
    })

    socket.on('refresh page', function(tenants){

    })
    
  
    $('#manageUsersBtn').click(function(event){
        $('#searchResults').empty()
        document.getElementById('id01').style.display='block'
    }) 

    $('#selectedUsersList tbody').on('click', 'tr', function(){
		$(this).toggleClass('selected')
		let selectedUserEmail = users.selectUserFromSelectedTableRow(this) 
		selectedUsers.toggleSelectedUser(selectedUserEmail)
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

  
})


