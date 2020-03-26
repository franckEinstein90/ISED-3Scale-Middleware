"use strict"


const checkJiraSupport = function( app ){
    return new Promise((resolve, reject)=>{
        app.supportRequests.createSupportRequest({
            summary: 'apiCan startup health check', 
            description: 'apiCan Health Check', 
            user: 'apiCan application',
            email: app.data.apiStoreUserName
        })
        .then( testAnswer =>{
            let answer = JSON.parse(testAnswer)
            if('id' in answer && 'key' in answer){
                app.say('health check: able to create Jira support tasks')
                return resolve(true)
            }
            else {
                app.say('unable to create Jira Requests')
                return resolve(false)
            }
        })
        .catch( err => {
            app.say('unable to create Jira Requests')
            resolve(false)
        })
    })
}

module.exports = {
    checkJiraSupport
}