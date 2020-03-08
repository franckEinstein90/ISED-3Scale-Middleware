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
/*    let socket = null
    socket = io()*/

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

        app.addComponent({label: 'userGroupManagement'})
        require('./ui').ui( app )
        require('./errors/errors').addErrorHandling(  app )
        require('./data/data').addServerComFeature(  app )
        require('./adminTools').addAdminTools( app )
	
      /*  timer.configure( app )
        timer.eachMinute()
        setInterval(timer.eachMinute, 10000)*/

        //service inspect feature
        require('./storeServices').addServiceInspectFeature( app )
        require('./groups/userGroups').addUserGroupFeature( app )


    })    
  

})
