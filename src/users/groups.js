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
	let userGroups = null 

	return {

		onReady: function(){
			db.getGroupDefinitions()
			.then(groups => {
				userGroups = groups
			})
		}, 
		definedGroups : _ => userGroups, 
		newGroup: function({
			groupName, 
			groupUserProperties, 
			groupTenants, 
			groupEmailPattern
		}){
			db.newUserGroup({
				groupName, 
				groupDescription: "none", 
				groupEmailPattern
			})
			.then(result => {
				return db.getGroupID(groupName)
			})
			.then(groupID => {
				return db.setGroupTenants(groupID, groupTenants)
			})
			.then(groupID => {
				return db.setGroupProperties(groupID, groupUserProperties)
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
