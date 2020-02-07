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

/*****************************************************************************/
const config = require('config')
const expect = require('chai').expect
/*****************************************************************************/


const getMasterConfigInfo = function(){
	let tenantsConfigurationInfo = config.get('master')
	expect(tenantsConfigurationInfo).to.exist
	expect(typeof tenantsConfigurationInfo).to.eql('object')
	return  tenantsConfigurationInfo
}

const getJiraAuthCredentials = function(){
	return {
		password			: config.get('jiraRequestPassword'), 
		username			: config.get('jiraRequestUserName')
	}
}

const getKeycloakCredentials = function( env ){
	return {
		keycloakURL		:	config.get('DeVssoHostUrl'),
		keycloakClient	: 	config.get('keyCloakClientId'), 
		keycloakSecret	: 	config.get('keyCloakClientSecret')
	}
}

const APICanData = (function(){

	let _appConfigurationData		= getMasterConfigInfo() 
	let _tenantsConfigurationData	= new Map() 
	let _configurationEnv			= _appConfigurationData.env
	let _jiraAuthCredentials		= getJiraAuthCredentials()
	let _keycloakCredentials		= getKeycloakCredentials( _configurationEnv )
	let _APIStoreUserName			= config.get('APIStoreUserName')

	_appConfigurationData.tenants.forEach(t => {
		_tenantsConfigurationData.set(t.name, t)
	})
	
	return{

		env					: _appConfigurationData, 

		apiStoreUserName	: _APIStoreUserName, 

		jiraAuthCredentials	: _jiraAuthCredentials, 

		keycloakCredentials	: _keycloakCredentials, 

		tenants				: {
			count	: _tenantsConfigurationData.size, 
			forEach	: function( callback ){
							_tenantsConfigurationData.forEach( callback )
			}
		}
	}
	
})()


module.exports = {
	APICanData
}
