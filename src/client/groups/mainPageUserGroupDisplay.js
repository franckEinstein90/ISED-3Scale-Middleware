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
            `<i id="${groupName}GroupEdit" class="fa fa-gears  w3-large w3-text-black groupCmd"></i>`, 
            `<i id="groupDelete_${groupID}" class="fa fa-trash w3-large w3-text-black groupCmd"></i>`]
  
        return groupRow
    }
    app.userGroupManagement.groupRegister.forEach( 
       (name, id) => {
            _tableHandle.row.add( _userGroupRow(name, id) ).draw( false )
       
            $(`#groupDelete_${id}`).click(function(event){
                event.preventDefault()
                app.userGroupManagement.deleteUserGroup(id)
            })

            $('#' + name + 'UserListDisplay').click(function(event) {
                event.preventDefault()
                app.userGroupManagement.loadUserGroupMembers(id)
            })

            app.ui.addUiTrigger({
                triggerID: name + "GroupEdit", 
                action: event  => {
                    app.userGroupManagement.getGroupDefinition(id)
                    .then(groupInfo =>  app.ui.userGroupModal(event, groupInfo))
               }
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
