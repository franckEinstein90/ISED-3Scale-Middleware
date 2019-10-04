const utils = require('./dataInput').utils




try{
  let data = utils.readServerDataFile()
  data.master.tenants.forEach(
    tenant => console.log(tenant)
  )     
    } catch(err){
        console.log("error")
    }


