const path = require('path');
const express = require('express');
const router = express.Router();
//const fs = require('fs'); 
//const userInfo = require(path.relative(__dirname, './src/userInfo.js')).userInfo;



router.get('/userinfo.json', function(req, res, next) {
	let email = req.query.email
	let language = req.query.lang
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
