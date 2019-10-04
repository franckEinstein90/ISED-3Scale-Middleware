const express = require('express');
const router = express.Router();
const validator = require('validator')
const userInfo = require('userInfo')



router.get('/userinfo.json', function(req, res, next) {
	let email, language
	email = req.query.email
	if(!validator.isEmail(email)){
		res.send(app.errors.invalidEmail)
		return
	}
	let language = req.query.lang
	if(! (language === "fr" || language === 'en') ){
		res.send(app.errors.invalidLanguage)	
	}
	try{
		userInfo.getUserInfo(email, language)
	}catch(err){
		res.send("error")
	}
	
});


/* GET home page. */
router.get('/', function(req, res, next) {
	  res.render('index', { title: 'Express' });
});

module.exports = router;
