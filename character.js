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

function Town() {
  this.people = []
  this.wood = 0
  this.food = 0
}
function Person(name, mother, father, gender, town) {
  this.name=name
  this.age=0
  this.mother=mother
  this.father=father
  this.gender=gender
  this.job=null
  this.town=town
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
      newborn = new Person(childname, this.name, this.spermdoner.name, gender, this.town)
      this.town.people.push(newborn)
      this.spermdoner = null
      this.pregnancy = -1
    }
  }
  else {
    this.impregnate = function(person) {
      if (this.age > 16 && person.gender === "f" && person.age > 16 && person.pregnancy < 0){
        person.spermdoner = this
        person.pregnancy = 0
      }
      else {
        msg("This person cannot be impregnated")
      }
    }
  }
  this.increaseAge = function () {
    this.age+=1
    if (this.gender === "f") {
      if (this.pregnancy >= 0)
        this.pregnancy += 1 //increase 'age' of pregnancy
      if (this.pregnancy > 8)
        this.giveBirth()
    }
  }
  this.work = function() {
    switch(this.job) {
      case "clergy":

      break
      case "woodsman":
        this.town.wood += 1
      break
      case "farmer":
        this.town.food += 1
      break
    }
  }
}
function God () {
  this.alignment = 0 //negative evil, positive good
  this.followers = 0
  this.faith = 0
  this.assignJob = function(person, job) {
    person.job = job
  }
}
function msg(str) {
  console.log(str.toString())
}
Player = new God()
Eden = new Town()
Adam = new Person("Adam", null, null, "m", Eden)
Eve = new Person("Eve", null, null, "f", Eden)


// Eve.spermdoner = Adam
// Eve.pregnancy = 8
Adam.age = 21
Eve.age = 20
// Player.impregnate(Eve)
Adam.impregnate(Eve)
i = 0
while (i < 10) {
  Eve.increaseAge()
  i+=1
}
Eden.people.push(Adam)
Eden.people.push(Eve)
Player.assignJob(Adam, "woodsman")
Adam.work()
Adam.work()
Adam.work()
msg(Eden.wood)
//Bob = giveBirth(Eve, Adam, "Bob")
//For all women, there is a chance that they get pregnant based on num of men

// console.log(Eden.people);
