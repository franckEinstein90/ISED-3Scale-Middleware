/*******************************************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * -------------------------------------
 *
 * User Group Structure 
 ******************************************************************************/
"use strict"
/*****************************************************************************/


const displayGroupUsers  = function(groupID) {
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
      return clientApp
   })
   .then( clientApp => {
      require('./newUserGroupForm').addFeature( clientApp )
      return clientApp
   })
   /*.then( clientApp =>{
      require('./mainPageUserGroupDisplay.js').addFeature( clientApp )
      return clientApp 
   })
 */
}

module.exports = {
    addUserGroupFeature
}
