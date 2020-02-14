(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/*******************************************************************************
 * Franck Binard, ISED (FranckEinstein90)
 *
 * APICan application - 2020
 * -------------------------------------
 *  Canadian Gov. API Store middleware - client side
 *
 *  adminTools.js: manages admin tools 
 *
 ******************************************************************************/
"use strict"
/******************************************************************************/


const eventPane = ({
    name,
    frequency,
    last,
    next
}) => {
    return [
        `<tr>`,
        `<td>${name}</td>`,
        `<td>${frequency} mins</td>`,
        `<td>${last}</td>`,
        `<td>${next}</td>`,
        `</tr>`
    ].join(' ')
}


const getEvents = () => {
    return new Promise((resolve, reject) => {
        $.get('/events', function(data) {
            resolve(data)
        })
        .fail( err => {
           reject(err) 
        })
    })
}

const schedulerModalContent = () => {
    return new Promise((resolve, reject) => {
        getEvents()
            .then(events => {
                return resolve([
                    `<div class="eventList" id="eventList">`,
                    `<table class='w3-table scheduledEvent'>`,
                    `<tr><th>Event Name</th><th>Frequency</th><th>Last</th><th>Next</th></tr>`,
                    events.map(ev => eventPane(ev)).join(''),
                    `</table>`,
                    '</div>'
                ].join(''))
            })
            .catch( err => {
                reject (err)
            })
    })
}


const schedulerContent = function() {

    return schedulerModalContent()
        .then(modalContent => {
            return ({
                title: 'Scheduler',
                content: modalContent
            })
        })
        .catch(err => {
            throw err
        })
}


const addAdminTools = async function(clientApp) {

    clientApp.adminTools = {
        scheduler: null,
        features: {
            scheduler: false
        }
    }


    clientApp.showScheduler = _ => {
        clientApp.server.fetchData('events')
            .then( modalContent => {
                    return clientApp.ui.showModal(modalContent)
            })
            .catch( err => clientApp.handleError(
                    [   `<P>Unable to get scheduler data</P>`, 
                        `<P>Status ${err.status}, `, 
                        `${err.statusText}</P>`
                    ].join(''))
            )
    }

    $('#showScheduler').click(event => {
        event.preventDefault()
        clientApp.showScheduler()
    })

    clientApp.adminTools.features.scheduler = true
}


module.exports = {
    addAdminTools
}

},{}],2:[function(require,module,exports){
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
 /*****************************************************************************/

const getData = serverRoute => {
    return new Promise((resolve, reject) => {
        $.get(`/${serverRoute}`, function(data) {
            resolve(data)
        })
        .fail( err => {
           reject(err) 
        })
    })
}

const fetchServerData = function(clientApp){
    return serverRoute => getData( serverRoute )
}

const addServerComFeature =  clientApp =>{

    clientApp.server.fetchData = fetchServerData(clientApp)

}


module.exports = {
    addServerComFeature
}


},{}],3:[function(require,module,exports){
/*******************************************************************************
 * Franck Binard, ISED (FranckEinstein90)
 *
 * APICan application - 2020
 * -------------------------------------
 *  Canadian Gov. API Store middleware - client side
 *
 *  errors.js: error handling 
 *
 ******************************************************************************/
"use strict"
/******************************************************************************/


const showError =  clientApp => {
    return err => clientApp.ui.showModal({
        title: "ERROR", 
        content: err
    })
}

const addErrorHandling = function( clientApp ){

    clientApp.features.errorHandling = true
    clientApp.handleError = showError(clientApp)
    
    
}
module.exports = {
    addErrorHandling
}

},{}],4:[function(require,module,exports){
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
/*const APICan = require('./APICan').APICan
const storeUsers = require('./storeUsers').storeUsers
const userActions = require('./userActions').userActions
/******************************************************************************/


$(function() {

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

    require('./ui').ui(apiCanClient)
    require('./errors/errors').addErrorHandling(apiCanClient)
    require('./data/data').addServerComFeature(apiCanClient)
    require('./adminTools').addAdminTools(apiCanClient)


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

},{"./adminTools":1,"./data/data":2,"./errors/errors":3,"./ui":5}],5:[function(require,module,exports){
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
/******************************************************************************/

const ui = function(app) {

    app.ui = {
        modal: null
    }

    app.ui.features = {
        modal: false
    }

    require('./ui/modal').addModalFeature(app.ui)
    app.features.ui = true


    /*{

        scrollToSection: function(sectionID) {
            let hash = $('#' + sectionID)
            $('html, body').animate({
                scrollTop: hash.offset().top
            }, 800, _ => window.location.hash = hash)
        },
        showVisibleAPITable: function(tenant, event) {
            $('.tenantsVisibleAPI').hide()
            let apiPaneID = tenant + 'VisibleAPI'
            $('#' + apiPaneID).show()

        }
    }*/

}

module.exports = {
    ui
}
},{"./ui/modal":6}],6:[function(require,module,exports){
"use strict"


const showModal = ({

    title, 
    content

  }) =>{

    $('#modalTitle').text( title )
    $('#modalContent').html( content )
    document.getElementById('modalWindow').style.display = 'block'
}

const addModalFeature = function( ui ){

    ui.features.modal = true
    ui.showModal = showModal
}

module.exports = {
    addModalFeature
}

},{}]},{},[4]);
