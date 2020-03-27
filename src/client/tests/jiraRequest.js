"use strict"


const jiraRequestTestForm = app => {

    app.ui.modal({
        title: 'fdsa', 
        content: 'das'
    })

}

const addFeature = function( app ){

    app.ui.addUiTrigger({ 
        triggerID   : "jiraRequestTest", 
        action      : _ => jiraRequestTestForm(app)
    })

}

module.exports = {
    addFeature
}
