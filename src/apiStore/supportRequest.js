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

const makeJiraRequest = _ => {
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
  let _router = require('express').Router()
  return {
    router  : _router,

    createSupportRequest: function({
        summary, 
        description, 
        user, 
        email
      }){
        options.auth = auth
        options.body = jiraRequestBody(user, summary, email, description) 
        return makeJiraRequest( )    
    }
  }
}



const addSupportRequestInterface = function( app ){
    return new Promise((resolve, reject)=>{
        let usm = jiraInterface(app)
        app.supportRequests = usm
        return resolve(app)
   })
}

module.exports = {
  addSupportRequestInterface,
  jiraInterface
}




