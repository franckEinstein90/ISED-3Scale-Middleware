/*******************************************************************************
 * Franck Binard, ISED - 2020
 * FranckEinstein90 - franck.binard@canada.ca
 * Prototype Code - Canadian Gov. API Store middleware
 * Used for demos, new features, experiments
 * 
 ******************************************************************************/
"use strict"

/*****************************************************************************/
const apv = require('appversion')
/*****************************************************************************/

/*****************************************************************************/
const APICanVersion = function( apiCan ) {

    return new Promise((resolve, reject) => {

        apv.getAppVersion((err, data) => {

            if (err) {
                return resolve(apiCan)

            } else {
                apiCan.version = data.version
                apiCan.versionTag = [
                    `(v ${apiCan.version.major}:`, 
                    `${apiCan.version.minor}:`, 
                    `${apiCan.version.patch})`].join('')
                return resolve(apiCan)
            }
        })
    })
    return apiCan
}

const addVersioningFeature = function( app ){
    return APICanVersion(app)
    .then( app => {
        app.featureSystem.add({
            label: "versioning", 
            state: "implemented"
        })
        return app
    })
}

module.exports = {
    addVersioningFeature
}