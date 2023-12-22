function getCanvasMouseLocation(e) {
  //provide the mouse location relative to the upper left corner
  //of the canvas

  /*
  This code took some trial and error. If someone wants to write a
  nice tutorial on how mouse-locations work that would be great.
  */
  let rect = canvas.getBoundingClientRect()

  //account for amount the document scroll bars might be scrolled

  //get the scroll offset
  const element = document.getElementsByTagName("html")[0]
  let scrollOffsetX = element.scrollLeft
  let scrollOffsetY = element.scrollTop

  let canX = e.pageX - rect.left - scrollOffsetX
  let canY = e.pageY - rect.top - scrollOffsetY

  return {
    x: canX,
    y: canY
  }
}

// make cue object
let cueObj = null;

// socket handling cue data
socket.on('setCue', function(data) {
  cueData = JSON.parse(data)
  // Setting the stone being shot
  stoneBeingShot = allStones.stoneAtLocation(cueData.x, cueData.y)
  if(stoneBeingShot === null){
    if(iceSurface.isInShootingCrosshairArea(cueData.location)){
      if(shootingQueue.isEmpty()) stageStones()
      stoneBeingShot = shootingQueue.front()
      stoneBeingShot.setLocation(cueData.location)
      //we clicked near the shooting crosshair
    }
  }

  // initializing cue
  cueObj = new Cue(cueData.x, cueData.y)
})

// Handling a mouse press
function handleMouseDown(e) {

  if(enableShooting === false) return //cannot shoot when stones are in motion
  if(!isClientFor(whosTurnIsIt)) return //only allow controlling client

  // Getting the mouse location
  let canvasMouseLoc = getCanvasMouseLocation(e)
  let canvasX = canvasMouseLoc.x
  let canvasY = canvasMouseLoc.y

  // Setting the stone currently being shot
  stoneBeingShot = allStones.stoneAtLocation(canvasX, canvasY)

  //bounds checking
  upperY = iceSurface.getShootingCrossHairArea().y + iceSurface.getShootingCrossHairArea().height
  lowerY = iceSurface.getShootingCrossHairArea().y

  upperX = iceSurface.getShootingCrossHairArea().x + iceSurface.getShootingCrossHairArea().width
  lowerX = iceSurface.getShootingCrossHairArea().x

  // set stoneObj to being shot if it is in the shooting crosshair area
  if(stoneBeingShot === null){
    if(iceSurface.isInShootingCrosshairArea(canvasMouseLoc)){
      if(shootingQueue.isEmpty()){
        stageStones()
      }
      stoneBeingShot = shootingQueue.front()
      stoneBeingShot.setLocation(canvasMouseLoc)
      //we clicked near the shooting crosshair
    }
  }

  // Checking if there is a stone being shot
  if (stoneBeingShot != null
      && (canvasX <= upperX && canvasX >= lowerX)
      && (canvasY <= upperY && canvasY >= lowerY)) {
    shootingCue = new Cue(canvasX, canvasY)
    document.getElementById('canvas1').addEventListener('mousemove', handleMouseMove)
    document.getElementById('canvas1').addEventListener('mouseup', handleMouseUp)

    // game update through sockets
    let sendInfo = {}
    sendInfo.location = canvasMouseLoc
    sendInfo.x = canvasX
    sendInfo.y = canvasY
    socket.emit('newCue', JSON.stringify(sendInfo))

    let newUpdate = {}
    newUpdate.turn = whosTurnIsIt
    newUpdate.allStones = allStones
    newUpdate.shotsLeft = shootingQueue.collection.length
    socket.emit('updateInfo', JSON.stringify(newUpdate))
  }

  // Stop propagation of the event and stop any default
  //  browser action
  e.stopPropagation()
  e.preventDefault()

  // Drawing the canvas
  drawCanvas()
}

// stocket recieving cue data
socket.on('watchCue', function(data) {
  let cueData = JSON.parse(data)
  let canvasY = cueData.y
  let canvasX = cueData.x
  
  if (cueObj != null) {
    cueObj.setCueEnd(canvasX, canvasY)
  }
  drawCanvas()
})

// Handling the client moving the mouse
function handleMouseMove(e) {

  // Parsing server informaton
  let cueData = {}
  cueData.mouse = e

  let canvasMouseLoc = getCanvasMouseLocation(e)
  let canvasX = canvasMouseLoc.x
  let canvasY = canvasMouseLoc.y

  // Setting the cue location information
  cueData.location = canvasMouseLoc
  cueData.y = canvasY
  cueData.x = canvasX
  
  // Setting the endpoints of the cue
  if (shootingCue != null) {
    shootingCue.setCueEnd(canvasX, canvasY)
  }

  // Drawing the canvas
  e.stopPropagation()
  drawCanvas()

  // Sending the server updated cue position information
  let data = JSON.stringify(cueData)
  socket.emit('aiming', data)
}

socket.on('deleteCue', function(data) {
  if (cueObj != null) {
    let cueVelocity = cueObj.getVelocity()
    if (stoneBeingShot != null) stoneBeingShot.addVelocity(cueVelocity)
    cueObj = null
    shootingQueue.dequeue()
    enableShooting = false 
  }
  cueObj = null
  drawCanvas() 
})

// Handling lifting the mouse
function handleMouseUp(e) {
  e.stopPropagation()

  if (shootingCue != null) {
    let cueVelocity = shootingCue.getVelocity()
    if (stoneBeingShot != null) stoneBeingShot.addVelocity(cueVelocity)
    shootingCue = null
    shootingQueue.dequeue()
    enableShooting = false 
    
    let update = {}
    update.allStones = allStones
    update.turn = whosTurnIsIt
    update.shotsLeft = shootingQueue.collection.length
    socket.emit('updateInfo', JSON.stringify(update))
  }

  // Deleting the aiming cue on other clients' screens
  socket.emit('nCue')
  console.log(shootingQueue)

  //remove mouse move and mouse up handlers but leave mouse down handler
  document.getElementById('canvas1').removeEventListener('mousemove', handleMouseMove)
  document.getElementById('canvas1').removeEventListener('mouseup', handleMouseUp)

  drawCanvas() //redraw the canvas
}
