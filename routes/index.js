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

const validateRequest = function(req){
	let userEmail, language
	userEmail = req.query.email
	language = req.query.lang
/*write handler error*/
	if(!validator.isEmail(userEmail)){
		throw(errors.invalidEmail)
	}
	if(! (language === "fr" || language === 'en') ){
		throw(errors.invalidLanguage)	
	}
	return {userEmail, language}
}

/*make sure headers are correct */	
router.get('/userinfo.json', 
	async function(req, res, next) {
		res.header("Content-Type", "application/json; charset=utf-8")
		let {userEmail, language} = validateRequest(req) 
		res.send(await tenantsManager.getUserInfo({userEmail, language}))
	});

/*for this one, there might not be an email write handler for case*/
router.get('/api.json', 
	async function(req, res, next) {
		let {userEmail, language} = validateRequest(req) 
		res.send(await tenantsManager.getApiInfo({userEmail, language}))
	});


/* GET home page. Used to test connection*/
router.get('/', function(req, res, next) {
	  res.render('index', { title: 'ISED-3Scale-Middleware' });
});

module.exports = router;
