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
        tenants     : null, 
        adminTools  : null,
        handleError : null, 
        server      : {

        }, 
        ui                  : null
      
    }

    require('../clientServerCommon/features').addFeatureSystem( apiCanClient )

    require('./tenants/tenants').addTenantCollection({
        clientApp: apiCanClient, 
        containerID: 'tenantCards'
    })

    .then( app => {
        require('./ui').ui( app )
        require('./errors/errors').addErrorHandling( apiCanClient)
        require('./data/data').addServerComFeature( apiCanClient)
        require('./adminTools').addAdminTools( apiCanClient)
	
        timer.configure( apiCanClient )
        timer.eachMinute()
        setInterval(timer.eachMinute, 10000)

        //service inspect feature
        require('./storeServices').addServiceInspectFeature( apiCanClient )
        require('./groups/userGroups').addUserGroupFeature( apiCanClient )


    })    
  

})
