"use strict"; 

const async = require('async');
const t = require('./tenants').tenants; 
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
						tenantsCollection.push(new t.Tenant(tenantInfo))
					}
			})
		}, 
		
		getUserInfo: function(userEmail, language){
			tenants.getAccountInfo(userEmail)	
		}
        
	}
})()

module.exports = {
	userInfo
}
