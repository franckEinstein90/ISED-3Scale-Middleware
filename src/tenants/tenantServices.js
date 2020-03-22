/*****************************************************************************/
"use strict"
/*****************************************************************************/
const validator = require('validator')
/*****************************************************************************/
const alwaysResolve = require('@src/utils/alwaysResolve').alwaysResolve
const addServiceInterface = (tenantProto) => {

    tenantProto.getServicePlans = async function(serviceID) {
        let apiCall = [
            `https://${this.adminDomain}/admin/api/`,
            `services/${serviceID}/service_plans.json?access_token=${this.accessToken}`
        ].join('')

        let good = body => {
            if (validator.isJSON(body)) {
                let parsedAnswer = JSON.parse(body)
                return parsedAnswer
            }
        }

        let bad = null

        return alwaysResolve(apiCall, {
            good,
            bad
        })
    }


}

module.exports = {
    addServiceInterface
}