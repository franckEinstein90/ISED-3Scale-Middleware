/*******************************************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * -------------------------------------
 *  app.js
 *
 *  database setup
 ******************************************************************************/
"use strict"
const sqlite3 = require('sqlite3').verbose();

const appDatabase = (function(){

    let db = null
    return {
        configure: function(){
            db = new sqlite3.Database('./settings.db', sqlite3.OPEN_READCREATE, (err) => {
                if(err){
                    debugger
                }
            })
/*
            db.serialize(function(){
                
                db.run("CREATE TABLE tblUserGroups (groupName TEXT PRIMARY KEY)", (err) => {
                    if(err){
                        if(err.errno === 1){
                            //table already exists - that's ok
                            debugger
                        }
                    } else{
                        debugger
                    }
                })
            })*/
        }, 

        setTenants: function( tenantNames ){

            db.each("SELECT tenantCode FROM tenants", 
                function(err, row) {
                    let nameIDX = tenantNames.findIndex(t => t === row.tenantCode)
                    if( nameIDX > -1){ 
                        tenantNames.splice(nameIDX, 1)
                    }
                }, 
                function(err, row){
                    if(tenantNames.length > 0){
                        let placeholders = tenantNames.map(tName => `(?)`).join(',')
                        db.run(`INSERT INTO tenants('tenantCode') VALUES${placeholders}`, tenantNames, function(err){
                            if (err){
                                debugger
                            }
                        })
                    }
            })
        }
    }
})()



module.exports = {
    appDatabase
}