"use strict"; 

const async = require('async');
const tenants = require('./tenants').tenants; 
const tCollection = require('./tenantCollections').tenantCollections; 

const userInfo = (function(){

	let tenants = new tCollection.Set()
	
	return{

		languages: {
			francais: 2,
			english: 1
		}, 
		
		//on ready is run once at application startup
		onReady: function(dataJSON){
			dataJSON.master.tenants.forEach(tenantInfo => {
					if (tenantInfo.visible) {
						tenantsCollection.push(new tenants.tenant(tenantInfo))
					}
			})
		}, 
		
		getUserInfo: function(userEmail, language){
			tenantsCollection.getAccountInfo(userEmail)	
		}
	}
})()

module.exports = {
	userInfo
}
