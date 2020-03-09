/*******************************************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * -------------------------------------
 *
 * User Group Structure 
 ******************************************************************************/
"use strict"
/*****************************************************************************/

const createNewUserGroup = function( groupDefinition ){

}

const editUserGroup = function( groupDefinition ){

}

const deleteUserGroup = function( groupID ){

}

const loadUserGroupMembers = function( groupID ){
//    document.getElementById('userGroupsModal').style.display = 'none'
    //dataExchangeStatus.setLoading()
    //fetches and shows user daya associated with this user group
    let group = {
        group: groupID
    }
    $.get('/GroupUsers', group, function(data) {
        debugger
     //   dataExchangeStatus.setInactive()
      //  dataTableHandle.clear().draw()
       // keyCloakUsers.showUsers(data)
//        ui.scrollToSection("userTableSection")
    })
}



const displayGroupUsers  = function(groupID) {
}

const userGroupFeatureConfigure = async function( app ){

      app.userGroupManagement.groupRegister = new Map()

      app.userGroupManagement.fetchGroupData = function(){
         return new Promise((resolve, reject) => {
            app.fetchServerData('userGroups')
            .then( result => {
                    app.userGroupManagement.groupRegister.clear()
                    result.forEach(group => {
                        app.userGroupManagement.groupRegister.set(group.ID, group.name)
                    })
                    return resolve(result)
            })
         })
      }

      return app.userGroupManagement.fetchGroupData()
}

const addUserGroupFeature = function( clientApp ){

    userGroupFeatureConfigure( clientApp )

    .then( userGroupInfo => {

        clientApp.userGroupManagement.addFeature({
            label: 'createNewUserGroup', 
            description: 'creates a new user group', 
            method: createNewUserGroup
        })

        clientApp.userGroupManagement.addFeature({
            label: 'editUserGroup', 
            method:  editUserGroup
        })

        clientApp.userGroupManagement.addFeature({
            label: 'deleteUserGroup', 
            method: deleteUserGroup 
        })

        clientApp.userGroupManagement.addFeature({
            label: 'loadUserGroupMembers', 
            method: loadUserGroupMembers
        })

      return clientApp
    })

    .then( clientApp => {
      require('./newUserGroupForm').addFeature( clientApp )
      return clientApp
    })

    .then( clientApp =>{
      require('./mainPageUserGroupDisplay.js').addFeature( clientApp )
      return clientApp 
   })
}

module.exports = {
    addUserGroupFeature
}
