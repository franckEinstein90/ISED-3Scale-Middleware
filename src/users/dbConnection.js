"use strict"

const getCompleteGroupDefinition = function(id, _db) {

    let groupDefiniton = null 
    return _db.getAllTableRows({
        table: 'groups', 
        where: `ID = ${id}`})

    .then( result => {
        if( Array.isArray( result ) && result.length > 0 ){
           return result[0]
        }
    })

    .then( group => {
        groupDefiniton = group
        return _db.getAllTableRows({
            table: 'lnkGroupsProperties', 
            where: `[group]=${id}`
        })
    })

    .then( groupProperties =>{
        groupDefiniton.properties = groupProperties.map( rec => rec.property ) 
        return _db.getAllTableRows({
            table: 'lnkGroupsTenants', 
            where: `[group]=${id}`
        })
    }) 

    .then( groupTenants =>{
        groupDefiniton.tenants = groupTenants.map( rec => rec.tenant)
        return groupDefiniton
    })
}

const getGroupDefinitions = function( _db ){
       
    return new Promise((resolve, reject) => { //gets the groups definitions and properties from database
        _db.getAllTableRows({
            table: 'groups', 
            where: null
        })
        .then( groupData => {
           return resolve( groupData ) 
        })
    })
}

module.exports = {
   getCompleteGroupDefinition,
   getGroupDefinitions
}