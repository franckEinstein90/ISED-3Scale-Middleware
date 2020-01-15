/*******************************************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * Application APICan
 * -------------------------------------
 *  APICanData
 *
 *  Holds critical app data 
 *
 ******************************************************************************/
"use strict"

const config = require('config')
const expect = require('chai').expect


const APICanData = (function(){

 	let _tenantsConfigurationInfo = null	
	let _configurationEnv = null

	return{

		configure : function({
				 masterData 
		}){

	   	_tenantsConfigurationInfo  = masterData.tenants
			_configurationEnv = masterData.env

		},

		tenantsConfigurationInfo : _ =>  _tenantsConfigurationInfo,

		env : _ => _configurationEnv
		
	}
	
})()


module.exports = {
	APICanData
}
