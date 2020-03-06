/*******************************************************************************
 * Franck Binard, ISED (FranckEinstein90)
 *
 * APICan application - Feb 2020
 * -------------------------------------
 *  Canadian Gov. API Store middleware - client side
 *
 *  ui.js: entry point 
 *
 ******************************************************************************/
"use strict"
/******************************************************************************/
/******************************************************************************/


let _initStaticUI = function(){

  
    $('#appStatus').click(function( event ) {
        this.classList.toggle("active")
        let statusDetailPaneHeight = $('#appStatusDetail').css('maxHeight')	
        if( statusDetailPaneHeight === '0px' ){
            let scrollHeight = $('#appStatusDetail').css('scrollHeight')
            $('#appStatusDetail').css('maxHeight', '80px')
        } else {
            $('#appStatusDetail').css('maxHeight', '0px')
        }
    }) 
}

const uiFeature = function( app ){
    app.ui = {}
    return {

        addUiTrigger: function({ triggerID, action}){
		    $(`#${triggerID}`).click( action )
        }

    }
}
const ui = function(app) {
    let ui = uiFeature(app)
    app.addComponent({label: 'ui', component: {}})
    app.ui.addFeature({label: 'addUiTrigger', method: ui.addUiTrigger})
    _initStaticUI()
    app.showVisibleAPITable = function(tenant, event) {
       $('.tenantsVisibleAPI').hide()
       let apiPaneID = tenant + 'VisibleAPI'
       $('#' + apiPaneID).show()

    }

    require('./ui/modal').addModalFeature( app )
    require('./ui/dataTables').addDataTableFeature( app )

    return app
    

    /*scrollToSection: function(sectionID) {
            let hash = $('#' + sectionID)
            $('html, body').animate({
                scrollTop: hash.offset().top
            }, 800, _ => window.location.hash = hash)
        },*/


}

module.exports = {
    ui
}
