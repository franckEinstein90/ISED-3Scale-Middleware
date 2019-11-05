/***************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 ***************************************/
"use strict";

const validator = require('validator')

const query = (function() {
    return {

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
    query
}