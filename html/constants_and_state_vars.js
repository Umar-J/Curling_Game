/*
constants and state variables used to model the curling collision simulation

*/

const STONES_PER_TEAM = 4 //number of stones per team
const HOME_COLOUR = 'red' //represents both the actual colour and identifier for home stones
const VISITOR_COLOUR = 'yellow' //represents both the actual colour and identifier for visitor stones
const HOME_PROMPT_COLOUR = '#ffcccc' //colour to prompt home player (e.g. colour buttons)
const VISITOR_PROMPT_COLOUR = '#ffffcc' //colour to prompt home player (e.g. colour buttons)
const SPECTATOR_PROMPT_COLOUR = '#ccffcc' //colour to prompt spectator client (e.g. colour buttons)

let whosTurnIsIt = HOME_COLOUR 
let whoHasHammer = VISITOR_COLOUR 
let enableShooting = true //false when stones are in motion
let score = {home: 0, visitor: 0} //updated to reflect how stones lie

let isHomePlayerAssigned = false 
let isVisitorPlayerAssigned = false 

let isHomeClient = false 
let isVisitorClient = false 
let isSpectatorClient = false 

let allStones = null 
let homeStones = null 
let visitorStones = null 
let shootingQueue = null 

let hasRoleAssigned = false 
let updated = false 

function isClientFor(stoneColour){
  //answer whether this client can control (e.g. shoot) stoneColour
  if(stoneColour === HOME_COLOUR && isHomeClient === true) return true
  if(stoneColour === VISITOR_COLOUR && isVisitorClient === true) return true
  return false

}