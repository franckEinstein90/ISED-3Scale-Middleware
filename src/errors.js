/***********************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * -------------------------------------
 *  Module errors / server side
 *
 *  includes error handlers and reporting objects 
 **********************************************************/

"use strict"


const moment = require('moment')
const errors = (function(){

	class UpdateReport{
		 	constructor(){
				this.beginUpdateTime = moment()
			}
	} 
	

	return{
		codes: {
			ServiceDefinitionUpdate: "Service Definition Update", 
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
		TenantUpdateReport: class extends UpdateReport{
			constructor(tenantName){
				super()
				this.tenantName = tenantName
				this.serviceListUpdate = errors.codes.NotOk 
				this.activeDocsUpdate = errors.codes.NotOk
				this.servicesUpdates = errors.codes.NotOk
				this.servicesToRemove = [] 
				this.updatedServices = new Map() 
			}
		},

		ServiceUpdateReport: class extends UpdateReport{
			constructor(tenantName, serviceID){
				super()
				this.id = `${tenantName}_${serviceID}`
				this.featuresUpdate = errors.codes.NotOk
			}
		}, 

		log: function(errDescription){

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
			if(updateServiceReport[propertyName] === errors.codes.Ok) return true
		}
	}
	return false
}

errors.TenantUpdateReport.prototype.englishDocOk = function(serviceID){
	return this.PropertyOk(serviceID, errors.codes.EnglishDoc)
}

errors.TenantUpdateReport.prototype.filterAllOk = function(){
	//returns an array of services filtered as: 
	//EnglishDoc OK, FrenchDoc OK,
	let servicesToDisplay = []
	this.updatedServices.forEach(
		( serviceReport, serviceID ) => {
			if(
					this.PropertyOk(serviceID, errors.codes.ServiceDefinitionUpdate) &&
					this.PropertyOk(serviceID, errors.codes.EnglishDoc) &&
					this.PropertyOk(serviceID, errors.codes.FrenchDoc)
				){
				servicesToDisplay.push(serviceID)
			}
		})
	return servicesToDisplay
}



errors.TenantUpdateReport.prototype.reportUpdateService = function(serviceID, {updateTarget, updateResult}){

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
