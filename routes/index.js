const path = require('path');
const express = require('express');
const router = express.Router();
const userInfo = require(path.relative(__dirname, './src/userInfo.js')).userInfo;


router.get('/user', function(req, res, next) {
	let email = req.query.email
	let language = req.query.lang
	userInfo.getInfo({email,language})
});


/* GET home page. */
router.get('/', function(req, res, next) {
	  res.render('index', { title: 'Express' });
});

module.exports = router;
