/*******************************************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware - 2020
 * Application APICan
 * -------------------------------------
 *  expressStack.js 
 *
 *  sets up and configures the express setup stack
 ******************************************************************************/
"use strict"

/*****************************************************************************/
const express	   = require('express')
const cookieParser = require('cookie-parser')
const favicon      = require('express-favicon')
/*****************************************************************************/
const viewSystem   = require('@server/views/viewSystem.js').viewSystem
/*****************************************************************************/

const expressConfig = function({
	expressStack, 
	root, 
	faviconPath, 
	staticFolder
}) {


    viewSystem.configure({
        app	: expressStack, 
        root	: root
    })

    expressStack.use(cookieParser());
    expressStack.use(express.json())
    expressStack.use(express.urlencoded({
        extended: false
    }))
    expressStack.use(express.static(staticFolder))
    expressStack.use(favicon(faviconPath))


}

module.exports = {
    expressConfig
}
