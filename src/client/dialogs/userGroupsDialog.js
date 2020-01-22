/*******************************************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware - 2020
 * Application APICan
 * -------------------------------------
 *  dialogs/userGroupsDialog.js
 * 
 * Inits userGroupDialog 
 ******************************************************************************/

"use strict"

/*****************************************************************************/
const storeUsers = require('../storeUsers').storeUsers
const tenants = require('../tenants').tenants

let userGroupsDialog = function({
    jqCreateNewGroupButton
}){
    let tenantSelectionCell = tName => {
        return [
            `<td class='tenantSelection'>`, 
            `<label class="w3-text-blue">${tName} &nbsp;&nbsp;</label>`,
            `<input class="w3-check tenantFilterCheckBox" id='${tName}SearchSelect' `, 
            `type="checkbox"></input>`, 
            '</td>'
        ].join('')
    }

    jqCreateNewGroupButton.click(function(event) {
        event.preventDefault()
        if (tenants.ready()) {
            let newUserGroup = new storeUsers.Group()
        }
    })

    let currentRow = ""
    tenants.names().forEach((tenant, index) => {
        if( currentRow.length === 0){
            currentRow = `<TR>${tenantSelectionCell(tenant)}`
        }
        else {
            $('#tenantSelectionTable').append(`${currentRow}${tenantSelectionCell(tenant)}</TR>`)
            currentRow = ""
        }
    })
    if(currentRow.length > 0){
        $('#tenantSelectionTable').append(`${currentRow}<td>&nbsp;</td></TR>`)
    }
}


module.exports = {
    userGroupsDialog
}
