/*******************************************************************************
 * Franck Binard, ISED (FranckEinstein90)
 *
 * APICan application - 2020
 * -------------------------------------
 *  Canadian Gov. API Store middleware - client side
 *
 *  storeService.js: client api services module 
 *
 ******************************************************************************/

"use strict"

/******************************************************************************/
const Plan = require('../clientServerCommon/plans').Plan
/******************************************************************************/

let drawGraph = function(stats) {
    let ctx = document.getElementById('statsGraph').getContext('2d')
    let myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [
                'june', 'july', 'aug', 'sept', 'oct', 'nov', 'dec', 'jan', 'feb'
            ],
            datasets: [{
                label: 'hits per month',
                data: stats.values
            }],
            backgroundColor: stats.values.map(s => 'rgba(255, 0, 0, 0.7)'),
            borderColor: stats.values.map(s => 'rgba(0, 255, 0, 0.7)')

        },
        options: {}
    })
}

let showFeatures = features => {
    return [    "<h3>features</h3><ul>", 
                features.map(feature => `<li>${feature.name} - visible: ${feature.visible}</li>`).join(''), 
                '</ul>'
            ].join('')
}
let planHTMLView =  plan => {
     
    let planPane = [
        `<div class="${plan.planType.split(' ').join('_')}">`, 
        `<P>id: ${plan.id} - ${plan.planInfo.name} - ${plan.planInfo.state}</P>`,
        `${plan.features.length === 0 ? "no features" : showFeatures(plan.features)}`,  
        `</div>`
    ].join('')

    return planPane
}

let displayAssociatedPlans = function( plans ){
    $('#servicePlansDisplay').empty()
	plans.forEach(plan => {
        $('#servicePlansDisplay').append(planHTMLView(plan))
    })
}

let openServiceInspectDialog = function({
    tenant,
    serviceID
}) {

    document.getElementById('serviceInspectModal').style.display = 'block'
    $('#serviceModalTenantName').text(tenant)
    $('#serviceModalID').text(serviceID)
    $.get('/services', {
            tenant,
            service: serviceID
        }, function(apiInfo) {

            displayAssociatedPlans( apiInfo.plans )
            $('#apiInspectFormState').val(apiInfo.state)
            $('#apiInspectFormTenantName').val(apiInfo.tenantName)
            $('#apiInspectFormServiceID').val(apiInfo.serviceID)
            $('#apiInspectFormSystemName').val(apiInfo.systemName)
            $('#apiInspectFormLastUpdate').val(apiInfo.updatedAt)
            $('#apiInspectFormCreationDate').val(apiInfo.created_at)

            $('#EnglishDocTitle').text(apiInfo.documentation[0].docName)
            $('#englishDoc').val(apiInfo.documentation[0].docSet.body)

            $('#FrenchDocTitle').text(apiInfo.documentation[1].docName)
            $('#frenchDoc').val(apiInfo.documentation[1].docSet.body)
            let tags = []
            apiInfo.documentation.forEach(d => {
                if ('tags' in d.docSet) {
                    d.docSet.tags.forEach(t => tags.push(t))
                }
            })
            $('#apiTags').text(tags.join(','))
            if ('stats' in apiInfo) drawGraph(apiInfo.stats)
        })
        .fail(error => {
            debugger
        })
}

const storeServices = (function() {
    let _app = null

    let _setUI = function() {

        $('#publishableAPIs').DataTable({
            "pageLength" :50  
            
        })

        $('.serviceInspect').click(event => {
            event.preventDefault()
            let parentTable = event.currentTarget.offsetParent
            let tenant = (event.currentTarget.cells[2]).innerText
            let serviceID = Number((event.currentTarget.cells[1]).innerText)
            openServiceInspectDialog({
                tenant,
                serviceID
            })
        })
    }

    return {

        configure   : function( app ){
            _app = app
            _setUI()
        }, 

        showServiceInspectModal : function({
            tenantName, 
            serviceID
        }){
            openServiceInspectDialog({
                tenant  : tenantName, 
                serviceID
            })
        }
    }

})()



const addServiceInspectFeature = function( clientApp ){
    storeServices.configure(clientApp)
    clientApp.showServiceInspectModal = storeServices.showServiceInspectModal
}
module.exports = {
    addServiceInspectFeature
}
