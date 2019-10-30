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
				this.servicesToRemove = []
			}
		}, 
		errorHandler: function(err){
			console.log('went to error handler')
		}
	}
	
})() 


module.exports = {
	errors
}
