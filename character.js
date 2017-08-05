// God Simulator
// 1. Initialize Life
// 2. Answer Prayers (missions)
// 3. These cause further problems
// 4. Collect currency (faith)
// 5. Use faith to expand your following
// 6. Persuade your followers to commit horrible, horrible atrocities
// 7. Assign jobs to followers -
// Clergy (Give Faith)
// Woodsman (Builds houses)
// Farmer (grows food)
function AssertEqual(actual, expected, comment) {
  if (actual == expected)
    if (comment !== undefined)
      msg("PASSED: "+ comment)
    else
      msg("passed")
  else {
    if (comment !== undefined)
      msg("FAILED: expected: " + expected.toString() + ", actual: " + actual.toString() + ", " + comment)
    else {
      msg("FAILED: expected: " + expected.toString() + ", actual: " + actual.toString())
    }

  }

}

var COST_WOOD_FARM = 1
var TIME_TIL_BIRTH = 1
var AGE_MIN_PROCREATE = 16

function Town() {
  this.people = []
  this.farms = 0
  this.houses = 0
  this.wood = 0
  this.food = 0
}
function Nature (type) {
  //Disease
  //Events
  //Provides food/wood/resources
  this.type = type
  this.food = 100
  this.wood = 100
  this.weatherRain = function(intensity) {

  }
}
function Person(name, mother, father, gender, town) {
  this.name = name
  this.mother = mother
  this.father = father
  this.gender = gender
  this.town = town
  town.people.push(this)
  this.age = 0
  this.god = null //the god they serve
  this.job = null

  this.buildQueue = []
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
      newborn = new Person(childname, this.name, this.spermdoner.name, gender, this.town)
      this.spermdoner = null
      this.pregnancy = -1
    }
  }
  else {
    this.impregnate = function(person) {
      if (this.age >= AGE_MIN_PROCREATE && person.gender === "f" && person.age >= AGE_MIN_PROCREATE && person.pregnancy < 0){
        person.spermdoner = this
        person.pregnancy = 0
        return true
      }
      else {
        msg("This person cannot be impregnated")
        return false
      }
    }
  }
  this.increaseAge = function () {
    this.age+=1
    if (this.gender === "f") {
      if (this.pregnancy >= 0)
        this.pregnancy += 1 //increase 'age' of pregnancy
      if (this.pregnancy >= TIME_TIL_BIRTH)
        this.giveBirth()
    }
  }
  this.work = function(workedObject) {
    switch(this.job) {
      case "clergy":

      break
      case "builder":
        if (this.buildQueue.length > 0) {
          if (this.buildQueue[0] === "farm" && town.wood >= COST_WOOD_FARM) {
            town.wood -= COST_WOOD_FARM
            town.farms += 1
            this.buildQueue.shift()//remove from queue
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
  this.buildOrder = function(town, person, building) {
    if (town === undefined || person === undefined || building == undefined)
      return false
    if (person.job != "builder")
      return false

    if (building === "farm" && town.wood >= COST_WOOD_FARM) {
      person.buildQueue.push(building)
      return true
    }
    return false
  }
}

function msg(str) {
  console.log(str.toString())
}
Player = new God()
Eden = new Town()
Forest = new Nature("forest")
Adam = new Person("Adam", null, null, "m", Eden)
Eve = new Person("Eve", null, null, "f", Eden)


// Eve.spermdoner = Adam
// Eve.pregnancy = 8

//Eden.people.push(Adam)
//Eden.people.push(Eve)

//Pregnancy
Adam.age = AGE_MIN_PROCREATE
Eve.age = AGE_MIN_PROCREATE
Adam.impregnate(Eve)
AssertEqual(Eve.pregnancy, 0, "When impregnated successfully, change pregnant from -1 to 0")
num_people_before_birth = Eden.people.length
for (var i = 0; i < TIME_TIL_BIRTH; i++)
  Eve.increaseAge()
AssertEqual(Eden.people.length, num_people_before_birth+1, "Upon bearing children, number of people in town increases by 1")
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
Player.buildOrder(Eden, Eve, "farm")
Eve.work()
AssertEqual(Eden.farms, 1, "People can build given the materials and order")
Eve.work()
AssertEqual(Eden.farms, 1, "People cannot build without enough materials")
Eden.wood = COST_WOOD_FARM
Eve.work()
AssertEqual(Eden.farms, 1, "People will not build without a build order")

//Farming
Bob = new Person("Bob", Adam, Eve, "m", Eden)
Bob.age = 21
Bob.god = Player
Player.assignJob(Bob, "farmer")
current_food = Bob.town.food
Bob.work()
AssertEqual(Bob.town.food, current_food+Bob.town.farms, "Food increases proportional to number of farms when worked")





//Bob = giveBirth(Eve, Adam, "Bob")
//For all women, there is a chance that they get pregnant based on num of men

// console.log(Eden.people);
