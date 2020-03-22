"use strict" 


const testFunction = ((req, res) => {
   debugger
})
const getTenantAccounts = app =>{
   return ((req, res, next)=>{
      let tenantName = req.query.tenantName
      return app.tenants.register.get( tenantName ).getAccounts()
      .then(x => {
         res.send(x)
      })
   })
}
const addTenantRouterFeature = function(app){

   return new Promise((resolve, reject)=>{
      app.tenants.router = require('express').Router()
      app.tenants.router.get('/', testFunction)
      app.tenants.router.get('/accounts', getTenantAccounts(app))
      return resolve(app)
   })
}

module.exports = {
   addTenantRouterFeature
}