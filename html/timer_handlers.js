
function handleTimer() {

  // Handling stone collisions
  allStones.advance(iceSurface.getShootingArea())
  for (let stone1 of allStones.getCollection()) {
    for (let stone2 of allStones.getCollection()) {
      //check for possible collisions
      if ((stone1 !== stone2) && stone1.isTouching(stone2) && (stone1.isStoneMoving() || stone2.isStoneMoving())) setOfCollisions.addCollision(new Collision(stone1, stone2))
    }
  }

  setOfCollisions.removeOldCollisions()

  if(allStones.isAllStonesStopped()){
    if(!shootingQueue.isEmpty()) whosTurnIsIt = shootingQueue.front().getColour()
    score = iceSurface.getCurrentScore(allStones)
    enableShooting = true
  }

  // Hammer functionality
  if(allStones.isAllStonesStopped() && shootingQueue.isEmpty()){
    score = iceSurface.getCurrentScore(allStones)
    whosTurnIsIt = hammer()
    enableShooting = true
  }

  drawCanvas()
}

//hammer logic (winner of previous end gets hammer)
function hammer() {
  if (score.home > score.visitor) {
    whoHasHammer = VISITOR_COLOUR;
    return whosTurnIsIt = HOME_COLOUR;
  } else if (score.home < score.visitor) {
    whoHasHammer = HOME_COLOUR;
    return whosTurnIsIt = VISITOR_COLOUR;
  } else {
    whoHasHammer = (whosTurnIsIt == HOME_COLOUR) ? HOME_COLOUR : VISITOR_COLOUR;
    return whosTurnIsIt = (whosTurnIsIt == HOME_COLOUR) ? VISITOR_COLOUR : HOME_COLOUR;
  }
}