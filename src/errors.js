"use strict"; 

const errors = (function(){
	
	return{
		codes: {
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
				this.servicesToRemove = [], 
				this.updatedServices = []
			}
		}, 
		errorHandler: function(err){
			console.log('went to error handler')
		}
	}
	
})() 

errors.TenantUpdateReport.prototype.reportUpdateService = 
	function(serviceID, {updateTarget, updateResult}){

	let serviceUpdateReport = this.updatedServices.find(
		updateReport => updateReport.id === serviceID
	)
	//if there wasn't already an update report for that 
   //service, create a new one
	if (serviceUpdateReport === undefined){
		serviceUpdateReport = {
			id: serviceID
		}
		this.updatedServices.push(serviceUpdateReport)
	}
	//now add the update report unit to the object
	serviceUpdateReport[updateTarget]= updateResult
		
}

module.exports = {
	errors
}
