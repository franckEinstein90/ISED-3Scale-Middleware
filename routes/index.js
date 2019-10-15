/***************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 ***************************************/
const path = require('path')
const express = require('express')
const router = express.Router()
const assert = require('chai').assert

const tenantsManager = require('@services/tenantsManager').tenantsManager
const validate = require('./queryManager').query.validate

router.get('/userinfo.json', 
	async function(req, res, next) {
		res.header("Content-Type", "application/json; charset=utf-8")
		res.send(await tenantsManager.getUserInfo(validate(req)))
	});

router.get('/api.json', 
	async function(req, res, next) {
		res.header("Content-Type", "application/json; charset=utf-8")
		res.send(await tenantsManager.getApiInfo(validate(req)))
	});


/* GET home page. Used to test connection*/
router.get('/', function(req, res, next) {
	  res.render('index', { title: 'ISED-3Scale-Middleware' });
});

module.exports = router;
