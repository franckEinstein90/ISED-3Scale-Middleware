"use strict"; 

const unirest = require("unirest");
const async = require('async');



const userInfo = (function(){

	let tenants, userURL, getClientIDForTenant;

	tenants = [] 

	userURL  = function(){

	}

	getClientIDForTenant = function(tenant, email){

		let baseURL = `https://${tenant.value.admin_domain}/admin/api/accounts/`
		let apiCall = `find.json?access_token=${tenant.value.access_token}&email=${encodeURIComponent(email)}`

		return new Promise((resolve, reject)=>{

			let req = unirest("GET", baseURL + apiCall);
				
			req.end(function (res) {
				if (res.error) reject(res.error)
				resolve(res.body);
			})
		})
	}

	return{
		
		languages: {
			francais: 2,
			english: 1
		}, 

		onReady: function(dataJSON){
			let tenantsArr = dataJSON.master.tenants
			tenantsArr.forEach(tenant => {if (tenant.visible){tenants.push({name: tenant.name, value: tenant})}})
		}, 

		getInfo: function({email, language}){
			//validateEmail(email)
			//assert language == fr or en
			let ids = []
			let processPayload = function(payload){
				let userID = payload.account.id
				ids.push(userID)	
			}
			async.each(tenants, function(tenant, callback){
				let idPromise = getClientIDForTenant(tenant, email)
				idPromise.then(processPayload).catch(console.log("rejected"))
			})
		}
	}
})()

module.exports = {
	userInfo
}
