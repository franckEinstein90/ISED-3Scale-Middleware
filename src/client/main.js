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
/******************************************************************************/


$(function() {
    
    let apiCanClient = {
        tenants     : null, 
        adminTools  : null,
        handleError : null, 
        server      : {

        }, 
        ui                  : null
      
    }
    apiCanClient.socket = io()
    require('../clientServerCommon/features').addFeatureSystem( apiCanClient )
    require('../clientServerCommon/viewModel').addComponent( apiCanClient )
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

        app.addComponent({label: 'timer'})	
        require('./timer/main').configureTimerFeature( app )

        require('./storeServices').addServiceInspectFeature( app  )
        require('./groups/userGroups').addUserGroupFeature( app   )
        require('./tests/jiraRequest').addFeature( app            )
//        require('./configs/keycloak').addFeature( app             )
    })    
  

})
