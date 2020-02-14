/*******************************************************************************
 * Franck Binard, ISED (FranckEinstein90)
 *
 * APICan application - 2020
 * -------------------------------------
 *  Canadian Gov. API Store middleware - client side
 *
 *  errors.js: error handling 
 *
 ******************************************************************************/
"use strict"
/******************************************************************************/


const showError =  clientApp => {
    return err => clientApp.ui.showModal({
        title: "ERROR", 
        content: err
    })
}

const addErrorHandling = function( clientApp ){

    clientApp.features.errorHandling = true
    clientApp.handleError = showError(clientApp)
    
    
}
module.exports = {
    addErrorHandling
}
