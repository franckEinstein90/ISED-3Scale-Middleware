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


const eventSchedule = (function(){
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

    clientApp.adminTools = {
        scheduler: eventSchedule,
        features: {
            scheduler: false
        }
    }


    clientApp.showScheduler = _ => clientApp.ui.showModal({
			title : 'events', 
			content: eventSchedule.showScheduler()
	})

    $('#showScheduler').click(event => {
        event.preventDefault()
        clientApp.showScheduler()
    })

    clientApp.adminTools.features.scheduler = true
}


module.exports = {
    addAdminTools
}
