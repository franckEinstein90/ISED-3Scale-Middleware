/***********************************************************
 * manages form to create or edit user groups
 * ***************************************************************************/
"use strict"
/*****************************************************************************/

const selectedTenants = new Map() 

const tenantSelectionTable = function( ){
    return [
            `<label class="groupCreationLabel"><b>Included tenants</b></label>`,
            `<table id="groupsTenantsSelectionTable" class="display" style="color:black">`,
            `</table>`
    ].join('')
}


const formTemplate = function( formContent ){
    return [
            `<div class="w3-row">`, 
                `<div class='w3-col m5 l5 w3-left-align' style="margin-right:20px">`, 
                    formContent, 
                `</div>`, 
                `<div class='w3-col m5 l5 w3-right-align"'>`, 
                    tenantSelectionTable(),  
                `</div>`, 
            `</div>`].join('')
}

const userGroupCreateEditWindowFeature = function( app ){

    let groupNameInput = value => app.ui.textField({
            label: 'Group Name',
            value: value || null,  
            htmlID: 'userGroupName'
    })

    let groupEmailPattern  = value => app.ui.textField({
            label: 'Email Pattern',
            value: value || null,  
            htmlID: 'groupEmailPattern'
    })
    
    let groupDescription = value => app.ui.textArea({
            label: "Description", 
            value: value || null, 
            htmlID: 'userGroupDescription'
    })

    let hiddenIDInput = value => app.ui.hidden({
            htmlID: 'groupID', 
            value
    })
    
    let propertyCheck = ( label, htmlID, propertyName, propertyList )  =>{
        return app.ui.checkBox({
            label, 
            htmlID, 
            checked: propertyList !== undefined && propertyList.includes(propertyName)?'checked': ""
        })
    }
    let groupPropertySubform = function(group){
        let providerAccountCheck = propertyCheck( 
            'Provider Accounts Only', 
            'providerAccountSearchSelect', 
            'providerAccount', 
            group !== undefined ? group.properties : [])

        let keyCloakCheck = propertyCheck( 
            'Has keycloak account only', 
            'keyCloakAccountSelect', 
            'keyCloakAccount', 
            group !== undefined ? group.properties : [])

        let OTPNotEnabledCheck = propertyCheck( 
            'OTP Not Enabled Only', 
            'otpNotEnabledSelect', 
            'otpNotEnabled', 
            group !== undefined ? group.properties : [])

        if( group !== undefined ){ 
            return [
                `${hiddenIDInput(group.ID)}`,  
                `${groupNameInput(group.name)}`, 
                `${groupEmailPattern(group.emailPattern)}`, 
                `${groupDescription(group.Description)}`, 
                `${providerAccountCheck}<P>${keyCloakCheck}<P>${OTPNotEnabledCheck}`
            ].join('')
        } else {
           return [
                `${hiddenIDInput()}`,  
                `${groupNameInput()}`, 
                `${groupEmailPattern()}`, 
                `${groupDescription("")}`, 
                `${keyCloakCheck}<P>${OTPNotEnabledCheck}<P>${providerAccountCheck}`
            ].join('')
        }
    }

    let editForm = function( group ){

        let htmlID = 'editExistingGroup'
        let groupProperties =  groupPropertySubform(group)
        let formContent = app.ui.form(formTemplate(groupProperties), {
            ID: htmlID, 
            label: 'Edit Group'
        })

        app.showModal({
                title: `Editing group: ${group.ID}`,  
                content: formContent
        })

        tenantDomainTable( app )
        app.ui.addUiTrigger({
            triggerID: htmlID,  
            action: x => {
                    let groupFormValues = getGroupFormInputs()
                    groupFormValues.groupID = group.ID
                    app.userGroupManagement.editUserGroup( groupFormValues )
                    app.ui.hideModal()
                }})
    }

    return {

        showUserGroupModal  : function( event, group){
            event.preventDefault()
            if( group !== undefined ){  //editing an existing group
            	selectedTenants.clear()
		        group.tenants.forEach( tenant => selectedTenants.set(tenant, 1) )
                editForm(group)
            }

            else {
                let htmlID = 'createNewGroup'
                let groupProperties = groupPropertySubform()
                let formContent = app.ui.form(formTemplate(groupProperties), {
                    ID: htmlID, 
                    label: 'Create New Group'
                })
                selectedTenants.clear()
                app.showModal({
                    title: "New User Group", 
                    content: formContent
                })
                tenantDomainTable( app )

                app.ui.addUiTrigger({
                    triggerID: htmlID,  
                    action: x => {
                        let groupFormValues = getGroupFormInputs()
                        app.userGroupManagement.createNewUserGroup( groupFormValues )
                        .then( opResult => {
                            app.ui.hideModal()
                        })
                    }
                })
            }
        }
    }
}

const getGroupFormInputs = function() {
   let tenants = []
   selectedTenants.forEach((_, tenant)=>tenants.push(tenant))

   let userProperties = []

   if ($('#providerAccountSearchSelect').is(":checked")) {
        userProperties.push('providerAccount')
   }
   if ($('#keyCloakAccountSelect').is(":checked")) {
        userProperties.push('keyCloakAccount')
   }
   if ($('#otpNotEnabledSelect').is(":checked")) {
        userProperties.push('otpNotEnabled')
   }

    
   return {
        name: $('#userGroupName').val(), 
        emailPattern : $('#groupEmailPattern').val(),
        Description : $('#userGroupDescription').val(), 
        selectedTenants : tenants,
        groupUsers  : userProperties
   }
}

const tenantDomainTable = function( app ){

   let tableID = app.ui.dataTables.newTable({
       htmlID : 'groupsTenantsSelectionTable', 
       fields: [{id: 'tenant', label:'Tenant'}],
       options: {
            'info': true, 
            'searching': false,
            'paging' : false, 
            'lengthChange':false
        }
    })

    app.tenants.forEach( tenant => {
        app.ui.dataTables.addRow({
            tableID, info: { tenant } })
    })

    let selectedTenantTableRow = dataRow =>  {
        let rowData = app.ui.dataTables.getRowData({
            tableID, 
            dataRow
        })
        return rowData[0]
    }

    $('#groupsTenantsSelectionTable tbody tr').each(function(){
	    let selectedTenant = selectedTenantTableRow( this )
	    if(selectedTenants.has( selectedTenant )){
		    $(this).addClass('selected')
	    }
    })
       
    $('#groupsTenantsSelectionTable tbody').on( 'click', 'tr', function () {
		
        let selectedTenant = selectedTenantTableRow(this)
        if ($(this).hasClass('selected')){
            selectedTenants.delete( selectedTenant )
            $(this).removeClass('selected')
        } else {
            selectedTenants.set(selectedTenant, 1)
            $(this).addClass('selected')
        }
    })
}



const addFeature = async function( app ){

    let userEditCreateModal = userGroupCreateEditWindowFeature( app )

    app.ui.addFeature({
        label: 'userGroupModal', 
        method: (event, formType) => userEditCreateModal.showUserGroupModal(event, formType)
    })

    app.ui.addUiTrigger({
        triggerID   : 'newGroupFromMain', 
        action      : event => app.ui.userGroupModal( event )
    })

    app.ui.addUiTrigger({
        triggerID: 'manageUsersBtn', 
        action: app.ui.userGroupModal
    })
    return app
}

module.exports = {
    addFeature
}
