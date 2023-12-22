
function handleJoinAsHomeButton(){
  hasRoleAssigned = true
  const btn = document.getElementById("JoinAsHomeButton")
  btn.disabled = true  
  btn.style.backgroundColor="lightgray"

  const role = {}
  if(!isHomePlayerAssigned){
    role.role = "home"
    isHomePlayerAssigned = true
    isHomeClient = true
  }
  let travelObj = JSON.stringify(role)
  socket.emit('playerChosen', travelObj)
}

function handleJoinAsVisitorButton(){
  hasRoleAssigned = true
  const btn = document.getElementById("JoinAsVisitorButton")
  btn.disabled = true  
  btn.style.backgroundColor="lightgray"

  const role = {}
  if(!isVisitorPlayerAssigned) {
    role.role = "visitor"
    isVisitorPlayerAssigned = true
    isVisitorClient = true
  }
  const travelObj = JSON.stringify(role)
  socket.emit('playerChosen', travelObj)
}

function handleJoinAsSpectatorButton(){
  hasRoleAssigned = true
  isSpectatorClient = true;
  let btn = document.getElementById("JoinAsSpectatorButton")
  btn.disabled = true  
  btn.style.backgroundColor="lightgray"
}

socket.on('fullLock', function(role, fullLock) {
  dataObj = JSON.parse(role)
  data = dataObj.role
  //locking buttons based on role selected
  if (data === "visitor") {
    let btn = document.getElementById("JoinAsVisitorButton")
    btn.disabled = true 
    btn.style.backgroundColor="lightgray"

    if (isVisitorClient == true) {
      let firstBtn = document.getElementById("JoinAsHomeButton")
      let secondBtn = document.getElementById("JoinAsSpectatorButton")
      if (fullLock == true) {
        firstBtn.style.backgroundColor="lightgray"
        firstBtn.disabled = true        
      }
      secondBtn.style.backgroundColor="lightgray"
      secondBtn.disabled = true 
    }
    isSpectatorClient = false;

  } else if (data === "home") {
    let btn = document.getElementById("JoinAsHomeButton")
    btn.disabled = true 
    btn.style.backgroundColor="lightgray"

    if (isHomeClient == true) {
      let firstBtn = document.getElementById("JoinAsVisitorButton")
      let secondBtn = document.getElementById("JoinAsSpectatorButton")
      if (fullLock == true) {
        firstBtn.disabled = true 
        firstBtn.style.backgroundColor="lightgray"
      }
      secondBtn.disabled = true 
      secondBtn.style.backgroundColor="lightgray"
    }
    isSpectatorClient = false;

  
  } else if (data === "spectator") {
    let btn = document.getElementById("JoinAsSpectatorButton")
    btn.disabled = true  
    btn.style.backgroundColor="lightgray"
  }
})

// re enabling buttons on disconnect
socket.on('updateButton', function(role) {
  data = JSON.parse(role)
  console.log(data)

  if (data.visitor == "true") {
    let btn = document.getElementById("JoinAsVisitorButton")
    btn.disabled = false 
    btn.style.backgroundColor=VISITOR_PROMPT_COLOUR
    console.log("visitor button re-enabled")
  }
  
  if (data.home == "true") {
    let btn = document.getElementById("JoinAsHomeButton")
    btn.disabled = false 
    btn.style.backgroundColor=HOME_PROMPT_COLOUR
    console.log("home button re-enabled")
  }
})