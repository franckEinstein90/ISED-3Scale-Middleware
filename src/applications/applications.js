/***********************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * 2019-2020
 * -------------------------------------
 *
 *  Module tenantsApiRequests.js
 *
 *  contains functions that call 3Scale API to fetch
 *  tenant related information
 *****************************************************************/
"use strict"

/*****************************************************************/

const applications = (function(){
    return{
        Application : class{
            constructor(applicationInfo){
                Object.assign(this, applicationInfo.application)
            }
        }
    }
})()

module.exports = {
    applications
}