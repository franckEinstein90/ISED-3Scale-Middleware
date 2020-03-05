/*******************************************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * ------------------------------------- 
 *  configures the ui element at the top of the 
 *  content section that displays user groups
 ******************************************************************************/
"use strict"
/*****************************************************************************/
const mainPageGroupDisplay = function( app ){

    let _tableHandle = $('#userFormGroupList').DataTable()
    $('#userFormGroupList tbody').empty()

    let _userGroupRow = function(groupName, groupID) { //displays the group
        let groupRow = [
            groupName,
            `<i id="${groupName}UserListDisplay" class="fa fa-eye w3-large w3-text-black groupCmd"></i>`, 
            `<i class="fa fa-gears  w3-large w3-text-black groupCmd"></i>`, 
            `<i class="fa fa-trash w3-large w3-text-black groupCmd"></i>`]
  
        return groupRow
    }


    app.groups.forEach( group => {
        _tableHandle.row.add( _userGroupRow(group.name, group.id) ).draw( false )

        $('#' + group.name + 'UserListDisplay').click(function(event) {
            event.preventDefault()
            displayGroupUsers(group.name, group.id)
        })
    })

    return app
}

const addFeature = function(app){
    return mainPageGroupDisplay( app )
}

module.exports = {
    addFeature
}
