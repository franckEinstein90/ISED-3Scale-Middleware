"use strict"

const plans = (function(){
    return {
        Plan: class {
            constructor({type, id, state}){
		    this.type = type
		    this.id = id
            this.state = state
            this.features = []
            }
        }
    }
})()

module.exports = {
    plans
}

