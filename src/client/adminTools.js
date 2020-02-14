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
