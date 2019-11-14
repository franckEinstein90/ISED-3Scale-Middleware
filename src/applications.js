"use strict"

const applications = (function(){
    return{
        Application : class{
            constructor(applicationInfo){
                Object.assign(this, applicationInfo.application)
            }
        }
    }
})()

module.exports = {
    applications
}