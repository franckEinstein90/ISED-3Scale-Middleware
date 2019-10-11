"use strict";
const fs = require('fs')
const path = require('path')

const utils = (function() {

    return {

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
        }

    }

})()

module.exports = {
    utils
}