/*************************************************************************
 * Client side, trigger user actions
 * 
 *************************************************************************/

"use strict"

const userActions = (function() {

    let actions = [{
        action: 'enforceOTP',
        route: 'enforceOTP'
    }]
    return {
        update: function(userEmailList, actionList) {
            //giving a liste of user addresses
            //enact actions of those users
            let actions = ['enforceOTP']
            let inputData = {
                users: userEmailList
            }
            $.post('/enforceOTP', inputData, function(data) {

            })
        }
    }
})()

module.exports = {
    userActions
}