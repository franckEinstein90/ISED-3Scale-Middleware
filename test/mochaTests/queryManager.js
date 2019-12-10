/***************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 ***************************************/

const validate = require('../routes/queryManager').query.validate
const expect = require('chai').expect

describe('validate function', function() {
    it('validates a query', function() {
        let returnObj = validate(
                {
                    query:{
                        email: 'fdas@gmail.com',
                        lang: 'fr'
                    }
                })
        expect(returnObj).to.exist
        expect('userEmail' in returnObj).to.be.true
        expect(returnObj.userEmail).to.eql('fdas@gmail.com')
        expect('language' in returnObj).to.be.true
    })

    it('blocks invalid emails', function() {
        let returnObj = validate(
                {
                    query:{
                        email: 'notValid.com',
                        lang: 'fr'
                    }
                })
        expect(returnObj).to.exist
        expect(returnObj.userEmail).to.be.null
        expect(returnObj.language).to.eql('fr')
    })

    it('only accepts fr or en as language parameters', function() {
        let returnObj = validate(
                {
                    query:{
                        email: 'iam@Valid.com',
                        lang: 'es'
                    }
                })
        expect(returnObj).to.exist
        expect(returnObj.userEmail).to.eql('iam@Valid.com')
        expect(returnObj.language).to.be.null
    })

    it('always returns an object', function() {
        let returnObj = validate(
                {
                    query:{
                    }
                })
        expect(returnObj).to.exist
        expect('userEmail' in returnObj).to.be.true
        expect(returnObj.userEmail).to.be.null
        expect('language' in returnObj).to.be.true
        expect(returnObj.language).to.be.null
    })


    
})
