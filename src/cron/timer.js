/*******************************************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * Application APICan
 * -------------------------------------
 *  timer.js : handle recurring events set to run every x minutes 
 *
 ******************************************************************************/
"use strict"


const uuidv4 = require('uuid/v4')
const cronJob = require('node-cron')



const scheduler = (function(){

    let runningTimeMinutes = 0
    let events = []
  
    return {
  
      start : function(){ 
        cronJob.schedule('* * * * *', scheduler.cronUpdate)
      }, 
  
      newEvent : function({
        frequency, //minutes
        callback
      }){
          let ev ={
            id: uuidv4(), 
            frequency, 
            lastRefresh: 0, 
            callback
          }
 
          events.push(ev)
          return ev.id
      },

      runningTime: function() {
            return runningTimeMinutes
      },

      nextRefresh: function(eventID){
            let ev = events.find( ev => ev.id === eventID)
            return ev.frequency - ev.lastRefresh
      }, 

      cronUpdate: function(){
        runningTimeMinutes += 1
        console.log(`Running time: ${runningTimeMinutes} (min)`)
  
        events.forEach(event => {
          event.lastRefresh += 1
          if( event.lastRefresh >=  event.frequency ){
            event.lastRefresh = 0
            return event.callback()
          } 
        })
      }
  
  
    }
  })()
  
module.exports = {
   scheduler 
}
