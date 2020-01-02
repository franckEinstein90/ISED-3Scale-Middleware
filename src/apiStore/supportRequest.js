/*******************************************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * -------------------------------------
 *  helpRequests.js
 *  creates new support tickets in Jira
 ******************************************************************************/
"use strict"

const  request = require('request')

var options = {
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

    createSupportRequest: function( {summary} ){

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
          "summary": "${summary}" 
        },
     "description":{
         "type":"doc", 
         "version":1, 
         "content":[
           {
             "type": "paragraph",
             "content":[
               {
                 "text": "orjer", 
                 "type": "text"
               }
             ]
           }]
         }
       }`
      options.auth = auth
      options.body = body
      request(options, function (error, response, body) {

        if (error) throw new Error(error)
        let data = JSON.parse(body) 
        console.log(
          'Response: ' + response.statusCode + ' ' + response.statusMessage
        )
        console.log(body);
      })
    }
  }

})()

module.exports = {
  jiraInterface
}




