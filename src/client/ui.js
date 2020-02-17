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
let _initUI = function(){
    $('#btnRefreshTenants').click(function ( event ){
        event.preventDefault()
        $.get('/refreshTenants', {}, function(data) {
            debugger	
        })
    })
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
const ui = function(app) {
    _initUI()
    app.showVisibleAPITable = function(tenant, event) {
       $('.tenantsVisibleAPI').hide()
       let apiPaneID = tenant + 'VisibleAPI'
       $('#' + apiPaneID).show()

    }

    app.ui = {
        modal: null
    }

    app.ui.features = {
        modal: false
    }

    require('./ui/modal').addModalFeature(app.ui)
    app.features.ui = true


    

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