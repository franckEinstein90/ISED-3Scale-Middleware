"use strict"

const dataTables = function( app ){

    return {

        newTable : function(htmlID){
            
        }

    }
}


const addDataTableFeature = function( app ){
    app.dataTables = dataTables(app)
}
module.exports = {
    addDataTableFeature
}