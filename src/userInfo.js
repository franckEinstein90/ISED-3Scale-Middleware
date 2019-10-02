"use strict"; 

const unirest = require("unirest");
const async = require('async');



const userInfo = (function(){

	let tenants, userURL, 
		getClientIDsFromEmail, getClientIDForTenant, getTenantSubscriptionKeysForUser; 

	tenants = [] 

	userURL  = function(){

	}


	getClientIDsFromEmail = function(email){
		let processPayload = function(payload){
			let userID = payload.account.id
			return userID;
		}
		let processSubscriptionInfoPayload = function(payload){
			console.log(payload)
		}
		async.each(tenants, function(tenant, callback){
			 getClientIDForTenant(tenant, email)
				.then(processPayload)
				.then(function(userid) {
					let appPromise = getTenantSubscriptionKeysForUser(userid, tenant)
					appPromise.then(processSubscriptionInfoPayload)
				})
				.catch(error => console.log("rejected" + error))
		}, function(err){
			if(err){
				console.log(err)
			}
		})
	}

	getTenantSubscriptionKeysForUser = function(userid, tenant){
		let baseURL = `https://${tenant.value.admin_domain}/admin/api/accounts/` 
		let apiCall = `${userid}/applications.json?access_token=${tenant.value.access_token}`
	
		let tenantCallPromise = new Promise(function(resolve, reject) {
				let request = unirest("GET", baseURL + apiCall);
				request.headers({
					'Content-Type': 'text/html',
					'Accept':'application/json', 
					'User-Agent':'ISED Middleware'
				})	
				request.end(function(response){
					if(response.error || response.code !== 200){
						reject(response.error)
					}else{
						resolve(response.body)
					}
				})
			})	
			return tenantCallPromise
	}

	getClientIDForTenant = function(tenant, email){

		let baseURL = `https://${tenant.value.admin_domain}/admin/api/accounts/`
		let apiCall = `find.json?access_token=${tenant.value.access_token}&email=${encodeURIComponent(email)}`

		return new Promise((resolve, reject)=>{

			let request = unirest("GET", baseURL + apiCall);
			request.headers({
				'Content-Type': 'text/html',
				'Accept':'application/json', 
				'User-Agent':'ISED Middleware'
			})	
			request.end(function (response) {
				if (response.error || response.code !== 200) {
					reject(response.error)
				}
				else{
					resolve(response.body);
				}
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
			let associatedIDs = getClientIDsFromEmail(email)
			console.log(associatedIDs)
			//validateEmail(email)
			//assert language == fr or en
		}
		
	}
})()

module.exports = {
	userInfo
}
