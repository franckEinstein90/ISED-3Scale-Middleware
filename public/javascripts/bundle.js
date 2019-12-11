(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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



},{"./showUsers":2}],2:[function(require,module,exports){
"use strict"

const keyCloakUsers = (function(){
    let userProfiles = []

    return {
        showUsers:function(userData){
            userProfiles = userData
            userData.forEach(userProfile => {
                let otpEnabled = userProfile.disableableCredentialTypes.includes('otp') || userProfile.requiredActions.includes('CONFIGURE_TOTP')
                let emailVerified = `<td>${userProfile.emailVerified}</td>`
                let otpVerified = `<td>${userProfile.disableableCredentialTypes.includes('otp')}</td>`
                let enableOTP = `<td><input class="w3-check" type="checkbox" ${otpEnabled?'disabled':''}></td>`
                $('#searchResults').append(`<tr><td>${userProfile.email}</td>${emailVerified}${otpVerified}${enableOTP}</tr>`)
            })
        }
    }
})()

module.exports = {
   keyCloakUsers 
}
},{}]},{},[1]);
