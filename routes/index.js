/***************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 ***************************************/
const path = require('path')
const express = require('express')
const router = express.Router()
const assert = require('chai').assert
const accessLog = require('@src/utils').utils.accessLog

const tenantsManager = require('@services/tenantsManager').tenantsManager
const queryManager = require('./queryManager').queryManager

router.get('/userinfo.json', 
	async function(req, res, next) {
		let logMessage, callArgs
		logMessage = {
			message: `userinfo request ${queryManager.requestLogMessage(req)} `
		}
		callArgs = queryManager.validate(req, logMessage)
		accessLog.log('info', logMessage.message)
		res.header("Content-Type", "application/json; charset=utf-8")
		res.send(await tenantsManager.getUserInfo(callArgs))
	});

router.get('/api.json', 
	async function(req, res, next) {
		let logMessage = {
			message: `api.json request ${queryManager.requestLogMessage(req)}`
		}
		let callArgs = queryManager.validate(req, logMessage)
		accessLog.log('info', logMessage.message)
		res.header("Content-Type", "application/json; charset=utf-8")
		res.send(await tenantsManager.getApiInfo(callArgs))
	});


/* GET home page. Used to test connection*/
router.get('/', function(req, res, next) {
	  res.render('index', { title: "<h1>API Tenants:</h1>" });
});

module.exports = router;
