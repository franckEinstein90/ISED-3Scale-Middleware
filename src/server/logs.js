/*******************************************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * -------------------------------------
 * logs.js
 * All to do with the application's keeping of logs 
 ******************************************************************************/
"use strict"


/******************************************************************************/
const fs = require('fs')
const path = require('path')
const winston = require('winston')
/******************************************************************************/

const logs = (function() {
    let _logFile = 'logs/access.log'
    let requestLogger = winston.createLogger({
        format: winston.format.combine(
            winston.format.json(),
            winston.format.splat()
        ),
        transports: [
            new winston.transports.File({
                filename: _logFile 
            })
        ]
    })

    return {
        accessLog: requestLogger, 
        getLogs: async function(req, res, next){ 
            let filePath = path.normalize(__dirname + `/../../${_logFile}`)
            fs.readFile(filePath, (err, data) => {
                res.send(data)
            })
        }
    }
})()

module.exports = {
    logs
}