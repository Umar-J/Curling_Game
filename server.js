/*
COMP 2406 Server Base
(c) Louis D. Nel 2018

Name: Umar Jan
ID  : 101270578

Use browser to view pages at http://localhost:3000/curling.html
*/

//Server Code
const server = require('http').createServer(handler)
const io = require('socket.io')(server) //wrap server app in socket io capability
const fs = require('fs') //file system to server static files
const url = require('url'); //to parse url strings
const PORT = process.env.PORT || 3000 //useful if you want to specify port through environment variable

const ROOT_DIR = "html" //dir to serve static files from

const MIME_TYPES = {
  css: "text/css",
  gif: "image/gif",
  htm: "text/html",
  html: "text/html",
  ico: "image/x-icon",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  js: "text/javascript", //should really be application/javascript
  json: "application/json",
  png: "image/png",
  svg: "image/svg+xml",
  txt: "text/plain"
}

function get_mime(filename) {
  //Get MIME type based on extension of requested file name
  //e.g. index.html --> text/html
  for (let ext in MIME_TYPES) {
    if (filename.indexOf(ext, filename.length - ext.length) !== -1) {
      return MIME_TYPES[ext]
    }
  }
  return MIME_TYPES["txt"]
}

server.listen(PORT) //start http server listening on PORT


// stone information
let setOfStones = null;
let turn = null;
let shots = 8;

// clinet information
let homePlayerExists = false;
let visitorPlayerExists = false;


// Handling server requests and responses
function handler(request, response) {
  //handler for http server requests
  let urlObj = url.parse(request.url, true, false)
  console.log('\n============================')
  console.log("PATHNAME: " + urlObj.pathname)
  console.log("REQUEST: " + ROOT_DIR + urlObj.pathname)
  console.log("METHOD: " + request.method)

  let filePath = ROOT_DIR + urlObj.pathname
  if (urlObj.pathname === '/') filePath = ROOT_DIR + '/index.html'

  fs.readFile(filePath, function(err, data) {
    if (err) {
      //report error to console
      console.log('ERROR: ' + JSON.stringify(err))
      //respond with not found 404 to client
      response.writeHead(404);
      response.end(JSON.stringify(err))
      return
    }
    response.writeHead(200, {
      'Content-Type': get_mime(filePath)
    })
    response.end(data)
  })

}

//Socket Server
io.on('connection', function(socket) {

  // send info when client conectes
  let connectionInformation = {}
  connectionInformation.home = homePlayerExists
  connectionInformation.visitor = visitorPlayerExists
  connectionInformation.allStones = setOfStones
  connectionInformation.turn = turn;
  connectionInformation.shotsLeft = shots;
  let content = JSON.stringify(connectionInformation)
  io.emit('connected', content)

  socket.on('playerChosen', function(role) {

    dataObj = JSON.parse(role)
    data = dataObj.role

    let fullLock = false;

    if (data === "visitor") {
      visitorPlayerExists = true;
    } else if (data === "home") {
      homePlayerExists = true;
    }

    if (homePlayerExists == true && visitorPlayerExists == true) {
      fullLock = true;
    }

    io.emit('fullLock', role, fullLock)

  })

  socket.on('newCue', function(data) {

    socket.broadcast.emit('setCue', data)

  })

  socket.on('aiming', function(data) {

    socket.broadcast.emit('watchCue', data)

  })

  socket.on('nCue', function() {

    socket.broadcast.emit('deleteCue', data)

  })


  socket.on('getInfo', function() {

    if (setOfStones !== null) {

      let data = {}
      data.allStones = setOfStones
      data.turn = turn
      data.shotsLeft = shots;
      io.emit('returnInfo', JSON.stringify(data))

    } else {
  
      let data = {}
      data.skip = true
      io.emit('returnInfo', JSON.stringify(data))
    }
  })


  socket.on('updateInfo', function(info) {
    data = JSON.parse(info)
    setOfStones = data.allStones;
    turn = data.turn;
    shots = data.shotsLeft;
  })

  socket.on('updateButton', function(role) {

    data = JSON.parse(role)
    console.log(data)
  
    // Re-enabling visitor button
    if (data.visitor == "false") {
    //  let btn = document.getElementById("JoinAsVisitorButton")
    //  btn.disabled = false //re-enable button
   //   btn.style.backgroundColor=VISITOR_PROMPT_COLOUR
      console.log("visitor button enabled")
    }
  
    // Re-enabling home button
    if (data.home == "false") {
      //get html document element with id="JoinAsHomeButton"
      
     // let btn = document.getElementById("JoinAsHomeButton")
    //  btn.disabled = false //re-enable button
    //  btn.style.backgroundColor=HOME_PROMPT_COLOUR
      console.log("home button enabled")

      io.emit('updateButton', data)

    }})

  // Processing a client disconnecting
  socket.on("disconnect", function() {

    // Emitting for the client to send what role it is to the server
    console.log("Client has disconnected")
    homePlayerExists = false
    visitorPlayerExists = false
    let connectionInformation = {}
    connectionInformation.home = homePlayerExists
    connectionInformation.visitor = visitorPlayerExists
    let travelCon = JSON.stringify(connectionInformation)
    io.emit('updateButton', travelCon) //resets

    io.emit('sendRole')
  })
})

console.log("Server Running at PORT 3000  CNTL-C to quit")
console.log("To Test")
console.log("http://localhost:3000/curling.html")
