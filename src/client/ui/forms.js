"use strict"

const formFeature = function( app ){

    return {
      form : function( formContent ){
        return [
            `<form class="w3-container w3-left-align">`, 
             formContent, 
             `</form>`].join('')
        }
    }
}

const addFormFeature = function( app ){
    let forms = formFeature( app ) 
    app.ui.form = forms.form
}

module.exports = {
    addFormFeature
}
