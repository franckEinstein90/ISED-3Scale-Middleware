(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict"

const featureSystem = (function(){

    let _features = new Map()

    return {
      
        includes: featureName => {
            if(_features.has(featureName)) return _features.get(featureName)
            return false
        }, 
        list : x => _features , 
        add : function({ featureName, onOff }){
            if(featureSystem.includes(featureName)){
                throw "feature already exists"
            }
            _features.set(featureName, onOff)
        }
    }

})()

const addFeatureSystem = function( app ){
    app.features = featureSystem
    app.features.include = (features, status) => {
        Object.keys(features).forEach( key => {
            featureSystem.add({
                featureName: key, 
                onOff: status 
            })
        })
    }
}

module.exports = {
    addFeatureSystem
}
},{}],2:[function(require,module,exports){
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


const eventScheduler = (function(){
	let _events = new Map()

	return {

		update : function(eventArray) {
			eventArray.forEach(ev => {
					_events.set(ev.id, ev)
			})
		}, 

		showScheduler : function( ){
			 let eventRows = ""
			 _events.forEach((ev, _) =>{
				eventRows = eventRows += eventPane(ev) 
			 })
	         return [
					 `<div class="eventList" id="eventList">`,
                     `<table class='w3-table scheduledEvent'>`,
                     `<tr><th>Event Name</th><th>Frequency</th><th>Last</th><th>Next</th></tr>`,
					  eventRows, 
                     `</table>`,
                     '</div>'
			 		].join('')
		}
	}

})()



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
    clientApp.eventScheduler = eventScheduler
    if(clientApp.features.includes('modal')){
        clientApp.showScheduler = _ => clientApp.ui.showModal({
			title : 'events', 
			content: eventScheduler.showScheduler()
	    })
        $('#showScheduler').click(event => {
            event.preventDefault()
            clientApp.showScheduler()
        })
        clientApp.features.add({featureName: eventScheduler, onOff: true})
    }
}


module.exports = {
    addAdminTools
}

},{}],3:[function(require,module,exports){
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


},{}],4:[function(require,module,exports){
/*******************************************************************************
 * Franck Binard, ISED (FranckEinstein90)
 *
 * APICan application - 2020
 * -------------------------------------
 *  Canadian Gov. API Store middleware - client side
 *
 *  appStatusDialog.js: information and actions on app variables
 *
 ******************************************************************************/
"use strict"
/******************************************************************************/
const appStatusDialog = (function(){

	let _initUI = function(){
		$('#btnRefreshTenants').click(function ( event ){
			event.preventDefault()
			$.get('/refreshTenants', {}, function(data) {
				debugger	
			})
		})
		$('#appStatus').click(function( event ) {
			this.classList.toggle("active")
			let statusDetailPaneHeight = $('#appStatusDetail').css('maxHeight')	
			if( statusDetailPaneHeight === '0px' ){
				let scrollHeight = $('#appStatusDetail').css('scrollHeight')
				$('#appStatusDetail').css('maxHeight', '80px')
			} else {
				$('#appStatusDetail').css('maxHeight', '0px')
			}
		})
	}
	return {
        ready: function(){
				_initUI()
		  }, 
		  update: function(){

		  }
    }
})()

module.exports = {
    appStatusDialog
}

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
"use strict"


const userGroupFeature = (function(){

    let _dataTableHandle = null
    let _groups          = new Map() 

    return {

        configure   : function(){
            _dataTableHandle = $('#userFormGroupList').DataTable()
        }, 

        addGroup : function({groupName, groupID}){
            _groups.set(groupID, groupName)
        },

        displayGroups: _ => {
            $('#userFormGroupList tbody').empty()
            _groups.forEach(groupName =>{
                userGroupFeature.userGroupRow( groupName )
            })
        },  

        userGroupRow : function(groupName, groupID) { //displays the group
            $('#userFormGroupList tbody').append(         //as a line in #userFormGroupList
                [`<tr>`,
                    `<td class="w3-text-green">${groupName}</td>`,
                    `<td><i class="fa fa-eye w3-large w3-text-black groupCmd"></i></td>`, 
                    `<td><i class="fa fa-gears  w3-large w3-text-black groupCmd"></i></td>`, 
                    `<td><i class="fa fa-trash w3-large w3-text-black groupCmd"></i></td>`, 
                    `</tr>`
                ].join(''))
        }
    }
})()

const addUserGroupFeature = async function( clientApp ){
    return new Promise((resolve, reject) => {
        userGroupFeature.configure()  
        clientApp.server.fetchData('Groups')
        .then( result => {
            result.forEach(group => userGroupFeature.addGroup({
                groupName: group.name, 
                groupID: group.ID
            }))
            return 1
        })
        .then( _ => userGroupFeature.displayGroups())
        .then( _ => {
                clientApp.features.add({
                    featureName: 'userGroups', 
                    onOff   : true
                })
                return resolve(clientApp)
        })
    })
}

module.exports = {
    addUserGroupFeature
}
},{}],7:[function(require,module,exports){
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
        ui                  : null
      
    }

    require('../clientServerCommon/features').addFeatureSystem( apiCanClient )
    apiCanClient.features.include({
            ui              : false,
            adminTools      : false, 
            errorHandling   : false
    })

    require('./ui').ui(apiCanClient)
    require('./errors/errors').addErrorHandling(apiCanClient)
    require('./data/data').addServerComFeature(apiCanClient)
    require('./adminTools').addAdminTools(apiCanClient)
	
    timer.configure( apiCanClient )
    timer.eachMinute()
    setInterval(timer.eachMinute, 10000)
    let storeServices = require('./storeServices').storeServices
    storeServices.configure( apiCanClient )
  
    require('./groups/userGroups').addUserGroupFeature( apiCanClient )
    .then( apiCanClient => {
        debugger
    })
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

},{"../clientServerCommon/features":1,"./adminTools":2,"./data/data":3,"./errors/errors":5,"./groups/userGroups":6,"./storeServices":8,"./timer.js":9,"./ui":10}],8:[function(require,module,exports){
/*******************************************************************************
 * Franck Binard, ISED (FranckEinstein90)
 *
 * APICan application - 2020
 * -------------------------------------
 *  Canadian Gov. API Store middleware - client side
 *
 *  storeService.js: client api services module 
 *
 ******************************************************************************/

"use strict"

/******************************************************************************/
/******************************************************************************/

let drawGraph = function(stats) {
    let ctx = document.getElementById('statsGraph').getContext('2d')
    let myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [
                'june', 'july', 'aug', 'sept', 'oct', 'nov', 'dec', 'jan', 'feb'
            ],
            datasets: [{
                label: 'hits per month',
                data: stats.values
            }],
            backgroundColor: stats.values.map(s => 'rgba(255, 0, 0, 0.7)'),
            borderColor: stats.values.map(s => 'rgba(0, 255, 0, 0.7)')

        },
        options: {}
    })
}
let openServiceInspectDialog = function({
    tenant,
    serviceID
}) {

    document.getElementById('serviceInspectModal').style.display = 'block'
    $('#serviceModalTenantName').text(tenant)
    $('#serviceModalID').text(serviceID)
    $.get('/serviceInspect', {
            tenant,
            service: serviceID
        }, function(apiInfo) {

            $('#apiInspectFormState').val(apiInfo.state)
            $('#apiInspectFormTenantName').val(apiInfo.tenantName)
            $('#apiInspectFormServiceID').val(apiInfo.serviceID)
            $('#apiInspectFormSystemName').val(apiInfo.systemName)
            $('#apiInspectFormLastUpdate').val(apiInfo.updatedAt)
            $('#apiInspectFormCreationDate').val(apiInfo.created_at)
            $('#englishDoc').val(apiInfo.documentation[0].docSet.body)
            $('#frenchDoc').val(apiInfo.documentation[1].docSet.body)
            let tags = []
            apiInfo.documentation.forEach(d => {
                if ('tags' in d.docSet) {
                    d.docSet.tags.forEach(t => tags.push(t))
                }
            })
            $('#apiTags').text(tags.join(','))
            if ('stats' in apiInfo) drawGraph(apiInfo.stats)
        })
        .fail(error => {
            debugger
        })
}

const storeServices = (function() {
    let _app = null

    let _setUI = function() {
        $('#visibleAPISelect').on('change', function() {
            _app.showVisibleAPITable( this.value )
        })

        $('.serviceInspect').click(event => {
            event.preventDefault()
            let parentTable = event.currentTarget.offsetParent
            let tenant = parentTable.id.replace('VisibleAPI', '')
            let serviceID = Number((event.currentTarget.cells[1]).innerText)
            openServiceInspectDialog({
                tenant,
                serviceID
            })
        })
    }

    return {
        configure   : function( app ){
            _app = app
            _setUI()
        }

    }

})()

module.exports = {
    storeServices
}
},{}],9:[function(require,module,exports){
/*******************************************************************************
 * Franck Binard, ISED (FranckEinstein90)
 *
 * APICan application - 2020
 * -------------------------------------
 *  Canadian Gov. API Store middleware - client side
 *
 *  APICan.js: client app admin
 *
 ******************************************************************************/
"use strict"
/*****************************************************************************/
const appStatusDialog = require('./dialogs/appStatusDialog').appStatusDialog
/*****************************************************************************/

const timer = (function() {

    let _app = null

    return {

		configure	: function( app ){
			_app = app
		},

        eachMinute: function() {
            /* update the app status to see if there's been any changes */
            $.get('/appStatus', {}, function(data) {

                $('#appStatus').text(
                    [`ISED API Store Middleware - status ${data.state}`,
                        `online: ${data.runningTime} mins`
                    ].join(' - ')
                )
                $('#nextTenantRefresh').text(
                    `(${data.nextTenantRefresh} mins) `
                )

				_app.eventScheduler.update(data.events)
            })
        }
    }
})()

module.exports = {
    timer
}

},{"./dialogs/appStatusDialog":4}],10:[function(require,module,exports){
/*******************************************************************************
 * Franck Binard, ISED (FranckEinstein90)
 *
 * APICan application - Feb 2020
 * -------------------------------------
 *  Canadian Gov. API Store middleware - client side
 *
 *  main.js: entry point 
 *
 ******************************************************************************/
"use strict"

/******************************************************************************/
/******************************************************************************/



let _initStaticUI = function(){

    $('#btnRefreshTenants').click(function ( event ){
        event.preventDefault()
        $.get('/refreshTenants', {}, function(data) {
            debugger	
        })
    })

    $('#appStatus').click(function( event ) {
        this.classList.toggle("active")
        let statusDetailPaneHeight = $('#appStatusDetail').css('maxHeight')	
        if( statusDetailPaneHeight === '0px' ){
            let scrollHeight = $('#appStatusDetail').css('scrollHeight')
            $('#appStatusDetail').css('maxHeight', '80px')
        } else {
            $('#appStatusDetail').css('maxHeight', '0px')
        }
    }) 
}


const ui = function(app) {
    app.ui = {

    }

    app.features.add({featureName: 'ui', onOff: true})
    _initStaticUI()
    app.showVisibleAPITable = function(tenant, event) {
       $('.tenantsVisibleAPI').hide()
       let apiPaneID = tenant + 'VisibleAPI'
       $('#' + apiPaneID).show()

    }

    require('./ui/modal').addModalFeature( app )


    

    /*scrollToSection: function(sectionID) {
            let hash = $('#' + sectionID)
            $('html, body').animate({
                scrollTop: hash.offset().top
            }, 800, _ => window.location.hash = hash)
        },*/


}

module.exports = {
    ui
}

},{"./ui/modal":11}],11:[function(require,module,exports){
"use strict"


const showModal = ({

    title, 
    content

  }) =>{

    $('#modalTitle').text( title )
    $('#modalContent').html( content )
    document.getElementById('modalWindow').style.display = 'block'
}

const addModalFeature = function( app ){
    if(app.features.includes('ui')){
        app.ui.showModal = showModal
        app.features.add({featureName: 'modal', onOff: true})
    }
}

module.exports = {
    addModalFeature
}

},{}]},{},[7]);
