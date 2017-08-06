// God Simulator
// 1. Initialize Life
// 2. Answer Prayers (missions)
// 3. These cause further problems
// 4. Collect currency (faith)
// 5. Use faith to expand your following
// 6. Persuade your followers to commit horrible, horrible atrocities
// 7. Assign jobs to followers -
// Clergy (Give Faith)
//Builder builds
// Woodsman (chops wood )
// Farmer (grows food)
// followers gain skills in certain jobs to make them 'stick' to that job.
//followers gain bonuses and ailments (positive and negative) based on their work, hunger, and quests
//ex: hunger > 100 roll a die every turn to determine if they suffer malnourishment: (works at half the speed of others)
//build a farm: increase exp in building which gives opportunity to roll certain positive traits like...
//Master Builder: Buildings built by this person provide double their normal output
//have a child: roll a die for mother death, roll for 'extra fertile' gene which allows pregnancy in half the original TIME_TIL_BIRTH
//chop wood: increase exp in axe which can roll positive traits like...
//Experienced Woodsman: Gathers wood at double speed,
//but accidents happen too, Broken Limb: Woodsman broke his leg and cannot work for 5 turns

//Use faith to reverse ailments strategically - e.g., fix the woodsman if you are making a large building

//Risk and Reward: Grand projects like churches, altars, etc. have the potential to bring big faith rewards, but
//these large projects may require you to put your followers in harms way. As long as you have a man and a woman your town
//can live on.
//You risk your followers by grouping and outfitting them [armor, weapons, powers, loot] and sending them on quests
//the goal is to build balanced groups (healer, tank, ranger, missionary) and having them go coerce other
//societies into believing you. Their success is passive after being outfitted because they leave your 'influence'
//generally they will return (sometimes they will die) with ailments and bonuses based on the quest profile and their
//initial properties and skills. They can sometimes bring back loot and other followers.

//loot are passive skill boosting objects

//Consider removing the phaser stuff.
p = console.log //to shorten our log statements
var crypto = require('crypto')
function AssertEqual(actual, expected, comment) {
  if (actual === undefined )
    actual = "undefined"
  if (expected === undefined )
    expected = "undefined"
  if (actual === null)
    actual = "null"
  if (expected === null)
    expected = "null"
  if (actual == expected)
    if (comment !== undefined)
      p("passed")//p("PASSED: "+ comment)
    else
      p("passed")
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
//Objects
//A group of people and their belongings and Buildings
//Resources are contributed to the town
//in a way controls the main loop because it will loop thorugh all people []
//and each one will do stuff based on their traits
function Town() {
  this.people = {}
  this.farms = 0
  this.houses = 0
  this.wood = 0
  this.food = 0
  this.lastPerson = null //last person added to town
  this.addPerson = function(person) {
    this.people[person.id] = person
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

}

function Nature (type) {
  //Disease
  //Events
  //Provides food/wood/resources
  this.type = type
  this.food = 100
  this.wood = 100
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
  this.name = name
  this.mother = mother
  this.father = father
  this.gender = gender
  this.town = town
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
      if (Math.floor(Math.random() * 2) + 1 == 2)
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
  //should affect or be affected by hunger. Hungry people are worse workers.
  this.work = function(workedObject) {
    switch(this.job) {
      case "clergy":

      break
      case "builder":
        if (!this.god)
          break //cannot build without a god
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
      case "woodsman":
        if (workedObject.type == "forest") {
          this.town.wood += 1
          return true
        }
        else {
          return false
        }
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
    if (person.god == this) {
      person.job = job
      return true
    }
    else {
      return false
    }
  }
  //NOTE: Build orders do not check for proper amounts of resources.
  this.buildOrder = function(town, building) {
    if (town === undefined || building == undefined)
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
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
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


Player = new God()
Eden = new Town()
Forest = new Nature("forest")
//notice the null mother and father!
Adam = new Person("Adam", null, null, "m", Eden)
Eve = new Person("Eve", null, null, "f", Eden)
Jose = new Person("Eve", null, null, "m", Eden)

AssertEqual(Eden.allPeopleNames().length, 3, "initialize three people to the town")
Eden.removePerson(Jose)
AssertEqual(Eden.allPeopleNames().length, 2, " two people to the town after removing 1")




//Marriage
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

//Pregnancy and birth
Adam.age = AGE_MIN_PROCREATE
Eve.age = AGE_MIN_PROCREATE
Adam.impregnate(Eve)
AssertEqual(Eve.pregnancy, 0, "When impregnated successfully, change pregnant from -1 to 0")
num_people_before_birth = Eden.allPeopleNames().length
for (var i = 0; i < TIME_TIL_BIRTH; i++)
  Eve.increaseAge()
AssertEqual(Eden.allPeopleNames().length, num_people_before_birth+1, "Upon bearing children, number of people in town increases by 1")
//p (Eve.attributes.Strength )
//For some reason the parents attributes are doubled?
baby = Eden.lastPerson
AssertEqual(baby.attributes.Strength, Eve.attributes.Strength + Adam.attributes.Strength, "When born, babies have a combination of their mother and father's attributes")


//Assigning a job
Adam.god = Player
Player.assignJob(Adam, "woodsman")
AssertEqual(Player.assignJob(Adam, "woodsman"), true, "God can assign job to people who believe")
AssertEqual(Player.assignJob(Eve, "woodsman"), false, "God cannot assign job to people who don't believe")
//Working
Adam.work(Forest)
Adam.work(Forest)
Adam.work(Forest)
AssertEqual(Adam.work(Forest), true, "People can work if they are assigned a job")
AssertEqual(Eve.work(Forest), false, "People cannot work if they are not assigned a job")


//Building
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


//Farming
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

//console.log(Bob)



//Bob = giveBirth(Eve, Adam, "Bob")
//For all women, there is a chance that they get pregnant based on num of men

// console.log(Eden.people);
