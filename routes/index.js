/*******************************************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * -------------------------------------
 *  app.js
 *
 *  Server setup
 *******************************************************************************/

const tenantsManager = require('@services/tenantsManager').tenantsManager
const queryManager = require('./queryManager').queryManager
const appTimer = require('@src/cron/timer').cacheManage

const accessLog = require('@server/logs').logs.accessLog
const messages = require('@server/messages').messages
const appStatus = require('@server/appStatus').appStatus

const users = require('@storeUsers').users


const indexRouting = (function(){

    let router = null

    let configureIndexPageRender = function(){

        router.get('/', function(req, res, next) {
        	let pageData = {
                title: "GoC API Store middleware", 
                state: 'initializing' , 
                tenants: messages.tenantInfo() 
            }
        
            if(appStatus.isRunning()){
                pageData.state = 'running'
            }
            res.render('index', pageData)
        })
    }

   return {
        configure: function(r){
            router = r
            configureIndexPageRender()
        }
   } 
})()

module.exports = {
    indexRouting
}