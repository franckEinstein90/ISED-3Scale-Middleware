/*******************************************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * -------------------------------------
 *  app.js
 *
 *  Server setup
 *******************************************************************************/

const tenantsManager = require('@services/tenantsManager').tenantsManager
const queryManager = require('@routes/queryManager').queryManager
const appTimer = require('@src/cron/timer').cacheManage

const accessLog = require('@server/logs').logs.accessLog
const messages = require('@server/messages').messages
const appStatus = require('@server/appStatus').appStatus

const users = require('@users/users').users
let groups = require('@users/groups').groups

const appRoot = (function(){

    let router = null

    return{
        render: function(req, res, next){
            let pageData = {
                title: "APICan", 
                state: 'initializing' , 
                tenants: messages.tenantInfo(), 
                definedUserGroups: groups.definedGroups()
            }
        
            if(appStatus.isRunning()){
                pageData.state = 'running'
            }
            res.render('index', pageData)
        }
    }
    
})()

module.exports = {
    appRoot
}