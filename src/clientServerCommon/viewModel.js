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

const viewModel = function( app ){

    let primaryKey = 'primary' 
    let foreignKey = entity => `foreign(${entity})`
    let property   = 'property'
       
    
    return {

        groups : {
            route       : '/userGroups' , 
            ID          : primaryKey, 
            name        : property, 
            Description : property, 
            emailPattern: property  
        }, 

        groupProperties: {
            name        : primaryKey
        }, 

        lnkGroupsProperties: {
            group       : foreignKey('groups'), 
            property    : foreignKey('groupProperties')
        }, 

        tenants : {
            tenantCode : primaryKey
        }, 

        lnkGroupsTenants : {
            group   : foreignKey('groups'), 
            tenant  : foreignKey('tenants')
        },

        actions : {
            label       : primaryKey, 
            description : property 
        },  

        groupActionEvents : {
            frequency   : property, 
            group       : foreignKey('groups'), 
            action      : foreignKey('actions') 
        }
    }
}


const addComponent = function( app ){
    app.addComponent({
            label: 'dataModel', 
            methods: viewModel(app)
    })
}

module.exports = {
    addComponent
}
