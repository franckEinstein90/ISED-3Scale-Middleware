/*******************************************************************************
 * Franck Binard, ISED (FranckEinstein90)
 *
 * APICan application - 2020
 * -------------------------------------
 *  Canadian Gov. API Store middleware - client side
 *
 *  timer feature init.js: client app admin
 *
 ******************************************************************************/
"use strict"
/*****************************************************************************/

const timer = function( app ) {


    return {

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

				app.eventScheduler.update(appStatus.events)
            })
        }
    }
}


const configureTimerFeature = function( app ){
    
    let timerFeature = timer(app)
    app.timer.eachMinute = timerFeature.eachMinute
    app.timer.eachMinute( )
    setInterval( app.timer.eachMinute, 10000)
    return app
}

module.exports = {
    configureTimerFeature
}
