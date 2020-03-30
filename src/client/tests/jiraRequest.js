"use strict"


const jiraRequestTestForm = app => {

    app.ui.modal({
        title: 'Jira Support Requests Setup', 
        content: app.ui.form('<P>fd</P>') 
    })

}

const addFeature = function( app ){

    app.ui.addUiTrigger({ 
        triggerID   : ["jiraRequestTest", "jiraRequestTopNavCmd"], 
        action      : _ => jiraRequestTestForm(app)
    })
}

module.exports = {
    addFeature
}
