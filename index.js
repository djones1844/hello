// Dependencies
const http = require('http')
const url = require('url')
const StringDecoder = require('string_decoder').StringDecoder


const httpServer = http.createServer((req, res) => {

  // get url and parse it
  let parseUrl = url.parse(req.url, true)

  // get the path 
  let path = parseUrl.pathname
  let trimmedPath = path.replace(/^\/+|\/+$/g, '')

  // Get the query string as an object
  let queryStringObject = parseUrl.query

  // get the HTTP Method
  let method = req.method.toLowerCase()

  // get the headers as an object   
  let headers = req.headers 
 
  // Get Payload, if any
  let decoder = new StringDecoder('utf-8')
  let buffer = ''
  req.on('data', (data) => buffer += decoder.write(data))
  req.on('end', () => {
    buffer += decoder.end()
    
    // chose the correct router handler, if one not found use the notFound handler
    let chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound

    // construct the data object to send to the handler
    let data = {
      'trimmedPath' : trimmedPath,
      'queryStringObject' : queryStringObject,
      'method' : method,
      'headers' : headers,
      'payload' : buffer
    }

    // routh the request specivied in the router
    chosenHandler(data, (statusCode, payload) => {      
      // Use the status code called back by the handler, or default to 200
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200
     
      // used the payload calld by the handler or default to 
      payload = typeof(payload) == 'object' ? payload : {}

      // Covert payload to string
      let payloadstring = JSON.stringify(payload)

      // return the response
      // specify payload/buffer as json
      res.setHeader('Content-Type', 'application/json')
      res.writeHead(statusCode)
      res.end(payloadstring)
       // log the request path
       console.log('Returning this response: ', statusCode, payloadstring)

    })    
  })
})

httpServer.listen(8085, () => console.log('The server is listening on port: '+8085))

// handelers and routing

let handlers =  {}

  // hello handler
  handlers.hello = (data, callback) => {
      callback(200, {'name': 'Hello World'})
  }

  // Ping handler
  handlers.ping = (data, callback) => {
    callback(200)    
  }
  
  // not found handler
  handlers.notFound = (data, callback) => {
    callback(404)
  } 


let router = {
    'ping' : handlers.ping,
    'hello': handlers.hello
  }

