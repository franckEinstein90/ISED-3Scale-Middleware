/***********************************************************
 * manages form to create or edit user groups
 * ***************************************************************************/
"use strict"
/*****************************************************************************/
const tenantSelectionTable = function(options){
    return [
        `<label class="groupCreationLabel"><b>Included tenants</b></label>`,
        options.tenantSelection 
        `<table>`,
        `</table>`
    ].join('')
}
/*
  <br/>
      <button id="selectAllTenants">select all</button>
      <button id="unselectAllTenants">unselect all</button>
  <br/>

 <table id="groupsTenantsSelectionTable" class="display" style="color:black">
    <thead>
      <tr>
        <th>Name</th>
      </tr>
    </thead>  
    <tbody>
      <tr><td>da</td></tr>
    </tbody> 
</table>*/


const formTemplate = function(options){
    return [
        `<form class="w3-container w3-left-align">`, 
            `<div class="w3-row">`, 
                `<div class='w3-col m5 l5 w3-left-align' style="margin-right:20px">`, 
                    `left`, 
                `</div>`, 
                `<div class='w3-col m5 l5 w3-right-align"'>`, 
                  'right', //  `${tenantSelectionTable(options)}`, 
                `</div>`, 
            `</div>`, 
            `<div class="w3-row" style='margin:15,15,15,15'>`, 
                `<br/>`, 
                `<button class="w3-btn w3-blue w3-block" id="createNewGroup" >`, 
                    `${options.editGroup ? 'Save Changes':'Create New Group'}`, 
                `</button>`, 
                ` <br/>`, 
            ` </div>`, 
        `</form>`].join('')
}

const userGroupCreateEditWindowFeature = function( app ){
    return {
        showUserGroupModal  : function(options){
            app.showModal({
                title: (options.editGroup ? `Edit group: ${options.editGroup}` : "New User Group"), 
                content: formTemplate( options )
            })
        }
    }
}

const getGroupFormInputs = function() {
    //gets the parameters from a new group creation

    let userProperties = []
    let groupDescription = $('#userGroupDescription').val()
    let newGroupName = $('#userGroupName').val()
    let groupEmailPattern = $('#groupEmailPattern').val()

    
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
        'userProperties[]': userProperties,
        name: newGroupName,
        groupDescription,
        groupEmailPattern
    }
}

const tenantDomainTable = function( app ){
   let selectedTenants = new Map()

   let _groupTenantDomainsUI = $('#groupsTenantsSelectionTable').DataTable({
        'info': true, 
        'searching': false, 
        'lengthChange':false
    })

    app.tenants.forEach(tenant => {
        _groupTenantDomainsUI.row.add([tenant]).draw(false)
    })

    let selectedTenantTableRow = dataRow =>  (_groupTenantDomainsUI.row(dataRow).data())[0]
       
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

    $('#createNewGroup').click(function(){
        debugger
        let formInput = getGroupFormInputs()
        let groupTenants = []
        selectedTenants.forEach((_, name) => groupTenants.push(name))
        formInput['tenants[]'] = groupTenants 
        $.post('/newUserGroup', formInput)
            .done(x => {
                debugger
            })
            .fail(x => {
                alert('error')
            })
    })
}

const addFeature = async function( app ){
    let userEditCreateModal = userGroupCreateEditWindowFeature( app )
    app.ui.addFeature({label: 'userGroupModal', method: userEditCreateModal.showUserGroupModal})
    app.ui.addUiTrigger({
        triggerID: 'newGroupFromMain', 
        action: app.ui.userGroupModal
    })
    app.ui.addUiTrigger({
        triggerID: 'manageUsersBtn', 
        action: app.ui.userGroupModal
    })
    return app
//    let _dataTableHandle = $('#userFormGroupList').DataTable()
//    return configureNewGroupModalWindow( app )
}
module.exports = {
    addFeature
}