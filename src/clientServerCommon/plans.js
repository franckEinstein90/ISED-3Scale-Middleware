/*******************************************************************************
 * Franck Binard, ISED (FranckEinstein90)
 *
 * APICan application - 2020
 * -------------------------------------
 *  Canadian Gov. API Store middleware - client side
 *
 *  plans.js: plan related data struct 
 *
 ******************************************************************************/
"use strict"
 /*****************************************************************************/

const planTypes = {
    application : "application plan", 
    service     : "service plan"
}

const Plan = function({
    id, 
    planType, 
    planInfo
}){

    this.id         = id
    this.planInfo   = planInfo
    this.features   = []
    this.planType   = null 
    this.isApplicationPlan = false
    this.isServicePlan = false

    if(planType === "application"){
        this.planType = planTypes.application
        this.isApplicationPlan = true
    } else if(planType === "service"){
        this.planType = planTypes.service
        this.isServicePlan = true
    } else {
        throw "invalid plan type @ Plan constructor"
    }
}


module.exports = {
    planTypes, 
    Plan
}