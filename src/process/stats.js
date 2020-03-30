/*******************************************************************************
 * Franck Binard, ISED - 2020
 * FranckEinstein90 - franck.binard@canada.ca
 * Prototype Code - Canadian Gov. API Store middleware
 * Used for demos, new features, experiments
 * 
 * Production application code at: https://github.com/ised-isde-canada/apican
 * 
 * Application APICan
 * -------------------------------------
 * add process stats support
 ******************************************************************************/
"use strict"

/*****************************************************************************/
const os = require('os')
/*****************************************************************************/
const pidUsage = require('pidusage')
/*****************************************************************************/

const APICanStats = function( APICan ){
	
	let getStats = () => {

		return new Promise((resolve, reject) => {
			pidUsage( APICan.process.id, function(err, stats ){
					APICan.process.cpu 		= stats.cpu
					APICan.process.memory 	= stats.memory / 1024 / 1024 //convert from B to MB
					APICan.process.elapsed	= stats.elapsed
					APICan.process.ppid		= stats.ppid
					return resolve( stats )
			})
		})

	}

	APICan.stats.refresh = getStats
}

const addProcessStatsFeature = function( app ){
	APICanStats( app )
	app.featureSystem.add({
		label: 'process-stats', 
		description: 'returns information on the process carrying this app', 
		state: 'implemented'
	})
}

module.exports = {
	addProcessStatsFeature
}
