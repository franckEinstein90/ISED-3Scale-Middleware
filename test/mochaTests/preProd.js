require ('module-alias/register')

const alwaysResolve = require('@utils/alwaysResolve').alwaysResolve
const expect = require('chai').expect
const validator = require('validator')




describe('basic use case', function(done) {
   it('...', function(){
        //test echo service from postman
        let apiCall = "https://three-scale-midware-test-3scale-integration.apps.dev.openshift.ised-isde.canada.ca/userinfo.json?email=rojabadd%2Btest2@gmail.com&lang=en"

        alwaysResolve(apiCall, {
          good: x => JSON.parse(x),
          bad: x => 'notOk'
        })
        .then(answer => {
           console.log(answer) 
        }).finally(done)
    })
})
