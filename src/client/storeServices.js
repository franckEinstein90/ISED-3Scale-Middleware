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
let openServiceInspectDialog = function({
    tenant,
    serviceID
}) {

    document.getElementById('serviceInspectModal').style.display = 'block'
    $('#serviceModalTenantName').text(tenant)
    $('#serviceModalID').text(serviceID)
    $.get('/serviceInspect', {
            tenant,
            service: serviceID
        }, function(apiInfo) {

            $('#apiInspectFormState').val(apiInfo.state)
            $('#apiInspectFormTenantName').val(apiInfo.tenantName)
            $('#apiInspectFormServiceID').val(apiInfo.serviceID)
            $('#apiInspectFormSystemName').val(apiInfo.systemName)
            $('#apiInspectFormLastUpdate').val(apiInfo.updatedAt)
            $('#apiInspectFormCreationDate').val(apiInfo.created_at)
            $('#englishDoc').val(apiInfo.documentation[0].docSet.body)
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
        $('#visibleAPISelect').on('change', function() {
            _app.showVisibleAPITable( this.value )
        })

        $('.serviceInspect').click(event => {
            event.preventDefault()
            let parentTable = event.currentTarget.offsetParent
            let tenant = parentTable.id.replace('VisibleAPI', '')
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
        }

    }

})()

module.exports = {
    storeServices
}