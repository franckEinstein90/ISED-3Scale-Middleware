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

const expressConfig = function( serverApp ){

    viewSystem.configure({
        app	    : serverApp.expressStack, 
        root	: serverApp.root
    })

    serverApp.expressStack.use(cookieParser());
    serverApp.expressStack.use(express.json())
    serverApp.expressStack.use(express.urlencoded({
        extended: false
    }))
    serverApp.expressStack.use(express.static( serverApp.staticFolder))
    serverApp.expressStack.use(favicon( serverApp.faviconPath ))


}

module.exports = {
    expressConfig
}
