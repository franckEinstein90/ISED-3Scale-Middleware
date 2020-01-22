/*******************************************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * -------------------------------------
 * logs.js
 * All to do with the application's keeping of logs 
 ******************************************************************************/
"use strict"


const winston = require('winston')

const logs = (function() {

    let requestLogger = winston.createLogger({
        format: winston.format.combine(
            winston.format.json(),
            winston.format.splat()
        ),
        transports: [
            new winston.transports.File({
                filename: 'logs/access.log'
            })
        ]
    })

    return {
        accessLog: requestLogger
    }
})()

module.exports = {
    logs
}