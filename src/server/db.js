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

const appDatabase = (function() {

    let db = null

    return {
        configure: function({
            filePath
        }) {
            return new Promise((resolve, reject) => {
                db = new sqlite3.Database(filePath, (err) => {
                    if (err) {
                        reject(err)
                    } else {
                        return resolve(1)

                    }
                })
            })
        },

        setTenants: function(tenantNames) {

            db.each("SELECT tenantCode FROM tenants",
                function(err, row) {
                    let nameIDX = tenantNames.findIndex(t => t === row.tenantCode)
                    if (nameIDX > -1) {
                        tenantNames.splice(nameIDX, 1)
                    }
                },
                function(err, row) {
                    if (tenantNames.length > 0) {
                        let placeholders = tenantNames.map(tName => `(?)`).join(',')
                        db.run(`INSERT INTO tenants('tenantCode') VALUES${placeholders}`, tenantNames, function(err) {
                            if (err) {
                                debugger
                            }
                        })
                    }
                })
        }, 

        getGroupID: function( groupName ){
            debugger
            return new Promise((resolve, reject) => {
                
            })
        }, 
        
        newUserGroup: function( groupName ){
            return new Promise((resolve, reject)=>{
                db.run(`INSERT INTO groups('name') VALUES(?)`, [groupName], function(err) {
                    if (err) {
                        reject(err)
                    }else{
                        return resolve('ok')
                    }
                }) 
            })
        }

    }
})()



module.exports = {
    appDatabase
}