"use strict"

class UserType {

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
        this.properties     = []
        this.tenants        = []
    }
  
}

module.exports = {
    UserGroup
}