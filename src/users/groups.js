/*******************************************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * -------------------------------------
 *  app.js
 *
 * User Group Implementation 
 ******************************************************************************/
"use strict"

const db = require('@server/db').appDatabase
const groups = (function( ){

	return {
		newGroup: function({
			groupName, 
			groupUserProperties, 
			groupTenants, 
			groupEmailPattern
		}){
			db.newUserGroup({
				groupName
			})
			.then(result => {
				debugger
			})
			.catch(error => {
				debugger
			})
		}
	}
})()

module.exports = {
	groups	
}
