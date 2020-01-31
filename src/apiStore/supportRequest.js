/*******************************************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * -------------------------------------
 *  helpRequests.js
 *  creates new support tickets in Jira
 ******************************************************************************/
"use strict"

 /*****************************************************************************/
const  request = require('request')
 /*****************************************************************************/

const options = {
  method: 'POST',
  'url': 'https://jira.ised-isde.canada.ca/rest/api/2/issue',
  headers: {
     'Accept': 'application/json',
     'Content-Type':'application/json'
  }
}

const jiraInterface = (function(){

  let auth = {
    username: null, 
    password: null
  }
  return {

    configure: function({username, password}){
      auth.username = username
      auth.password = password
    },

    createSupportRequest: function({
        summary, 
        description, 
        user, 
        email
      }){

      let body =`{
        "update":{},

        "fields":{
     
         "project":{
            "key":"GCAPIOPS",
            "id":"11201"
          },
          "issuetype":{
              "name":"Task" 
          }, 
          "summary": "${summary}", 
          "description": "From user ${user} (${email}): ${description}"
        }
      }`
      options.auth = auth
      options.body = body
      return new Promise((resolve, reject)=> {
        request(options, function (error, response, body) {
          if (error) {
            console.log('error on jira task support request')
            throw new Error(error)
          }
          return resolve( response )
        })
      })
    }
  }

})()

module.exports = {
  jiraInterface
}




