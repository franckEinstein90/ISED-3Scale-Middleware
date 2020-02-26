/*******************************************************************************
 * Franck Binard, ISED (FranckEinstein90)
 *
 * APICan Canada API Store control application - 2020
 * -----------------------------------------------------------------------------
 *  Canadian Gov. API Store middleware - client side
 *
 *  tenants.js: tenant related routines on client side 
 *
 ******************************************************************************/
"use strict"
/******************************************************************************/
const moment = require('moment')
/******************************************************************************/

const tenants = (function() {

    let $tenantSectionContainer = null
    let _tenants = new Map()

    let _configUI = function(){

        $('#btnRefreshTenants').click(function ( event ){           //sends cmd
            event.preventDefault()                                  //to server to
            $.get('/refreshTenants', {}, function( tenantData ) {   //refresh tenant
                tenantData.forEach( tenantInfo => {                 //info
                    _tenants.set(tenantInfo.tenantName, tenantInfo)
                })
                tenants.updateTenantContainer()
            })
        })
    }

    return {

        configure : function( containerID ){
            $tenantSectionContainer = $(`#${containerID}`)
            $('.tenant-card').each( function(){
                let tenantName = ($( this ).attr('id')).replace('TenantCard', '')
                _tenants.set(tenantName, null)
            })
            _configUI()
        },

        updateTenantContainer : function(){
            _tenants.forEach((tInfo, tName) => {
                let beginUpdateTime = moment(tInfo.beginUpdateTime)
                let endUpdateTime = moment(tInfo.endUpdateTime)
                $(`#${tName}TenantCard`).text(`${tName}: LastUpdate: ${endUpdateTime.format('H:mm')}`)
            })
        }
   }
})()


const addTenantCollection = function({
    clientApp, 
    containerID
  }){
    tenants.configure(containerID)
    clientApp.tenants = tenants
    return clientApp
}

module.exports = {
   addTenantCollection 
}