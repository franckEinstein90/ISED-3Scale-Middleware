/*******************************************************************************
 * Franck Binard, ISED (FranckEinstein90)
 *
 * APICan application - 2020
 * -------------------------------------
 *  Canadian Gov. API Store middleware - client side
 *
 *  main.js: entry point 
 *
 ******************************************************************************/
"use strict"
 /*****************************************************************************/

const fetchServerData = serverRoute => {
    return new Promise((resolve, reject) => {
        $.get(`/${serverRoute}`, function(data) {
            return resolve(data)
        })
        .fail( err => {
           return reject(err) 
        })
    })
}

const addServerComFeature =  clientApp =>{
    clientApp.addFeature({label:'fetchServerData', method: fetchServerData})
}


module.exports = {
    addServerComFeature
}

