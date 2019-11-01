"use strict"

const cronJob = require('node-cron')

const updateTenantInformation = function(){
	if(this.runningMinutes === undefined) {
		this.runningMinutes = 0
	}
	else{
		this.runningMinutes += 1
	}
	console.log(`fetch update cycle has been running for ${this.runningMinutes} cycles`)
}

process.on('message', (msg) => {
	cronJob.schedule('* * * * *', updateTenantInformation)
})
