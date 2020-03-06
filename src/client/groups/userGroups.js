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

      let _groups = new Map()

      let _fetchGroupData = function(){
         return new Promise((resolve, reject) => {
            app.fetchServerData('Groups')
            .then( result => {

                    _groups.clear()
                    result.forEach(group => {
                        _groups.set(group.ID, group.name)
                    })
                    return resolve(result)
            })
         })
      }

      return _fetchGroupData( )
       .then (_ =>{
         return {

            get groups() {
               let groupList = []
               _groups.forEach((name, id) => groupList.push({id, name}))
               return groupList
            }
       
         }
      })
}

const addUserGroupFeature = function( clientApp ){

   userGroupFeatureConfigure( clientApp )
   .then( userGroupFeature => {
      clientApp.addFeature({label: 'userGroups', implemented: true})
      Object.defineProperty( clientApp, 'groups',  {get: function(){return userGroupFeature.groups}})
      clientApp.ui.groupTenantSelectionTable = group => {
         return [
            '<table>', 
            '<tr><td>hello</td></tr>', 
            '</table>'].join('')
      }
      return clientApp
   })
   .then( clientApp => {
      return require('./newUserGroupForm').addFeature( clientApp )
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
