"use strict"

const featureSystem = (function(){

    let _features = new Map()

    return {
      
        includes: featureName => {
            if(_features.has(featureName)) return _features.get(featureName)
            return false
        }, 
        list : x => _features , 
        add : function({ featureName, onOff }){
            if(featureSystem.includes(featureName)){
                throw "feature already exists"
            }
            _features.set(featureName, onOff)
        }
    }

})()

const addFeatureSystem = function( app ){
    app.features = featureSystem
    app.features.include = (features, status) => {
        Object.keys(features).forEach( key => {
            featureSystem.add({
                featureName: key, 
                onOff: status 
            })
        })
    }
}

module.exports = {
    addFeatureSystem
}