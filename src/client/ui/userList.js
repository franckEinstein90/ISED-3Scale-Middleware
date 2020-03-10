"use strict"


const addUserListFeature = function( app ){
    app.ui.userDisplayUI = { 
        dataTable : $('#selectedUsersList').DataTable()
    }

    app.ui.userDisplayUI.addRow = function(user){

        app.ui.userDisplayUI.dataTable.row.add([
            (user.username|| '???'),
            (user.email || '???'),
            (user.created_at || '???'),
            (user.keyCloakAccount || '???')
        ]).draw(false)
    }
}
module.exports = {
    addUserListFeature
}