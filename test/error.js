require ('module-alias/register')

const expect = require('chai').expect
const errors = require('@src/errors').errors


describe('tenants.Tenant object', function(){
	it('is created from a tenant description' , function(){
		let testUpdateReport= new errors.TenantUpdateReport('tc') 
		expect(testUpdateReport).to.exist
		expect(testUpdateReport.tenantName).to.eql("tc")
	})
})

describe('reportUpdateService method', function(){
	it('it adds a value to a report service' , function(){
		let testUpdateReport= new errors.TenantUpdateReport('tc') 
		testUpdateReport.reportUpdateService(5, {
			updateTarget: "featureToReportOn", 
			updateResult: true})
		expect(testUpdateReport).to.exist
		expect(testUpdateReport.updatedServices.has(5)).to.be.true
		let updateServiceReport = testUpdateReport.updatedServices.get(5)
		expect(updateServiceReport.featureToReportOn).to.eql(true)
	})
})

describe('English OK method', function(){
	it('checks if english documentation has been correctly updated' , function(){
		let testUpdateReport= new errors.TenantUpdateReport('tc') 

		testUpdateReport.reportUpdateService(5, {
			updateTarget: "featureToReportOn", 
			updateResult: true})
		expect(testUpdateReport.englishDocOk(5)).to.be.false

		testUpdateReport.reportUpdateService(5, {
			updateTarget: errors.codes.EnglishDoc, 
			updateResult: true})
		expect(testUpdateReport.englishDocOk(5)).to.be.true
	})
})


