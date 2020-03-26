


const checkJiraSupport = function( app ){
    return new Promise((resolve, reject)=>{
        app.supportRequests.createSupportRequest({
            summary: 'test', 
            description: 'apiCan Health Check', 
            user: 'apiCan application',
            email: app.data.apiStoreUserName
        })
        .then( testAnswer =>{
            return resolve(app)
        })
    })
}

module.exports = {
    checkJiraSupport
}