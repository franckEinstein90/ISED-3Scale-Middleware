"use strict"
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

const configureNewGroupModalWindow = function ( app ){
    tenantDomainTable( app )

    $('#manageUsersBtn').click(function(){
        $('#userGroupsModal').css("display", "block")
    })

    $('#newGroupFromMain').click(function(){
        $('#userGroupsModal').css("display", "block")
    })
    return app
}
const addFeature = function( app ){
    let _dataTableHandle = $('#userFormGroupList').DataTable()
    return configureNewGroupModalWindow( app )
}
module.exports = {
    addFeature
}