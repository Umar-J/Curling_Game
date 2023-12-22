//KEY CODES
//should clean up these hard coded key codes
const ENTER = 13
const RIGHT_ARROW = 39
const LEFT_ARROW = 37
const UP_ARROW = 38
const DOWN_ARROW = 40

function handleKeyDown(e) {
  //console.log("keydown code = " + e.which );
  let keyCode = e.which
  if (keyCode == UP_ARROW | keyCode == DOWN_ARROW) {
    //prevent browser from using these with text input drop downs
    e.stopPropagation()
    e.preventDefault()
  }
}

function handleKeyUp(e) {
  
  if (e.which == RIGHT_ARROW | e.which == LEFT_ARROW | e.which == UP_ARROW | e.which == DOWN_ARROW) {
    
  }

  if (e.which == ENTER) {
    $('#userTextField').val('') //clear the user text field
  }

  e.stopPropagation()
  e.preventDefault()
}
