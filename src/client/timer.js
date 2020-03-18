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
            $.get('/appStatus', {}, function( appStatus ) {

                $('#appStatus').text(
                    [`APICan ${appStatus.version} status ${appStatus.state}`,
                        `online: ${appStatus.runningTime} mins`
                    ].join(' - ')
                )
                $('#nextTenantRefresh').text(
                    `(${appStatus.nextTenantRefresh} mins) `
                )

				_app.eventScheduler.update(appStatus.events)
            })
        }
    }
})()

module.exports = {
    timer
}
