"use strict"

const setGroupProperty = (groupID, db, groupProperties)=>{

   if(groupID === null){
      return db.insertInTable({
         table: 'groups', 
         values: groupProperties 
      })
   }
   return db.removeFromTable({
      table: 'lnkGroupsProperties', 
      where: `[group] = ${groupID}` 
   })
   .then( queryResult => {
      return db.removeFromTable({
         table: 'lnkGroupsTenants', 
         where: `[group] = ${groupID}`
      })
   })
   .then( queryResult => {
      return db.updateTable({
         table: 'groups', 
         values: `Description = '${groupProperties.Description}', emailPattern = '${groupProperties.emailPattern}', name = '${groupProperties.name}' `, 
         where: `[ID] = ${groupID}`
      })
   })
   .then( _ => groupID)
}

let tenantAssociation = (groupID, db, tenant) => {
   return db.insertInTable({
           table: 'lnkGroupsTenants', 
           values: {
               group: groupID, 
               tenant
           }
      })
   }

let userPropertyAssociation = (groupID, db, userProperty) => {
   return db.insertInTable({
      table: 'lnkGroupsProperties', 
      values: {
         group: groupID, 
         property: userProperty
      }
   })
}

let getArrayArguments =  (arrayName, req) => {
   let resultArray = [] 
   let arrayDesignator = `${arrayName}[]`
   if(arrayDesignator in req.body){
      resultArray =  Array.isArray(req.body[arrayDesignator]) 
                        ? req.body[arrayDesignator]
                        : [req.body[arrayDesignator]]
   }
   return resultArray
}




const createOrEditGroup = app => {
     
      return (req, res, next) => {

         let groupProperties =  {
            Description: req.body.Description, 
            emailPattern: req.body.emailPattern, 
            name: req.body.name  
         }
         let groupID = req.body.groupID || null 
         return setGroupProperty(groupID, app.localDb, groupProperties)
         .then(  newGroupId => {
            groupID = newGroupId
            let selectedTenants = getArrayArguments('selectedTenants', req)
            return Promise.all(selectedTenants.map( 
               tenant => tenantAssociation(newGroupId, app.localDb, tenant)))
         })
         .then( _ => {
            let groupUsers = getArrayArguments('groupUsers', req)
            return Promise.all(groupUsers.map(
               userProperty=> userPropertyAssociation(groupID, app.localDb, userProperty)))
            })
         .then( _ => {
            res.send({
               error: false,
               message: 'New group has been created' 
            }) 
         })
         .catch( err => {
            if('message' in err) res.send({
               error: true, 
               msg: err.message
            })
         })
      }
   }
 

  module.exports = {
     createOrEditGroup
  }
