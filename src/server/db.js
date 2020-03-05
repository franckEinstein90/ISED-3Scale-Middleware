/*******************************************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * -------------------------------------
 *  db.js
 *
 *  database setup
 ******************************************************************************/
"use strict"

/*****************************************************************************/
const sqlite3 = require('sqlite3').verbose();
/*****************************************************************************/

const localDatabase = function( dbObject ){
    let _db = dbObject

    return {
        getAllTableRows: function({
            table, 
            where
        }){
            let whereStatement = ''
            if( where ) whereStatement = ` WHERE ${where}`

            return new Promise((resolve, reject) => {

                let SQLStatement = `SELECT * FROM ${table} ${whereStatement};`
                _db.all(SQLStatement, (err, rows)=>{
                    if(err){
                        return reject( err )
                    } else {
                        return resolve( rows ) 
                    }
                })
            })
        }, 

        insertInTable: function({ 
        table, 
        values
    }){
        let fields = []
        let fieldValues = []
        let valArray = Object.entries(values)
        valArray.forEach(field => {
            fields.push( `'${field[0]}'` )
            fieldValues.push( `'${field[1]}'` )
        })
        return new Promise((resolve, reject) => {
            let SQLStatement =  `INSERT INTO ${table} (${fields.join(',')}) VALUES (${fieldValues.join(',')});` 
            db.run(SQLStatement, function( err ){
                if( err ){
                    return reject(err)
                } else {
                    return resolve( this.lastID )
                }
            })
        })
        } 
    }
}

const appDatabaseFeature = function( app ) {
    
    return new Promise((resolve, reject) => {
        let _db = new sqlite3.Database( app.settingsDB, err => {
            if (err) { 
                return reject( err )
            } else { 
                app.localDatabase = localDatabase(_db)
                return resolve( localDatabase(_db) )
            }
        })
    })
}


const addLocalDatabaseFeature = function( app ){
    return appDatabaseFeature( app ) 
    .then (localDb => {
        app.localDb = localDb
        app.addFeature({
            label: 'localDB', 
            state: 'implemented'
        })
        return app
    })
}
module.exports = {
    addLocalDatabaseFeature
}
