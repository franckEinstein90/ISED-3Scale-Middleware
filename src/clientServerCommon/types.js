/***********************************************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * -------------------------------------
 *  Module type 
 **********************************************************************************/
"use strict"
 /**********************************************************************************/
const uuidv4 = require('uuid/v4')

const signatureFromArray    = (context, descriptor) => 'not implementd'
const signatureFromFunction = (context, descriptor) => 'not implmeneted'
    
const signatureFromDescriptor : function(context, typeDescriptor){
    if  ( Array.isArray( typeDescription ) )    return signatureFromArray(context, typeDescriptor)
    if  (typeof typeDescriptor === 'function')  return signatureFromArray(context, typeDescriptor)
    throw('not implemneted type description method')
}
 
const types = (function(){


    isSameSignature = (sLeft, sRight) => typeSignatures.compare(sLeft, sRight) === typeSignatures.relation.same

    return{

        categories: {
            Atomic  : "Atomic Type", 
            Arrow   : "Arrow Type", 
            Abstract: "Abstract Type" 
        },  

        relations: {
            same:0,
            different:1
        },

        signature : (context, descriptor) => signatureFromDescriptor(context, descriptor)
   }

})()

const Type = function({
    typeSignature, 
    label }) {

    this.id             = uuidv4()
    this.typeSignature  = typeSignature
}

 module.exports = {
    types, 
    Type
 }
