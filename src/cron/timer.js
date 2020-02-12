/*******************************************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * Application APICan
 * -------------------------------------
 *  timer.js : handle recurring events set to run every x minutes 
 *
 ******************************************************************************/

"use strict"

/******************************************************************************/
const uuidv4  = require('uuid/v4')
const cronJob = require('node-cron')
const moment  = require('moment')
/******************************************************************************/

const clock = (function(){

  let _clockRegister = [] 
  let _appTime    = 0     //mins
  let _cout       = null
  let _timeStr    = minTime => `${minTime} minute${minTime === 1 ? '' : 's'}`
  let _update     = () => {
      _appTime += 1
      _clockRegister.forEach(cl => {
          if (cl.isOn) cl.update( _appTime )
      })
  }
  cronJob.schedule('* * * * *', _update)

  return {
      Clock : function({
          cout, 
          events
      }){
          this.clockTime = 0
          this.id     = uuidv4()
          this.cout   = cout
          this.isOn   = false 
          this.events = events || []
          _clockRegister.push(this)
      }
  }
})()

clock.Clock.prototype.start = function(){
  this.cout(`Clock ${this.id} starting with ${this.events.length} events`)
  this.isOn = true
}

clock.Clock.prototype.update = function( appTime ){
  this.clockTime += 1
  this.cout( `app has been running for ${this.clockTime} min(s)`)
}

clock.Clock.prototype.addEvent = function( event ){
}

module.exports = {
  clock
}