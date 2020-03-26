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

let jiraRequestBody = (user, summary, email, description)=>{
  return `{
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
  }

const makeJiraRequest = options => {
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

const jiraInterface = function( app ){

  let auth = app.data.jiraAuthCredentials

  return {

    createSupportRequest: function({
        summary, 
        description, 
        user, 
        email
      }){
        let options = {
          auth, 
          body : jiraRequestBody(user, summary, email, description) 
        }
        return makeJiraRequest(options)    
    }
  }
}



const addSupportRequestInterface = function( app ){
    return new Promise((resolve, reject)=>{
        let usm = jiraInterface(app)
        .then(app => {
          app.supportRequests = usm
          return resolve(app)
        })
   })
}

module.exports = {
  addSupportRequestInterface,
  jiraInterface
}




