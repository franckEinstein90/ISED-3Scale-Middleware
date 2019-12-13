"use strict"

const request = require('request')
const validator = require('validator')

const alwaysResolve = function (apiCall, options = {
        good,
        bad
    }) {

            return new Promise((resolve, reject) => {
               if(! validator.isURL(apiCall)){
                 return resolve(options.bad("bad url"))
               } 

               request(apiCall, function(err, response, body) {
                    if (err) return resolve(options.bad)
                    if (response && response.statusCode === 200 && response.statusMessage === "OK") {
                        resolve(options.good(body))
                    } else {
                        return resolve(options.bad)
                    }
               })
            })
        }

module.exports= {
    alwaysResolve
}
