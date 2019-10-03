"use strict"; 

const unirest = require("unirest");
const async = require('async');
const tenants = require('./tenants').tenants; 


const userInfo = (function(){

	let tenantsCollection

	tenantsCollection = [] 
	

	return{

		languages: {
			francais: 2,
			english: 1
		}, 

		onReady: function(dataJSON){
			let finishedGettingID = function(){
				console.log(tenantsCollection)
			}
			dataJSON.master.tenants.forEach(tenantInfo => {
					if (tenantInfo.visible) tenantsCollection.push(new tenants.tenant(tenantInfo))
			})
		}, 
		getUserInfo: function(userEmail, language){
			async.each(tenantsCollection, function(tenant, callback){
				tenant.getAccountInfo(userEmail)
			})
			.then(x => console.log(x))
	
		}
	}
})()

module.exports = {
	userInfo
}
