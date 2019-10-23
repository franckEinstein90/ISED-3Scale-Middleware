"use strict";
const fs = require('fs')
const path = require('path')

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
        runningEnv() {},
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

        langMsg: function(language, {
            fr,
            en
        }) {
            if (language === langCodes.fr) return fr
            if (language === langCodes.en) return en
            throw "non recognized error code"
        },

        maintainerTag: function(lang) {
            let maintainerObject = {
                email: "ic.api_store-magasin_des_apis.ic@canada.ca",
                url: "https://api.canada.ca",
                fn: utils.langMsg(lang, {
                    fr: "Equipe du magasin API",
                    en: "GC API Store Team"
                })
            }
            return maintainerObject
        }



    }

})()

module.exports = {
    utils
}
