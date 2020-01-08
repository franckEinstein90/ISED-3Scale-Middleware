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


const users = require('@storeUsers').users


const supportRequest = require('@apiStore/supportRequest.js').jiraInterface
router.post('/support', async function(req, res, next){
	//creates a jira support ticket for the api store
	res.header("Content-Type", "application/json; charset=utf-8")
	let summary = req.body.summary
	supportRequest.createSupportRequest({summary})
	res.send( JSON.stringify({test:'allo'}) )
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

router.post('/enforceOTP', async function(req, res, next){
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





