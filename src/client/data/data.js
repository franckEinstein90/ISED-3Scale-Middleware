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

const getData = serverRoute => {
    return new Promise((resolve, reject) => {
        $.get(`/${serverRoute}`, function(data) {
            resolve(data)
        })
        .fail( err => {
           reject(err) 
        })
    })
}

const fetchServerData = function(clientApp){
    return serverRoute => getData( serverRoute )
}

const addServerComFeature =  clientApp =>{

    clientApp.server.fetchData = fetchServerData(clientApp)

}


module.exports = {
    addServerComFeature
}

