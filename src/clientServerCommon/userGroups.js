"use strict"

class UserGroup {
    constructor({
        id, 
        name, 
        description, 
        emailPattern
    }){
        this.id             = id
        this.name           = name
        this.description    = description
        this.emailPattern   = emailPattern
        this.tenants        = []
    }

    addTenantAssociation(tenantName){
        this.tenants.push(tenantName)
    }
}

module.exports = {
    UserGroup
}