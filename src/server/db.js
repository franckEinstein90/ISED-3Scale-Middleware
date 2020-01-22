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
        getGroupDefinitions: function() {
            return new Promise((resolve, reject) => {
                let SQLStatement = `SELECT ID, name FROM groups`
                db.all(SQLStatement, function(err, rows) {
                    if (err) {
                        reject(err)
                    } else {
                        return resolve(rows)
                    }
                })
            })
        },
        getGroupID: function(groupName) {
            return new Promise((resolve, reject) => {
                let SQLStatement = `SELECT ID FROM groups WHERE name='${groupName}'`
                db.get(SQLStatement, function(err, row) {
                    if (err) {
                        reject(err)
                    } else {
                        return resolve(row.ID)
                    }
                })
            })
        },

        setGroupTenants: function(groupID, tenants) {
            return new Promise((resolve, reject) => {
                let rows = tenants.map(tenant => `(${groupID}, '${tenant}')`).join(',')
                let SQLStatement = `INSERT INTO lnkGroupsTenants ('group', 'tenant') VALUES ${rows}`
                db.run(SQLStatement, function(err) {
                    if (err) {
                        reject(err)
                    } else {
                        return resolve(groupID)
                    }
                })
            })
        },
        getGroupTenants: function(groupID) {
            //returns the tenants associated with this group
            return new Promise((resolve, reject) => {
                let SQLStatement = `SELECT tenant FROM lnkGroupsTenants WHERE [group] = ${groupID};`
                db.all(SQLStatement, function(err, rows) {
                    if (err) {
                        reject(err)
                    } else {
                        return resolve({
                            groupID,
                            data: rows
                        })
                    }
                })
            })
        },
        setGroupProperties: function(groupID, groupProperties) {
            return new Promise((resolve, reject) => {
                let rows = groupProperties.map(property => `(${groupID}, '${property}')`).join(',')
                let SQLStatement = `INSERT INTO lnkGroupsProperties ('group', 'property') VALUES ${rows}`
                db.run(SQLStatement, function(err) {
                    if (err) {
                        reject(err)
                    } else {
                        return resolve(groupID)
                    }
                })
            })
        },

        getGroupUserProperties: function(groupID) {
            return new Promise((resolve, reject) => {
                let SQLStatement = `SELECT property FROM lnkGroupsProperties WHERE [group] = ${groupID};`
                db.all(SQLStatement, function(err, rows) {
                    if (err) {
                        reject(err)
                    } else {
                        return resolve({
                            groupID,
                            data: rows
                        })
                    }
                })
            })
        },


        deleteUserGroup: function(groupName) {
            return new Promise((resolve, reject) => {
                let SQLStatement = `DELETE FROM groups WHERE name = '${groupName}'`
                db.run(SQLStatement, function(err) {
                    if (err) {
                        reject(err)
                    } else {
                        return resolve('ok')
                    }
                })
            })
        },

        newUserGroup: function({
            groupName,
            groupDescription,
            groupEmailPattern
        }) {
            return new Promise((resolve, reject) => {
                let newRecordValues = `('${groupName}',  '${groupEmailPattern}', '${groupDescription}')`
                let SQLStatement = `INSERT INTO groups('name', 'emailPattern', 'description') VALUES ${newRecordValues}`
                db.run(SQLStatement, function(err) {
                    if (err) {
                        reject(err)
                    } else {
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