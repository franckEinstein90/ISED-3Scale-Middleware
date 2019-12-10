/***************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 ***************************************/
const express = require('express')
const router = express.Router()
const accessLog = require('@src/utils').utils.accessLog
const tenantsManager = require('@services/tenantsManager').tenantsManager
const queryManager = require('./queryManager').queryManager

const messages = require('@server/messages').messages
const appStatus = require('@server/appStatus').appStatus
const users = require('@users/users').users

router.get('/userinfo.json', async function(req, res, next) {
		let logMessage, callArgs
		logMessage = {
			message: `userinfo request ${queryManager.requestLogMessage(req)} `
		}
		callArgs = queryManager.validate(req, logMessage)
		accessLog.log('info', logMessage.message)
		res.header("Content-Type", "application/json; charset=utf-8")
		res.send(await tenantsManager.getUserInfo(callArgs))
	})

router.get('/api.json', async function(req, res, next) {
		let logMessage = {
			message: `api.json request ${queryManager.requestLogMessage(req)}`
		}
		let callArgs = queryManager.validate(req, logMessage)
		accessLog.log('info', logMessage.message)
		res.header("Content-Type", "application/json; charset=utf-8")
		res.send(await tenantsManager.getApiInfo(callArgs))
	})



/* GET home page. Used to test connection*/
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

router.get('/searchUser', async function(req, res, next){
	let emailSearchString = req.query.search
	let returnData = users.getUserList(emailSearchString)
	.then(x =>{
		res.send(x)
	})
})

router.get('/getTenantAdmins', async function(req, res, next){
	let tenantName = req.query.tenantName
	let tenant = tenantsManager.getTenantByName(tenantName)
	debugger
})


module.exports = router;
