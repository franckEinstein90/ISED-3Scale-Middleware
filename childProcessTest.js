
const http = require('http')
const {fork} = require('child_process')

const server = http.createServer()
server.listen(3000)



const fetchUpdateAPI = fork('fetchUpdate.js')

fetchUpdateAPI.send('start')
fetchUpdateAPI.on('message', sum => {
	console.log(`sum is ${sum}`)
	})




