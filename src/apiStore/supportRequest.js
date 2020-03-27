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
const cors = require('cors')

const whiteList = ['https://dev.api.canada.ca', 'https://api.canada.ca']
let corsOptions = {
    origin: function(origin, callback) {
        if (whiteList.indexOf(origin) !== 1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
}
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
      return resolve( body )
    })
  })
}
const postJiraRequest = async function(req, res, next){
    let sanitize = function(fieldValue){
      let sanitized = fieldValue.replace(/[^a-zA-Z0-9(),/.@'\-?" ]/g, " ")
      sanitized = sanitized.replace(/"/g, "'")
      return sanitized
    }   
    let logMessage = {
      message: `jira support request ${queryManager.requestLogMessage(req)}`
    }
    accessLog.log('info', logMessage.message)
//creates a jira support ticket for the api store
    res.header("Content-Type", "application/json; charset=utf-8")
    let summary = sanitize(req.body.summary || "no summary")
    let description = sanitize(req.body.description || "no description")
    let user = sanitize(req.body.user || "no user name")
    let email = sanitize(req.body.email || "no email")

    supportRequest.createSupportRequest({
      summary, 
      description, 
      user, 
      email})
      
  .then(response => {
      let answerBody = JSON.parse(response.body)
      res.send( JSON.stringify({
          status: 'success', 
          issueID:answerBody.id, 
          key: answerBody.key, 
          link:answerBody.self
          }) )
  })
} 
const jiraInterface = function( app ){

  let auth = app.data.jiraAuthCredentials
  let _router = require('express').Router()
  _router.post('/support', cors(corsOptions), postJiraRequest)
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




