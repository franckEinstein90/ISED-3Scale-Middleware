require ('module-alias/register')

const expect = require('chai').expect
const utils = require('@src/utils').utils
const appVariables = require('@server/appStatus').appVariables
const users = require('@users/users').users
const appJsonInfo = utils.readConfigFile('master').master
appVariables.env = appJsonInfo.env

users.onReady()

describe('....', function(){
	it('i...' , function(){
        let keyAuth = users.getKeyCloakCredentials(
        .then(x => users.getUserList(x.access_token))
        .catch(x => console.log(x))
	})
})
