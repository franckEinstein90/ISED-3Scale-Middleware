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
    if(clientApp.implements('showModal')){
        clientApp.showScheduler = _ => clientApp.showModal({
			title : 'events', 
			content: eventScheduler.showScheduler()
	    })
        $('#showScheduler').click(event => {
            event.preventDefault()
            clientApp.showScheduler()
        })
        clientApp.addFeature({
            label: 'eventScheduler', 
            state: 'implemented'
         })
    }
}


module.exports = {
    addAdminTools
}
