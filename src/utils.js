"use strict";
const fs = require('fs')
const path = require('path')
const request = require('request')

const utils = (function() {

	 let langCodes, envCodes, runningEnv;

	 langCodes = {
		 fr: "fr", 
		 en: "en"
	 }
	 envCodes = {
		 dev: "dev", 
		 prod: "prod"
	 }
    return {
		  runningEnv(){
		  }, 
        readConfigFile: function() {
            //used for testing
            console.log(__dirname)
            try {
                let filePath, rawData;
                filePath = path.normalize(__dirname + '/../config/default.json')
                rawData = fs.readFileSync(filePath, {
                    encoding: 'utf-8'
                })
                return JSON.parse(rawData)
            } catch (err) {
                console.log(err)
                throw (err)
            }
        },

        log: function(str) {
            console.log(str)
        }, 

		  langMsg: function(language, {fr, en}){
				if(language === langCodes.fr) return fr
			   if(language === langCodes.en) return en
			   throw "non recognized error code"
          }, 

          alwaysResolve: function(apiCall, {good, bad}){
            return new Promise((resolve, reject) => {
                request(apiCall, function(err, response, body){
                    if(err) return resolve(bad)
                    if(response && response.statusCode === 200 && response.statusMessage === "OK"){
                        resolve(good(body))	
                    }
                    else{
                        return resolve(bad)
                    }
                })
            })
        }
    }

})()

module.exports = {
    utils
}
