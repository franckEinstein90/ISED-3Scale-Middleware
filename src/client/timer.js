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
const timer = (function() {
    return {
        eachMinute: function() {
            $.get('/appStatus', {}, function(data) {
                $('#appStatus').text(
                    [`ISED API Store Middleware - status ${data.state}`,
                        `online: ${data.runningTime} mins`,
                        `next refresh: ${data.nextTenantRefresh} mins`
                    ].join(' - ')
                )
            })
        }
    }
})()

module.exports = {
    timer
}