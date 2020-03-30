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
    return new Promise((resolve, reject)=> {
        $.post('/userGroups', groupDefinition)
        .done( postOpResult => {
            return resolve(postOpResult)
        })
        .fail(err  => {
          return resolve(err)
        })
    })
}

const editUserGroup = function( groupDefinition ){
    return new Promise((resolve, reject) => {
        $.post('/userGroups', groupDefinition)
        .done( editGroupRequestAnswer => {
            return resolve( editGroupRequestAnswer ) 
        })
        .fail(err  =>{
            return resolve( err ) 
        })
    })
}

const deleteUserGroup = function( id ){
    $.ajax({
        method: "DELETE",
        url: '/userGroups',
        data: {
           id 
        }
    })
    .done(function(msg) {
        location.reload(true)
    })
    .fail(x => {
        alert('failed')
    })  
}

const loadUserGroupMembers = function( app, groupID ){
//    document.getElementById('userGroupsModal').style.display = 'none'
    app.ui.setLoading()
    let group = { 
        group: groupID 
    }
    $.get('/userGroups/users', group, function(data) {
        app.ui.setInactive() 
        app.ui.userDisplayUI.empty()
        data.forEach( member => {
            app.ui.userDisplayUI.addRow(member)
        })
       // keyCloakUsers.showUsers(data)
        app.ui.scrollToSection("userTableSection")
    })
}

const userGroupFeatureConfigure = async function( app ){

    app.userGroupManagement.groupRegister = new Map()

    app.userGroupManagement.getGroupDefinition = function(groupID){
        return new Promise((resolve, reject) => {
            $.ajax({
                method: "GET",
                url: '/userGroups',
                data: {
                    id:groupID 
                }
            })
            .done(function( data ) {
                return resolve(data)
            })
            .fail( err => {
               return reject(err) 
            })  
        })
    }

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
            description: "loads the users that fit the group's definition" , 
            method: groupID => loadUserGroupMembers(clientApp, groupID)
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
