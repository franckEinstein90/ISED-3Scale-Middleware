"use strict"; 

const unirest = require("unirest");

const userInfo = (function(){

	let tenants = new Map(); 	

	return{

	languages: {
			francais: 2,
			english: 1
		}, 

	getInfo: function({email, language}){
			console.log(email + language); 

		  let request = unirest("GET", userURL(email));
			request.query({

			})
			request.headers({

			})


		}
	}
})()

module.exports = {
	userInfo
}
