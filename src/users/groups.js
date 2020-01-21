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
const getGroupTenants = function({name, ID}){
	return new Promise((resolve, reject) => {

	})
}
const groups = (function( ){

	let _groups = new Map() 
	let _groupNames = []

	return {

		onReady: function(){
			//get group information and store in _groups and _groupNames
			db.getGroupDefinitions()
			.then(groups => {
				groups.forEach(group =>{
					_groups.set(group.ID, {name: group.name})
					_groupNames.push({name: group.name, ID: group.ID})
				})
				return _groupNames 
			})
			.then(groupArray =>{
				return Promise.all(groupArray.map( group => db.getGroupTenants(group.ID)))
			})
			.then( groupTenants =>{
				groupTenants.forEach( tenantGroup => {
					let tenantNames = tenantGroup.data.map(x => x.tenant)
					if(_groups.has(tenantGroup.groupID)){
						(_groups.get(tenantGroup.groupID)).tenants = tenantNames
					}
				})
				return Promise.all(_groupNames.map( group => db.getGroupUserProperties(group.ID)))
			})
			.then( groupProperties => {
				groupProperties.forEach( propertySet => {
					if(_groups.has(propertySet.groupID)){
						(_groups.get(propertySet.groupID)).properties = propertySet.data.map(x => x.property)
					}
				})
			})
		}, 
		definedGroups : _ => _groupNames, 	//returns array of group names and id 
		newGroup: function({ 				//creates a new group
			groupName, 
			groupUserProperties, 
			groupTenants, 
			groupEmailPattern
		}){
			return db.newUserGroup({
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
			})
		}, 
		deleteGroup: function(groupName){
			return db.deleteUserGroup(groupName)
			.then(x => {
				if(x === 'ok') {
					return 200 
				}
				else {
					return 404
				}
			})
		}

	}
})()

module.exports = {
	groups	
}
