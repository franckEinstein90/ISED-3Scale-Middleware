"use strict"

const features = (function() {
    return {
        Feature: class {
            constructor({
                id,
                scope,
                system_name,
                visible
            }) {
                this.id = id
                this.scope = scope
                this.system_name = system_name
                this.visible = visible
            }
        }
    }
})()

module.exports = {
    features
}