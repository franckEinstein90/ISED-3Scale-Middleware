"use strict"
/***********************************************************/
const _ = require('underscore')
/***********************************************************/

const getTenantGroupMembers = function( app, tenantName, userStore, group ){
   let tenant     = app.tenants.register.get( tenantName )
   return group.memberProperties.includes('providerAccount')
          ? tenant.getProviderAccounts(userStore)
          : tenant.getUsers(userStore)
   .then( results => {
      return 'ok'
   })
}

const getGroupMembers = app => {

   return (req, res, next)=>{
        
      let groupID          = req.query.group
      let groupDefinition  = {
         ID: groupID
      }
      let userStore = new Map()

      return app.localDb.getAllTableRows({
         table: 'groups', 
         where: `[ID] = ${groupID}`
      })
      .then( queryResult => {
         groupDefinition.emailPattern = queryResult[0].emailPattern
         return app.localDb.getAllTableRows({
            table:  'lnkGroupsProperties', 
            where: `[group] = ${groupID}`
         })
      })
      .then(queryResult => {
         groupDefinition.memberProperties = queryResult.map(pr => pr.property)
         return app.localDb.getAllTableRows({
            table: 'lnkGroupsTenants', 
            where: `[group] = ${groupID}`
         })
      })
     .then( result => {   //list of tenants associated
         let tenantNames = _.intersection(
               result.map(t => t.tenant), 
               app.tenants.list.map(t => t.name))
         return Promise.all(tenantNames.map(
            tName => getTenantGroupMembers(app, tName, userStore, groupDefinition)
         )) 
      })
      .then( _ => {

         let resultArray = []
         let emailReg    = null 
         if( groupDefinition.emailPattern !== "" ){
            emailReg = new RegExp(groupDefinition.emailPattern)            
         }
         userStore.forEach((user, userEmail) => {
            if(emailReg) {
               if (emailReg.test(userEmail)) resultArray.push(user)
            } else {
               resultArray.push(user)
            } 
            
         })
         res.send(resultArray)
      })
   }
}

module.exports = {
   getGroupMembers
}
