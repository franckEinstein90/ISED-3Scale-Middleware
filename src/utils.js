"use strict"; 
const fs = require('fs')
const path = require('path')

const utils = (function(){

  return {

    readServerDataFile: function(){
    try{
      let filePath, rawData;
	    filePath = path.relative("", './data/serverData.json')
      rawData = fs.readFileSync(filePath, {encoding: 'utf-8'})
      return JSON.parse(rawData)
    } catch(err){
      	console.log(err)
      	throw(err)
      }
    }
  }

})()

module.exports = {
  utils
}


