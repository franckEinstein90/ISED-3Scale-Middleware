/*****************************************************************************/
"use strict"
/*****************************************************************************/

class Feature {

    constructor( options ){
        this.label          = options.label
        this.implemented    = options.implemented || false
        this.method         = options.method || false
    }

}

const featureSystem = function( app ){

    let _features       = new Map()
    let _reqMajor       = 0
    let _requirements   = new Map()

    return {

        get list()  {
            let features = {}
            _features.forEach((value, key)=>{
                features[key] = value
            })
            return features
        },

        implements  : featureLabel => _features.has(featureLabel), 

        addRequirement  : function({
            req, 
            parentReq
        }) {
            if( parentReq === undefined || parentReq === null){
                _reqMajor += 1
                _requirements.set(  _reqMajor, req)
            }
        },

        includes: featureName => {
            if(_features.has(featureName)) return _features.get(featureName)
            return false
        },

        add : function( feature ){
            if(!('label' in feature)) throw 'error in feature definition'
            if(_features.has(feature.label)) throw "feature already exists"
            _features.set( feature.label, feature)
            if('method' in feature) app[ feature.label ] = feature.method
        }
    }
}

const addFeatureSystem = function( app ){

    let features = featureSystem( app )
    Object.defineProperty( app, 'features', {get: () => features.list})
    app.addRequirement = features.addRequirement        
    app.Feature = Feature
    app.addFeature = features.add
    app.implements = features.implements
    return app
}

module.exports = {
    addFeatureSystem
}
