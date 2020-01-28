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

const ui = (function(){
    return {
        scrollToSection: function( sectionID ){
            let hash = $('#' + sectionID)
            $('html, body').animate({
                scrollTop: hash.offset().top
            }, 800, _ => window.location.hash = hash)
        }, 
        showVisibleAPITable: function(tenant, event){
            $('.tenantsVisibleAPI').hide()
            let apiPaneID = tenant + 'VisibleAPI'
            $('#' + apiPaneID).show()

        }
    }
})()

module.exports = {
    ui
}