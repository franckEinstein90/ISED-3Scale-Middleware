/***************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 ***************************************/
const path = require('path')
const express = require('express')
const router = express.Router()
const validator = require('validator')
const assert = require('chai').assert

const tenantsManager = require('@services/userInfo').tenantsManager
const errors = require('@code/errors').errors

errors.ensureLoaded(tenantsManager, errors)

const validate = function(req){
	//if not valid, simply return null objects
	let {userEmail, language} = { req.query.email, req.query.lang }
	
	if(userEmail === undefined || !validator.isEmail(userEmail)){
		userEmail = null
	}
	if(language === undefined || ! (language === "fr" || language === 'en') ){
		language = null
	}
	return {userEmail, language}
}


router.get('/userinfo.json', 
	async function(req, res, next) {
		res.header("Content-Type", "application/json; charset=utf-8")
		res.send(await tenantsManager.getUserInfo(validate(req)))
	});

/*for this one, there might not be an email write handler for case*/
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
