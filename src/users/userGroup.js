/*******************************************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * -------------------------------------
 *  app.js
 *
 * User Group Implementation 
 ******************************************************************************/
"use strict"


const UserGroup = function(tenants, properties){
	this.tenants = tenants || [] 
	this.properties = properties || [] 
	

}

module.require = {
	UserGroup
}
