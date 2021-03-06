require ('module-alias/register')

const expect = require('chai').expect
const utils = require('@src/utils').utils
const tenants = require('@src/tenants').tenants


const tenantDescriptions = utils.readConfigFile('master').master.tenants
const testEmails = {
    email1: "rojabadd%2Btest2@gmail.com"
}

describe('tenants.Tenant object', function(){
	it('is created from a tenant description' , function(){
		let testTenant = new tenants.Tenant(tenantDescriptions[0])
		expect(testTenant).to.exist
		expect(testTenant.name).to.eql("tc")
	})

	it('includes the following properties: name, accessToken, domain', function(){
		let testTenant = new tenants.Tenant(tenantDescriptions[0])
		expect('name' in testTenant).to.eql(true) 
		expect('accessToken' in testTenant).to.eql(true) 
		expect('domain' in testTenant).to.eql(true) 
	})

	it(['has a getAccountInfo method which takes',
        ' an email address as its parameter, and',
        'returns user account information'].join(''), 
		function(){
            let testTenant = new tenants.Tenant(tenantDescriptions[0])
            let callPromise = testTenant.getAccountInfoPromise( testEmails.email1)
            callPromise.then(accountObj => expect(accountObj.id).to.eql(348))	

	})

/*	it( ['has an addAccount method which takes an email address', 
		 'and account information as parameters, and adds the account', 
		 `to the tenant's account register` ].join(''), 
		function(){
		let testUserEmail, testTenant, callPromise
		testUserEmail = "dontvo+hackerman@gmail.com"
		testTenant = new tenants.Tenant(tenantDescriptions[0])
		callPromise = testTenant.getAccountInfoPromise( testUserEmail )
		callPromise
			.then(accountObj =>{
					console.log(accountObj)
					testTenant.addAccount({
						userEmail: testUserEmail, 
						accountInfo:accountObj})
			})
        expect(testTenant.accounts.has(testUserEmail)).to.be.true
	})
*/
})

