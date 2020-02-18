"use strict"


const userGroupFeature = (function(){

    let _dataTableHandle = null
    let _groups          = new Map() 

    return {

        configure   : function(){
            _dataTableHandle = $('#userFormGroupList').DataTable()
        }, 

        addGroup : function({groupName, groupID}){
            _groups.set(groupID, groupName)
        },

        displayGroups: _ => {
            $('#userFormGroupList tbody').empty()
            _groups.forEach(groupName =>{
                userGroupFeature.userGroupRow( groupName )
            })
        },  

        userGroupRow : function(groupName, groupID) { //displays the group
            $('#userFormGroupList tbody').append(         //as a line in #userFormGroupList
                [`<tr>`,
                    `<td class="w3-text-green">${groupName}</td>`,
                    `<td><i class="fa fa-eye w3-large w3-text-black groupCmd"></i></td>`, 
                    `<td><i class="fa fa-gears  w3-large w3-text-black groupCmd"></i></td>`, 
                    `<td><i class="fa fa-trash w3-large w3-text-black groupCmd"></i></td>`, 
                    `</tr>`
                ].join(''))
        }
    }
})()

const addUserGroupFeature = async function( clientApp ){
    return new Promise((resolve, reject) => {
        userGroupFeature.configure()  
        clientApp.server.fetchData('Groups')
        .then( result => {
            result.forEach(group => userGroupFeature.addGroup({
                groupName: group.name, 
                groupID: group.ID
            }))
            return 1
        })
        .then( _ => userGroupFeature.displayGroups())
        .then( _ => {
                clientApp.features.add({
                    featureName: 'userGroups', 
                    onOff   : true
                })
                return resolve(clientApp)
        })
    })
}

module.exports = {
    addUserGroupFeature
}