/***************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 ***************************************/
const express = require('express')
const router = express.Router()
const tenantsManager = require('@services/tenantsManager').tenantsManager
const queryManager = require('./queryManager').queryManager
const appTimer = require('@src/cron/timer').cacheManage

const accessLog = require('@server/logs').logs.accessLog
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

router.get('/appStatus', async function(req, res, next){
	let statusOut = {
		runningTime: appTimer.runningTime(), 
		state: 'initializing', 
		nextTenantRefresh: appTimer.nextRefresh()
	}
	if(appStatus.isRunning()) statusOut.state = 'running'

	res.send(statusOut)
})

router.get('/findUsers', async function(req, res, next){
	
	let emailSearchString = req.query.search
	let tenantsToSearch = req.query.tenants
	let providerAccountsFilter = req.query.userProperties.includes('providerAccount')
	let hasKeyCloakAccountFilter = req.query.userProperties.includes('keyCloakAccount')
	let otpNotEnabledFilter = req.query.userProperties.includes('otpNotEnabled')

	return Promise.all(tenantsToSearch.map( function(tenantName){
		let tenant = tenantsManager.getTenantByName(tenantName)
		if(providerAccountsFilter){
			return tenant.getProviderAccountUserList()
			}
        else{
			return tenant.getAllUsers()
			}
		})
	)
	.then(userArrays =>{
		let returnArray = []
		userArrays.forEach(tenantUsers => 
			tenantUsers.forEach(user => {
			if(!returnArray.includes(user.user.email)){
				returnArray.push(user.user.email)
			}
		}))
		return returnArray
	})
	.then(userEmails => {
		if( appStatus.keyCloakEnabled() ){
			let keyCloakProfiles = userEmails.map(email => users.getUserList(email))
			return Promise.all(keyCloakProfiles)
		}
	})
	.then( results => {
		if(hasKeyCloakAccountFilter){
			results = results.filter(user => ('id' in user))
			if(otpNotEnabledFilter){
				results = results.filter(user => !(user.requiredActions.includes("CONFIGURE_TOTP") || (user.disableableCredentialTypes.includes('otp'))))
			}
		}
		res.send(results)
	})
})


router.get('/getTenantNames', async function(req, res, next){
	res.send(tenantsManager.tenants().map(t => t.name))
})

router.get('/getTenantAccounts', async function(req, res, next){
	let tenantName = req.query.tenantName
	let tenant = tenantsManager.getTenantByName(tenantName)
	tenant.getAccounts()
	.then(x => {
		res.send(x)
	})
})

router.get('/enforceOTP', async function(req, res, next){
	let userEmails = req.query.emails
	let enforceOTP = userEmails.map(email => users.enforceTwoFactorAuthentication(email))
	Promise.all(enforceOTP)
	.then(res.send('done'))
})

router.get('/getTenantUsers', async function(req, res, next){
	let tenantName = req.query.tenantName
	let tenant = tenantsManager.getTenantByName(tenantName)
	let userRoleFilter = req.query.role

	tenant.getAdminUsers({userRoleFilter})
	.then( x => { res.send(x) })

})


module.exports = router;





