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
