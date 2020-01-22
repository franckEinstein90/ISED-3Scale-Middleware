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
const express = require('express')
const viewSystem = require('@server/views/viewSystem.js').viewSystem
const cookieParser = require('cookie-parser')
const favicon = require('express-favicon')

const expressStack = function({
    root,
    staticFolder,
    faviconPath

}) {
    let _app = express()
    viewSystem.configure({
        app: _app,
        root
    })

    _app.use(cookieParser());
    _app.use(express.json())
    _app.use(express.urlencoded({
        extended: false
    }))
    _app.use(express.static(staticFolder))
    _app.use(favicon(faviconPath))


    return _app
}

module.exports = {
    expressStack
}