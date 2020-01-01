/*******************************************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * -------------------------------------
 *  viewSystem.js
 *
 *  sets up the handlebar view system
 ******************************************************************************/
"use strict"

const hbs = require('express-handlebars')

const viewSystem = function(){

  return{

    configure: function({app, root}){

      app.engine('hbs', hbs({
        extname: 'hbs', 
        defaultLayout: 'main', 
        layoutsDir: root + '/views/layouts/', 
        partialsDir: root + '/views/partials/'
      }))
      app.set('view engine', 'hbs');

    }
  }
}()

module.exports = {
  viewSystem
}

