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

    let formInputField = function({
            label, 
            inputField
        }){
             return [   
                    `<label class="groupCreationLabel"><b>${label}</b></label>`, 
                    inputField
                ].join('')
    }

    return {

        addUiTrigger: function({ triggerID, action}){
		    $(`#${triggerID}`).click( action )
        }, 

        createForm: function( formContent ){
             return [
                `<form class="w3-container w3-left-align">`, 
                  formContent, 
                `</form>`].join('')
        }, 

        textField : function({
            label, 
            htmlID, 
            value
        }){
            let textField = formInputField({ 
                label, 
                inputField: `<input class="w3-input w3-border" id="${htmlID}" value="${value || ''}" type="text">`
            })
            return textField
        }
    }
}

const ui = function(app) {

    app.addComponent({label: 'ui', methods: uiFeature(app)})

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
