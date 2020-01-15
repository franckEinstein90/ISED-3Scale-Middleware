/*******************************************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * Application APICan
 * -------------------------------------
 *  APICan  
 *
 *  Initializes APICan app internals 
 *
 ******************************************************************************/
"use strict"

const config = require('config')
const APICanData = require('@src/APICanData').APICanData
const expect = require('chai').expect


const APICan = (function(){
	
	return{

		configure : function(){
			let tenantData = config.get('master') 
			expect(tenantData).to.exist
			expect(typeof tenantData).to.eql('object')
			APICanData.configure({
				masterData: tenantData
			})
		}

	}
})()


module.exports = {
	APICan
}
