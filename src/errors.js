"use strict"; 

const errors = (function(){



	return{
		codes: {
			EnglishDoc: "English Document Update", 
			FrenchDoc: "French Document Update", 
			NotOk: "Not Ok", 
			Ok: "Ok"
		}, 
		AppError: class extends Error{
			constructor(args){
				super(args)
				this.name = "ISEDMidWare Error"
			}
		},
		TenantUpdateReport: class {
			constructor(tenantName){
				this.tenantName = tenantName
				this.serviceListFetchResult = null
				this.docListFetchResult = null
				this.servicesToRemove = [] 
				this.updatedServices = new Map() 
			}
		}, 
		errorHandler: function(err){
			console.log('went to error handler')
		}
	}
	
})() 


errors.TenantUpdateReport.prototype.PropertyOk = function(serviceID, propertyName){
	if(this.updatedServices.has(serviceID)){
		let updateServiceReport = this.updatedServices.get(serviceID)
		if(propertyName in updateServiceReport){
			if(updateServiceReport[propertyName] === true) return true
		}
	}
	return false
}

errors.TenantUpdateReport.prototype.englishDocOk =	function(serviceID){
	return this.PropertyOk(serviceID, errors.codes.EnglishDoc)
}

errors.TenantUpdateReport.prototype.reportUpdateService = 
	function(serviceID, {updateTarget, updateResult}){

   //if there wasn't already an update report for that 
   //service, create a new one
	if(!this.updatedServices.has(serviceID)){
		this.updatedServices.set(serviceID, {

		})
	}
	let serviceUpdateReport = this.updatedServices.get(serviceID)
	//now add the update report unit to the object
	serviceUpdateReport[updateTarget]= updateResult
}

module.exports = {
	errors
}
