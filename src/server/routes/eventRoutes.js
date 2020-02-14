/*******************************************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * -------------------------------------
 *  routingSystem.js
 *
 *  Sets up the api plumbing for the app
 ******************************************************************************/

"use strict"

/*****************************************************************************/
/*****************************************************************************/

const eventsRoutes = (function(){
    return {

        getEvents : function(req, res, next){     //returns event descriptions
         /*   let events = clock.events.map(ev => {
                return {
                    name: ev.name, 
                    frequency: ev.frequency, 
                    last :ev.last, 
                    next: ev.next
                }
            })*/
            res.send({event: "das"})
        }
    }
})()

module.exports = {
    eventsRoutes
}