/***************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 ***************************************/
const path = require('path')
const express = require('express')
const router = express.Router()

const validator = require('validator')
const tenantsManager = require('@services/userInfo').tenantsManager
const assert = require('chai').assert


const validateRequest = function(req){
	let userEmail, language
	userEmail = req.query.email
	language = req.query.lang
	if(!validator.isEmail(userEmail)){
		throw(errors.invalidEmail)
	}
	if(! (language === "fr" || language === 'en') ){
		throw(errors.invalidLanguage)	
	}
	return {userEmail, language}
}

	
router.get('/userinfo.json', 
	async function(req, res, next) {
		let {userEmail, language} = validateRequest(req) 
		let requestResponse = await tenantsManager.getUserInfo(
			{userEmail, language})
		return res.json(requestResponse)
	});


/* GET home page. */
router.get('/', function(req, res, next) {
	  res.render('index', { title: 'Express' });
});

module.exports = router;
