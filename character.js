
p = console.log //to shorten our log statements
var crypto = require('crypto')
var mutePassingTests = true
function AssertEqual(actual, expected, comment) {
  if (actual === undefined )
    actual = "undefined"
  if (expected === undefined )
    expected = "undefined"
  if (actual === null)
    actual = "null"
  if (expected === null)
    expected = "null"
  if (actual === expected)
    if (!mutePassingTests)
      p("passed", comment)
    else
      ;
  else {
    if (comment !== undefined)
      p("FAILED: expected: " + expected.toString() + ", actual: " + actual.toString() + ", " + comment)
    else {
      p("FAILED: expected: " + expected.toString() + ", actual: " + actual.toString())
    }

  }

}
//Globals
var COST_WOOD_FARM = 1
var COST_WOOD_HOUSE = 1
var TIME_TIL_BIRTH = 1
var AGE_MIN_PROCREATE = 16
var HUNGER_PER_TURN = 1
var ATTRIBUTES = {"Strength": 1, "Fertility": 1, "Focus": 1}
var STATUS = {"age": 0, "hunger": 0, "health":100}

// ACTIONS = {
//   "walkTo": "human", "chopWood" : "human", "buildFarm" : "human",
//   "heal": "god"
// }

//obsolete
// ACTION_REQUIREMENTS = {
//   "walkTo" : {},
//   "chopWood" : {"requiredPeople": 1, "requiredAge": 16, "requiredTrees":1},
//   "buildFarm" : {"locationType": "town", "requiredPeople": 1,
//   "requiredWood": COST_WOOD_FARM}
// }
// ACTION_CHECK = {
//   "chopWood" : {
//     "type":"human",
//     "age":16,
//     "location":{"trees":0},
//     "attributes":{"Strength":1}
//   }
// }
//TO DO: Allow object actions to call functions with other objects as a parameter?
ACTION_PERFORM_ON_SELF_REQUIREMENTS = {
  "sayHi":{

  },
  "repeatHelloFiveTimes":{

  },
  "eat" : {
    "food":{"greaterThan":0}
  },
  "giveBirth": {
    "pregnant":{"equalTo":true},
    "gender": {"equalTo":"f"},
    "age":{"greaterThan":15},
    "timePregnant":{"greaterThan":8},
    "spermDoner":{"not":null}
  }
}
ACTION_PERFORM_ON_OTHER_REQUIREMENTS = {
  "chopWood" : {
  "type":{"equalTo":"human"},
  "age":{"greaterThan":16},
  "attributes":{"Strength":{"greaterThan":1}}
  },
  "walkTo" : {
    "type":{"equalTo":"human"}
  }

}
//in order for an action to be done on an object, these requirements must be met
ACTION_ALLOW_REQUIREMENTS={
  "chopWood" : {
    "trees":{"greaterThan": 0}
  },
  "walkTo": {
    "adj":{"arrayContains": "$OBJECT.LOCATION"}
  }

}
//if you successfully 'give' the action, this is what happens to the object that performed the action
ACTION_GIVE = {
  "sayHi":{
    "this": {"callWithNoParams" : "sayHello"}
  },
  "repeatHelloFiveTimes":{
    "this":{"callWithParams":["repeatMessage","Hello There", 7]}
  },
  "chopWood": {
    "hunger" :{"add": 1},
    "age": {"add":1},
    "town":{"wood":{"add":1}}
  },
  "walkTo" : {
    "location" : {"change": "$OBJECT2"}
  },
  "eat":{
    "hunger":{"add":-1},
    "food":{"add":-1}
  },
  "giveBirth":{
    "this":{"callWithNoParams" : "haveABaby"}
  }
}
//if the object gets an action successfully done on it, this is what happens to the object
ACTION_GET = {
  "chopWood": {
    "trees": {"add": -1}
  },
  "walkTo":{
    "people": {"addById": "$OBJECT"}
    // "this": {"addPerson":{"callWithOneParam" : "$OBJECT"}}
  }

}
function wordComparison (x, y, operator) {
    if (operator === "greaterThan")
     return x > y
    if (operator === "lessThan")
     return x < y
    if (operator === "equalTo")
      return x === y
    if (operator === "not")
      return x !== y
    if (operator === "arrayContains") {
      return x.indexOf(y) !== -1
    }
}
function giveReturnsToObject(object, property, value, operator) {
  if (operator === "add"){
    // p(property, obj[property])
    object[property] += value
  }
  if (operator === "addById"){
    object[property][value.id] = value
  }
  if (operator === "change"){
    object[property] = value
  }
  if (operator === "callWithNoParams") {
    // p(obj.name, property, value)
    object[value]()
  }
  if (operator === "callWithParams") {
    //p(property, value)
    object[value[0]].apply(this, value.slice(1))
  }
}
//https://stackoverflow.com/questions/728360/how-do-i-correctly-clone-a-javascript-object?page=1&tab=votes#tab-top
function clone(obj) {
    if (null === obj || "object" !== typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}
// https://stackoverflow.com/questions/558981/getting-a-list-of-associative-array-keys
function returnKeysFromDictionary(dictionary) {
  keys = [];
  for (var key in dictionary) {
    if (dictionary.hasOwnProperty(key)) {
      keys.push(key);
    }
  }
  return keys
}
//Takes mother and father's attributes and combines them for newborns
function combineAttributes(mother, father) {
  atr = clone(ATTRIBUTES)
  Object.keys(atr).forEach(function(element) {
    //console.log(father.attributes)
    atr[element] = mother.attributes[element] + father.attributes[element]
    //p(mother.attributes)
  })
  return atr
}
//https://stackoverflow.com/questions/9407892/how-to-generate-random-sha1-hash-to-use-as-id-in-node-js
function generateId() {
  return crypto.randomBytes(20).toString('hex');
}
// https://stackoverflow.com/questions/722668/traverse-all-the-nodes-of-a-json-object-tree-with-javascript


// function process(key,value) {
//     console.log("KEY:"+key + " : VALUE: "+value);
// }
//
//
// function traverse(o,func) {
//     for (var i in o) {
//         func.apply(this,[i,o[i]]);
//         if (o[i] !== null && typeof(o[i])=="object") {
//             //going one step down in the object tree!!
//             traverse(o[i],func);
//         }
//     }
// }

// function actionControllerRequest(object, action, object2=undefined) {
//   if (actionController(object, action, object2)) {
//     return true
//   }
//   else {
//     return false
//   }
// }
//pays out from action if performed succesfully
//Makes sure that the action can be performed, performs the action, then gives returns
function actionController(object, action, object2) {
  if (objectCanPerformAction(object, action, object2)) {
    giveAndGetObjectReturnsFromAction(object, action, object2)
    return true
  }
  return false
}

function giveAndGetObjectReturnsFromAction(object, action, object2) {
  var action_give = undefined
  var action_get = undefined
  if (object2 === undefined) {
    action_give = ACTION_GIVE[action]
  }
  else {
    action_give = ACTION_GIVE[action]
    action_get = ACTION_GET[action]
  }
  var tree = []
  var actionReturnValue = null
  var actionReturnsTraverse = function(object_to_traverse, returns) {
    for (var i in returns) {
      tree.push(i)
      //Arrays can be used to call object function parameters
      if (returns[i] !== null && typeof(returns[i])=="object" && !(returns[i] instanceof Array)) {
        actionReturnsTraverse(object_to_traverse, returns[i])
      }
      else {
        actionReturnValue = returns[i]
        processReturn(object_to_traverse, tree)
      }
    }
  }
  var processReturn = function(obj, list) {
    myProperty = null
    // p(list)
    if (list.length > 2)
      return processReturn(obj[list.shift()], list)
    else
      myProperty = list.shift()
    changeOperator = list.shift()
    //list.shift()
    // p(myProperty, actionReturnValue, changeOperator)
    if(actionReturnValue === "$OBJECT")
      actionReturnValue = object
    if(actionReturnValue === "$OBJECT2")
      actionReturnValue = object2
    giveReturnsToObject(obj, myProperty, actionReturnValue, changeOperator)
  }
  actionReturnsTraverse(object, action_give)
  if (object2 !== undefined) { //if this was performed on another object, we have to repeat the traversal with the different JSON object
    actionReturnsTraverse(object2, action_get)
  }
}


//returns true if object can perform action
function objectCanPerformAction(object, action, object2) {
  var action_self_reqs = undefined
  var action_allow_reqs = undefined
  if (object2 === undefined) {

    action_self_reqs = ACTION_PERFORM_ON_SELF_REQUIREMENTS[action]
  }
  else {

    action_self_reqs = ACTION_PERFORM_ON_OTHER_REQUIREMENTS[action] //a bit more tricky because other object must allow action
    action_allow_reqs = ACTION_ALLOW_REQUIREMENTS[action]
    if (action_allow_reqs === undefined)
      return false //object 2 cannot find this action
  }
  if (action_self_reqs === undefined) //action not found
    return false
  var tree = []
  var failures = []
  var actionRequirementValue = null //for example, it may require 1 strength to chop wood, so this is 1
  //p(this)
  //var loopValue = function(obj, )


  var processRequirement = function(obj, list) {
    myValue = null
    // p(list)
    if (list.length > 2)
      return processRequirement(obj[list.shift()], list)
    else
      myValue = obj[list.shift()]
      //p(obj[list.shift()])
    comparisonOperator = list.shift()
    if (actionRequirementValue === "$OBJECT.LOCATION") {
      actionRequirementValue = object["location"] //dangerous
      //p(actionRequirementValue.id)
    }
    if (!wordComparison(myValue, actionRequirementValue, comparisonOperator)) {
      //p("Cannot perform action!!!: ",action, myValue, comparisonOperator, actionRequirementValue)
      failures.push([myValue, comparisonOperator, actionRequirementValue])
    }
    else {
      //p("Can perform action: ",action, myValue, comparisonOperator, actionVal)
    }
  }


  var actionRequirementTraverse = function(object_to_traverse, requirements) {
    for (var i in requirements) {
      //func.apply(this,[i,o[i]]);
      //this.process([i,o[i]])
      tree.push(i)
      if (requirements[i] !== null && typeof(requirements[i])=="object") {
          actionRequirementTraverse(object_to_traverse, requirements[i]);
      }
      else {
        //p("The action value:", o[i])
        actionRequirementValue = requirements[i]
        processRequirement(object_to_traverse, tree)
        // if(actionCheck !== true) {
        //   failures.push()
        // }
      }
    }
  }
  actionRequirementTraverse(object, action_self_reqs)
  if (action_allow_reqs !== undefined) //for actions on other objects we must check if htey allow it.
    actionRequirementTraverse(object2, action_allow_reqs)
  if (failures.length > 0) {
    //p(action, failures)
    return false
  }
  else {
    return true
  }
}

//Objects
//A group of people and their belongings and Buildings
//Resources are contributed to the town
//in a way controls the main loop because it will loop thorugh all people []
//and each one will do stuff based on their traits

//Environments should have a distance from one another. We can use God to keep track of this
//or a global grid system
//environments
function Environment(type) {
  this.id = generateId()
  this.type = type
  this.people = {}
  this.buildings = {}
  this.monsters = {}
  this.resources = {}
  this.farms = 0
  this.houses = 0
  this.wood = 0
  this.food = 0
  this.trees = 0
  this.lastPerson = null //last person added to town
  this.adj = [] //adjacent environments
  //environments are the vertexes
  //creates an edge or connection
  this.connectEnvironment = function(environment) {
    if (environment instanceof Environment) {
      this.adj.push(environment)
      environment.adj.push(this)
    }
  }
  this.addPerson = function(person) {
    if (!(person instanceof Person)) {
      p("Failed to add person!")
      return false
    }
    this.people[person.id] = person
    person.location = this
    this.lastPerson = person //WARNING: if they die then this will cause err.
  }
  this.allPeopleNames = function() {
    names = []
    allKeys = Object.keys(this.people)
    for(i = 0; i < allKeys.length; i++) {
      names.push(this.people[allKeys[i]].name)
    }
    return names
  }
  this.removePerson = function(person) {
    //remove person from the list
    delete this.people[person.id];
  }
  this.movePerson = function(person, environment) {
    if (this.loopThroughConnectionsFor("id", environment.id)  !== null) {
      this.removePerson(person)
      environment.addPerson(person)
    }
  }
  this.findAdjacentType = function(type) {
    return this.loopThroughConnectionsFor("type", type)
  }
  //property is a string
  this.loopThroughConnectionsFor = function(property, value) {
    i = 0
    while(i < this.adj.length) {
      if (this.adj[i][property] === value) {
        return this.adj[i]
      }
      i += 1
    }
    return null;
  }
}


//Actions per turn
//Work, eat, pray
//Auto Actions per turn: sleep, give birth/advance pregnancy (f), impregnate wife (m)

//Attributes
//Strength - Affects woodcutting ability
//Fertility - Affects ability to impregnate/get pregnant
//Focus - Affects build speed
//Trait modifiers (change over time/through quests)
//Positive Modifiers: Strong, Swift, Smart
//Negative Modifiers: Weak, Slow, Dumb
function Person(name, mother, father, gender, town) {
  this.id = generateId()
  this.type = "human"
  this.self = this
  this.name = name
  this.mother = mother
  this.father = father
  this.gender = gender
  this.pregnant = false
  this.town = town
  this.location = town
  this.timePregnant = -1
  this.inventory = {}
  //on creation we must hash them into the town dict for quick access
  town.addPerson(this)
  this.age = 0
  this.hunger = 0
  this.food = 0
  this.spermDoner = null
  this.brokenArms = 0
  this.god = null //the god they serve
  this.job = null
  this.married_to = null
  this.attributes = clone(ATTRIBUTES)
  if (this.gender === "f") {
    this.spermdoner = null;
    this.pregnancy = -1 //if -1 false. turn to zero to turn on
    this.giveBirth = function(childname){
      if (childname === undefined)
        childname = "newborn"
      else
        childname = childname
      gender = "f"
      if (Math.floor(Math.random() * 2) + 1 === 2)
        gender = "m"
      //NOTE: Newborns are not assigned a god because they cannot be given orders (yet)
      newborn = new Person(childname, this, this.spermdoner, gender, this.town)
      newborn.attributes = combineAttributes(this, this.spermdoner)
      this.spermdoner = null
      this.pregnancy = -1
    }
  }
  //NOTE: Men should try to impregnate their wives only.
  else {
    this.impregnate = function(person) {
      if (this.age >= AGE_MIN_PROCREATE && person.gender === "f" &&
      person.age >= AGE_MIN_PROCREATE && person.pregnancy < 0){
        person.spermdoner = this
        person.pregnancy = 0
        return true
      }
      else {
        return false
      }
    }
  }
  this.haveABaby = function() {
    // p("I'm having a baby!")
    childname = "newborn"
    gender = "f"
    if (Math.floor(Math.random() * 2) + 1 === 2)
      gender = "m"
    //NOTE: Newborns are not assigned a god because they cannot be given orders (yet)
    newborn = new Person(childname, this, this.spermDoner, gender, this.town)
    newborn.attributes = combineAttributes(this, this.spermDoner)
    this.spermDoner = null
    this.pregnancy = -1
  }
  //var self = this
  this.sayHello = function() {
    p("HELLO!")
  }
  this.repeatMessage = function(message, times) {
    // p(message)
    // p(times)
    for(i = 0; i < times; i++)
      p(message)
  }
  this.increaseAge = function () {
    this.age += 1
    this.hunger += HUNGER_PER_TURN

    if (this.gender === "f") {
      if (this.pregnancy >= 0)
        this.pregnancy += 1 //increase 'age' of pregnancy
      if (this.pregnancy >= TIME_TIL_BIRTH)
        this.giveBirth()
    }
  }
  // this.getPayoff = function(resource, value) {
  //   switch(resource) {
  //     case "wood":
  //       this.town.wood += 1 //consider putting in inventory til they get to town
  //       break
  //     case "farms":
  //       this.town.farms += 1
  //       break
  //     case "hunger":
  //       this.hunger += 1
  //       break
  //   }
  // }
  /**
  A note on how to think about this and further implementation:
  IF objectCanPerformAction checks true, then this Person has met all the
  requirements to perform the action. However, that does not mean the action
  will succeed. For example, they may be able to chopWood, but that does not ensure
  the tree will give wood. So, the ifs after the personal check need to check if that's
  alright with the object it is interacting with. So handshake with the affected object to
  see the consequences. Use the value param to do this second check when necessary
  **/
  //define object2 if this is an action on another object
  this.action = function(action, object2 = undefined) {
    return actionController(this, action, object2)
    //payoff
    // if (action === "chopWood") {
    //   this.location.wood += 1
    // }
    // if (action === "pickupWood") {
    //   this.town.wood += 1
    // }
    // if (action === "walkTo")  {
    //   this.location.movePerson(this, value) //I don't like this
    // }
    //at this point we  loop through the payoffs

    // keys = returnKeysFromDictionary(ACTION_PAYOFFS[action])
    // for (i = 0; i < keys.length; i++) {
    //   this.getPayoff(keys[i], ACTION_PAYOFFS[action][keys[i]])
    // }
    //return true
  }


  //should affect or be affected by hunger. Hungry people are worse workers.
  //this will be segue into the actions function

  this.work = function(workedObject) {
    switch(this.job) {
      case "clergy":

      break
      case "builder":
      //cannot build without a god. In future, towns should also have
      // a build queue so they will automously build based on num buildings.
      //obviously the god queue comes first.
        if (!this.god)
          break
        if (this.god.buildQueue.length > 0) {
          if (this.god.buildQueue[0] === "farm" && this.town.wood >= COST_WOOD_FARM) {
            town.wood -= COST_WOOD_FARM
            town.farms += 1
            this.god.buildQueue.shift()//remove from queue
          }
          if (this.god.buildQueue[0] === "house" && this.town.wood >= COST_WOOD_HOUSE) {
            this.town.wood -= COST_WOOD_HOUSE
            this.town.houses += 1
            this.god.buildQueue.shift()//remove from queue
          }
        }
      break
      //Try to find adjacent forest with trees in it
      //If there are trees, do the action chopWood
      //Return to town
      case "woodsman":
        //TO DO: The woodsman must do a depth first search to find the nearestForest
        //THEN he will retrace his steps to return home and deposit the wood
        //at the moment the woodsman will only look at the immediately adjacent cells.
        if (this.location.trees < 1) {
          nearestForest = this.location.findAdjacentType("forest")
          if (nearestForest !== undefined)
            this.action("walkTo", nearestForest)
        }
        if (this.location.trees > 0)
          this.action("chopWood")
          //now he wants to go home...
      break
      //TO DO: The farmer returns to their home town if they're not already there.
      //Then, they will do the needed work on farms, e.g., harvest/plant/water/weed
      //Upon harvest, the town's food will increase
      case "farmer":
        if (this.town.farms > 0)
          this.town.food += this.town.farms
      break
      default:
        return false
    }
  }
}
function God () {
  this.id = generateId()
  this.type = "god"
  this.alignment = 0 //negative evil, positive good
  this.followers = 0
  this.faith = 0
  this.buildQueue = []
  this.assignJob = function(person, job) {
    //Only if they believe in this god
    if (person.god === this) {
      person.job = job
      return true
    }
    else {
      return false
    }
  }
  //NOTE: Build orders do not check for proper amounts of resources.
  this.buildOrder = function(town, building) {
    if (town === undefined || building === undefined)
      return false

    if (building === "farm") {
      this.buildQueue.push(building)
      return true
    }
    if (building === "house") {
      this.buildQueue.push(building)
      return true
    }
    return false
  }
  //will cause procreation at regular intervals
  this.marryCouple = function(man, woman) {
    if (man.gender === "m" && woman.gender === "f" &&
      man.age >= AGE_MIN_PROCREATE && woman.age >= AGE_MIN_PROCREATE &&
      !man.married_to && !woman.married_to) {
        man.married_to = woman
        woman.married_to = man
    }
  }
}
//https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery
// String.prototype.hashCode = function() {
//   var hash = 0, i, chr;
//   if (this.length === 0) return hash;
//   for (i = 0; i < this.length; i++) {
//     chr   = this.charCodeAt(i);
//     hash  = ((hash << 5) - hash) + chr;
//     hash |= 0; // Convert to 32bit integer
//   }
//   return hash;
// };


/*******************************
TESTING BELOW THIS LINE!
********************************/

var Player = new God()
var Eden = new Environment("town")
var Forest = new Environment("forest")
var Heaven = new Environment("sky")
Eden.connectEnvironment(God)
AssertEqual(Eden.adj.length === 0, true, "Cannot connect environments to diff onbjects")
Eden.connectEnvironment(Forest) //connect the two vertices together
AssertEqual(Forest.adj.length > 0, true, "Can connect environments together")


//notice the null mother and father!
var Adam = new Person("Adam", null, null, "m", Eden)
var Eve = new Person("Eve", null, null, "f", Eden)
var Jose = new Person("Eve", null, null, "m", Eden)
// p(Adam.age)
//objectReturnsFromAction(Adam, "chopWood", self=true)
// p(Adam.age)
//p(Adam.action("chopWood"))

//p(traverse(ACTION_CHECK["chopWood"], process))
//traverse(ACTION_CHECK["chopWood"], Adam.processAction)
//objectCanPerformAction(Adam, "chopWood")
//Adam.checkAction("chopWood")
//Adam.checkAction(ACTION_CHECK["chopWood"])
//p(Adam["attributes"]["Strength"])
// list = ['attributes', 'Strength']
// var loop = function(o, list) {
//   if (list.length > 1)
//     return loop(o[list.shift()], list)
//   else {
//     // p("t:", o[list.shift()])
//     return o[list.shift()]
//   }
// }
// p(loop(Adam, list))
function testRemovalOfPeople() {
  AssertEqual(Eden.allPeopleNames().length, 3, "initialize three people to the town")
  Eden.removePerson(Jose)
  AssertEqual(Eden.allPeopleNames().length, 2, " two people to the town after removing 1")
}
// testActions()
//p(Eden.trees)
// p(Eden.trees)
//p(Adam.location)
// giveAndGetObjectReturnsFromAction(Adam, "chopWood", Eden)
// p(Eden.trees)
// testActions()
function testActions() {
  var John = new Person("John", null, null, "m", Eden)
  Eden.trees = 0
  John.action("walkTo", Heaven)
  AssertEqual(John.location.id, Eden.id, "persons cannot move to unconnected locations")
  //p(Forest["adj"].indexOf(Eden))
  John.action("walkTo", Forest)
  AssertEqual(John.location.id, Forest.id, "persons can move when given a connected location")
  wood = Eden.wood
  hunger = John.hunger
  John.action("chopWood", John.location)
  John.age = 0
  AssertEqual(John.action("chopWood"), false, "person must be old enough to chop wood")
  John.age = 17
  John.action("chopWood", John.location)
  AssertEqual(Eden.wood > wood, false, "there must be trees to chop wood")
  John.location.trees = 1
  John.action("chopWood", John.location)
  AssertEqual(Eden.wood > wood, false, "the character must have at least 2 strength to chop wood")
  John.attributes.Strength = 2
  John.action("chopWood", John.location)
  AssertEqual(Eden.wood > wood, true, "after chopping wood, the amount of wood in the town increases")
  AssertEqual(John.hunger > hunger, true, " the person gets hungry after chopping down trees!")
  hunger = John.hunger
  John.food = 0
  John.action("eat")
  AssertEqual(John.hunger === hunger, true, "Persons cannot eat if they have no food!")
  John.food = 1
  start_food = John.food
  John.action("eat")
  AssertEqual(John.hunger < hunger, true, "Persons can eat if they have food!")
  AssertEqual(John.food < start_food, true, "if a person eats food, their food amount decreases")
  John.action("sayHi")
  John.action("repeatHelloFiveTimes")
}

function testMarriage() {
  Adam.age = AGE_MIN_PROCREATE
  Player.marryCouple(Adam, Eve)
  AssertEqual(Eve.married_to, null, "Cannot marry under age of procreation")
  Diego = new Person("Diego", null, null, "m", Eden)
  Diego.age = AGE_MIN_PROCREATE
  Player.marryCouple(Adam, Diego)
  AssertEqual(Adam.married_to, null, "Cannot marry same sex")
  Eve.age = AGE_MIN_PROCREATE
  Player.marryCouple(Adam, Eve)
  AssertEqual(Adam.married_to.name, Eve.name, "Can marry man and woman")
  AssertEqual(Eve.married_to.name, Adam.name, "Can marry woman and man")

}
function testPregnancy() {
  //Pregnancy and birth
  Adam.age = AGE_MIN_PROCREATE
  Eve.age = AGE_MIN_PROCREATE
  Adam.impregnate(Eve)
  AssertEqual(Eve.pregnancy, 0, "When impregnated successfully, change pregnant from -1 to 0")

}
testBirth()
function testBirth() {
  // testPregnancy()
  num_people_before_birth = Eden.allPeopleNames().length
  Eve.action("giveBirth")
  AssertEqual(Eden.allPeopleNames().length, num_people_before_birth, "cannot give birth unless pregnant for 9 months")
  Eve.age = 16
  Eve.pregnant = true
  Eve.spermDoner = Adam
  Eve.gender = "f"
  Eve.timePregnant = 9
  Eve.action("giveBirth")
  AssertEqual(Eden.allPeopleNames().length, num_people_before_birth+1, "Upon bearing children, number of people in town increases by 1")
  // for (var i = 0; i < TIME_TIL_BIRTH; i++)
  //   Eve.increaseAge()
  // AssertEqual(Eden.allPeopleNames().length, num_people_before_birth+1, "Upon bearing children, number of people in town increases by 1")
  // //p (Eve.attributes.Strength )
  // baby = Eden.lastPerson
  // AssertEqual(baby.attributes.Strength, Eve.attributes.Strength + Adam.attributes.Strength, "When born, babies have a combination of their mother and father's attributes")
}

function testJobs() {
//Assigning a job
  Adam.god = Player
  Player.assignJob(Adam, "woodsman")
  AssertEqual(Player.assignJob(Adam, "woodsman"), true, "God can assign job to people who believe")
  AssertEqual(Player.assignJob(Eve, "woodsman"), false, "God cannot assign job to people who don't believe")
  wood = Adam.location.wood
  Forest.trees = 0
  Adam.work()
  AssertEqual(Adam.town.wood > wood, false, "Woodsman cannot chop trees if there are none nearby")
  Forest.trees = 1
  Adam.work()
  AssertEqual(Adam.town.wood > wood, true, "Woodsman will increase wood supply if there are trees in an adjacent forest")
}
function testBuilding() {
  Eve.god = Player
  Eden.farms = 0
  Player.assignJob(Eve, "builder")
  Eden.wood = COST_WOOD_FARM
  Player.buildOrder(Eden, "farm")
  Eve.work()
  AssertEqual(Eden.farms, 1, "People can build farms given the materials and order")
  Eve.work()
  AssertEqual(Eden.farms, 1, "People cannot build without enough materials")
  Eden.wood = COST_WOOD_FARM
  Eve.work()
  AssertEqual(Eden.farms, 1, "People will not build without a build order")
  Player.buildOrder(Eden, "house")
  Eden.wood = COST_WOOD_HOUSE
  Eden.homes = 0
  Eve.work()
  AssertEqual(Eden.houses, 1, "People will build homes given a build order")
  Eden.houses = 0
  Eden.farms = 0
  Eden.wood = COST_WOOD_HOUSE
  Player.buildOrder(Eden, "farm")
  Player.buildOrder(Eden, "house")
  Player.buildOrder(Eden, "house")
  Player.buildOrder(Eden, "house")
  Eve.work()
  AssertEqual(Eden.farms, 1, "People will build first in the queue")
}

function testFarming() {
  Bob = new Person("Bob", Adam, Eve, "m", Eden)
  Bob.age = 21
  Bob.god = Player
  Player.assignJob(Bob, "farmer")
  current_food = Bob.town.food
  Bob.work()
  AssertEqual(Bob.town.food, current_food+Bob.town.farms, "Food increases proportional to number of farms when worked")
  current_food = Bob.town.food
  Bob.town.farms = 0
  Bob.work()
  AssertEqual(Bob.town.food, current_food, "Food does not increase if there are no farms to work")
}
