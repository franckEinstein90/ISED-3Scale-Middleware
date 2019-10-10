/***************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 ***************************************/
"use strict";

const validator = require('validator')

const query = (function() {
    return {

        validate: function(req) {
            //if not valid, simply return null objects
            let userEmail = req.query.email
            let language = req.query.lang

            if (userEmail === undefined || !validator.isEmail(userEmail)) {
                userEmail = null
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