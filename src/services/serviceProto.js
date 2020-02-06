/*******************************************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * 
 * Application APICan - Feb 2020
 * -------------------------------------
 *  serviceProto.js : prototype class for service class
 *
 ******************************************************************************/
"use strict"

/*****************************************************************************/
const validator = require('validator')
/*****************************************************************************/
const errors = require('@errors').errors
const alwaysResolve = require('@utils/alwaysResolve').alwaysResolve
/*****************************************************************************/

class ServiceProto {
    constructor({
        id,
        serviceProvider
    }) {
        this.id = id
        this.serviceProvider = serviceProvider
        this.features = new Map()
    }

    storeUpdateFeature({
        featureCategory, 
        featureID, 
        featureName
    }){
        if(! this.features.has( featureCategory )){
            this.features.set( featureCategory, [])
        }

        let category        = this.features.get( featureCategory )
        let storedFeature   = category.find(feature => feature.id === featureID)

        if( storedFeature && storedFeature.name === featureName){ //nothing to update

        } else if( storedFeature ) {
            storedFeature.name = featureName
        } else {
           category.push({
               id: featureID, 
               name: featureName
           }) 
        }
    }
}


module.exports = {
    ServiceProto
}