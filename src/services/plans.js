/*******************************************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * 2019-2020
 * --------------------------------------------------
 *  Module plans.js
 * --------------------------------------------------
 *  functions that retrieve various tenant information
 *  through the rest APIs of various related system 
 ******************************************************************************/
"use strict"

/*****************************************************************/"use strict"
//const Feature = require('@services/features').features.Feature

const plans = ( function() {

    return {
        
        Plan: class {
            constructor({
                type,
                id,
                state
            }) {
                this.accessRights = {
                        ca_gov_wide: false,
                        dep_internal: false
                    },
                    this.type = type
                this.id = id
                this.state = state
                this.features = []
            }
        }
    }
})()

/*
plans.Plan.prototype.addFeature = function(featureInfoJson) {
    let systemName, planFeature

    systemName = featureInfoJson.system_name
    if (systemName === 'gc-internal') {
        this.accessRights.ca_gov_wide = true
    } else if (/\-internal$/.test(systemName)) {
        this.accessRights.dep_internal = true
    }

    planFeature = new Feature(featureInfoJson)
    this.features.push(planFeature)
    return planFeature
}
*/
module.exports = {
    plans
}