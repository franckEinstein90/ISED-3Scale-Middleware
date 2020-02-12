/***********************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * 2019-2020
 * -------------------------------------
 *  Module utils.js
 *
 **********************************************************/


"use strict"

const fs = require('fs')
const path = require('path')
const request = require('request')


const utils = (function() {

    let langCodes, envCodes

    langCodes = {
        fr: "fr",
        en: "en"
    }

    envCodes = {
        dev: "dev",
        prod: "prod"
    }


    return {

        runningEnv: function() {},

        readConfigFile: function(fileName = 'default.json') {
            //used for testing
            console.log(__dirname)
            try {
                let filePath, rawData;
                filePath = path.normalize(__dirname + `/../config/default.json`)
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
        }
    }
})()

module.exports = {
    utils
}