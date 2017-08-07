
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
//Objects
//A group of people and their belongings and Buildings
//Resources are contributed to the town
//in a way controls the main loop because it will loop thorugh all people []
//and each one will do stuff based on their traits

//Environments should have a distance from one another. We can use God to keep track of this
//or a global grid system
//environments
function Environment(type) {
  this.id = crypto.randomBytes(20).toString('hex');
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
    //person requests to move to environment
    //search through adj[] for environment. if found, move person there
    //if (environment instanceof Environment) {
    //   i = 0
    //   while (i < this.adj.length) {
    //     if (this.adj[i].id === environment.id) {
    //       this.removePerson(person)
    //       this.adj[i].addPerson(person)
    //     }
    //     i+=1
    //   }
    // }
    //make sure they are connected
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
  //https://stackoverflow.com/questions/9407892/how-to-generate-random-sha1-hash-to-use-as-id-in-node-js
  this.id = crypto.randomBytes(20).toString('hex');
  this.type = "human"
  this.name = name
  this.mother = mother
  this.father = father
  this.gender = gender
  this.town = town
  this.location = town
  //on creation we must hash them into the town dict for quick access
  town.addPerson(this)
  this.age = 0
  this.hunger = 0
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
  //List of requirements to perform an action
  ACTIONS = {
    "walkTo": "human", "chopWood" : "human", "buildFarm" : "human"
  }
  ACTION_REQUIREMENTS = {
    "walkTo" : {},
    "chopWood" : {"requiredPeople": 1, "requiredAge": 16, "requiredTrees":1},
    "buildFarm" : {"environment": "town", "requiredPeople": 1,
    "requiredWood": COST_WOOD_FARM}}
  ACTION_PAYOFFS = {
    "walkTo" : {},
    "chopWood" : {"wood" : 1, "hunger" : 1},
    "buildFarm" : {"farms" : 1}
  }
  this.meetsRequirement = function(requirement, value) {
    switch(requirement) {
      case "environment":
        return this.location.type === value
        break
      case "requiredPeople":
        return this.location.allPeopleNames().length >= value
        break
      case "requiredWood":
        return this.town.wood >= value
        break
      case "requiredAge":
        return this.age >= value
        break
      case "requiredTrees":
        return this.location.trees >= value
        break
    }
  }
  this.getPayoff = function(resource, value) {
    switch(resource) {
      case "wood":
        this.town.wood += 1 //consider putting in inventory til they get to town
        break
      case "farms":
        this.town.farms += 1
        break
      case "hunger":
        this.hunger += 1
        break
    }
  }
  this.action = function(action, value) {
    if (ACTIONS[action] === undefined)
      return false
    keys = returnKeysFromDictionary(ACTION_REQUIREMENTS[action])
    //check if all requirements are met
    for (i = 0; i < keys.length; i++) {
      if (!this.meetsRequirement(keys[i], ACTION_REQUIREMENTS[action][keys[i]])) {
        return false;
      }
    }
    //do the action (movement is weird)
    if (action === "walkTo")  {
      this.location.movePerson(this, value)
    }
    //at this point we  loop through the payoffs

    keys = returnKeysFromDictionary(ACTION_PAYOFFS[action])
    for (i = 0; i < keys.length; i++) {
      this.getPayoff(keys[i], ACTION_PAYOFFS[action][keys[i]])
    }
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
        if (this.location.trees < 1) {
          nearestForest = this.location.findAdjacentType("forest")
          if (nearestForest !== undefined)
            this.action("walkTo", nearestForest)
        }
        if (this.location.trees > 0)
          this.action("chopWood")
          //now he wants to go home...


          //this.action("walkTo", this.town)
        // if (workedObject.type === "forest") {
        //   this.town.wood += 1
        //   return true
        // }
        // else {
        //   return false
        // }
      break
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



function testRemovalOfPeople() {
  AssertEqual(Eden.allPeopleNames().length, 3, "initialize three people to the town")
  Eden.removePerson(Jose)
  AssertEqual(Eden.allPeopleNames().length, 2, " two people to the town after removing 1")
}


function testActions() {
  AssertEqual(Adam.action("chopWood"), false, "persons cannot chop wood when theyre in the town")
  Adam.action("walkTo", Heaven)
  AssertEqual(Adam.location.id, Eden.id, "persons cannot move to unconnected locations")
  Adam.action("walkTo", Forest)
  AssertEqual(Adam.location.id, Forest.id, "persons can move when given a connected location")
  wood = Eden.wood
  hunger = Adam.hunger
  Adam.action("chopWood")
  AssertEqual(Eden.wood > wood, false, "person must be old enough to chop wood")
  Adam.age = 17
  Adam.action("chopWood")
  AssertEqual(Eden.wood > wood, false, "there must be trees to chop wood")
  Adam.location.trees = 1
  Adam.action("chopWood")
  AssertEqual(Eden.wood > wood, true, "after chopping wood, the amount of wood in the town increases")
  AssertEqual(Adam.hunger > hunger, true, "after chopping wood, the person gets hungry")

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

function testBirth() {
  testPregnancy()
  num_people_before_birth = Eden.allPeopleNames().length
  for (var i = 0; i < TIME_TIL_BIRTH; i++)
    Eve.increaseAge()
  AssertEqual(Eden.allPeopleNames().length, num_people_before_birth+1, "Upon bearing children, number of people in town increases by 1")
  //p (Eve.attributes.Strength )
  baby = Eden.lastPerson
  AssertEqual(baby.attributes.Strength, Eve.attributes.Strength + Adam.attributes.Strength, "When born, babies have a combination of their mother and father's attributes")
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
testJobs()
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
