/***************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 ***************************************/
"use strict";

const validator = require('validator')
const accessLog = require('@src/utils').utils.accessLog 

const queryManager = (function() {
	
    return {
		  requestLogMessage: function(req){
			 	return `[ip: ${req.ip}] [received: ${req._startTime}]`
		  }, 
        validate: function(req, logMessage) {
            //if not valid, simply return null objects
            let userEmail = req.query.email
            let language = req.query.lang

            //if the userEmail is either invalid as an email or not present
            //set it to null
            if (userEmail === undefined){
                userEmail = null
                logMessage.message += `- email [undefined]`
            }
            else if (!validator.isEmail(userEmail)) {
                userEmail = null
                logMessage.message += '- email [invalid]'
            }
            else{
                logMessage.message += `- email [${userEmail}]`
            }

            if (language === undefined || !(language === "fr" || language === 'en')) {
                language = null
            }
            return {
                userEmail,
                language
            }
        }
    }
})();

module.exports = {
    queryManager
}
