function Staircase(stairs) {
  this.stairs = {};
  for (var i in stairs) {
    this.stairs[i] = stairs[i];
    this.stairs[i].name = i;
    this.stairs[i].val = [this.stairs[i].firstVal];
    this.stairs[i].active = false;
    this.stairs[i].limitReached = false;
    this.stairs[i].countSuccGood = 0;
    this.stairs[i].sameStairCount = 0;
  }
};
Staircase.prototype.next = function (goodAns) {
  if (arguments.length===0) {
    throw new Error("Argument is needed to compute the next value of the "+
      "staircase")
  }
  // find the active stair
  for (var i in this.stairs) {
    if (this.stairs[i].active) {
      var stair = this.stairs[i];
    }
  }
  function decreaseVal() {
    if (stair.operation === 'multiply') {
      stair.val[stair.val.length] = stair.val[stair.val.length-1] /
      (Math.pow(stair.factor, 1/stair.down));
    } else if (stair.operation === 'add') {
      stair.val[stair.val.length] = stair.val[stair.val.length-1] -
      (Math.pow(stair.factor, 1/stair.down));
    } else {
      throw new Error("The option '"+stair.operation+"' is not recognized"+
        "(takes only 'multiply' or 'add'.");
    }
    // check limits
    if (stair.val[stair.val.length-1]<stair.limits[0]) {
    	console.log('limits decr', stair.val[stair.val.length-1]);
      stair.val[stair.val.length-1] = stair.limits[0];
      stair.limitReached = true;
    } else {
    	console.log('no limits dec', stair.val[stair.val.length-1]);
      stair.limitReached = false;
    }
  };
  function increaseVal() {
    if (stair.operation === 'multiply') {
      stair.val[stair.val.length] = stair.val[stair.val.length-1]*stair.factor;
    } else if (stair.operation === 'add' && stair.countSuccGood>=stair.down) {
      stair.val[stair.val.length] = stair.val[stair.val.length-1]+stair.factor;
    } else {
      throw new Error("The option '"+stair.operation+
        "' is not recognized (takes" + " only 'multiply' or 'add'.");
    }
    // check limits
    if (stair.val[stair.val.length-1]>stair.limits[1]) {
    	console.log('limits inc', stair.val[stair.val.length-1]);
      stair.val[stair.val.length-1] = stair.limits[1];
      stair.limitReached = true;
    } else {
    	console.log('no limits inc', stair.val[stair.val.length-1]);
      stair.limitReached = false;
    }
  };
  if (goodAns && stair.direction===-1) {
    // right answer and number of last right answers > down
    stair.countSuccGood++;
    if (stair.operation === 'add' && stair.countSuccGood<stair.down) {
    	console.log('not enough good!');
    	console.log('same stair', stair.sameStairCount);
    	console.log('count succes', stair.countSuccGood);
    } else {
    	console.log('good, will decrease');
    	stair.sameStairCount++;
    	decreaseVal();
    }
  } else if (goodAns && stair.direction===1) {
    // right answer and number of last right answers > down
    stair.countSuccGood++;
    if (stair.operation === 'add' && stair.countSuccGood<stair.down) {
    	console.log('not enough good!');
    	console.log('same stair', stair.sameStairCount);
    	console.log('count succes', stair.countSuccGood);
    } else {
    	console.log('good, will increase');
    	stair.sameStairCount++;
    	increaseVal();
    }
  } else if (!goodAns && stair.direction===-1) {
    // answer is wrong
    console.log('not good, will increase');
    increaseVal();
  } else if (!goodAns && stair.direction===1) {
    // answer is wrong
    console.log('not good, will decrease');
    decreaseVal();
  }
  return stair.val[stair.val.length-1];
};
Staircase.prototype.init = function () {
  var choices = [];
  // deactivate all other staircases
  for (var i in this.stairs) {
    if (this.stairs[i].active) {
      this.stairs[i].active = false;
    }
    // choose among unlock staircases only
    if (!this.stairs[i].lock) {
      choices[choices.length] = i;
    }
  }
  // choose one stair to activate
  var rand = randInt(0, choices.length-1);
  this.stairs[choices[rand]].active = true;
};
Staircase.prototype.changeActive = function () {
  var possibleStairs = [];
  for (var i in this.stairs) {
    if (!this.stairs[i].active && !this.stairs[i].lock) {
      possibleStairs[possibleStairs.length] = i;
    } else if (this.stairs[i].active) {
      this.stairs[i].active = false;
      this.stairs[i].sameStairCount = 0;
      this.stairs[i].countSuccGood = 0;
      this.stairs[i].limitReached = false;
    }
  }
  var rand = randInt(0, possibleStairs.length-1);
  this.stairs[possibleStairs[rand]].active = true;
};
Staircase.prototype.setsameStairMax = function (max, stair) {
  return this.stairs[stair].sameStairMax = max;
};
Staircase.prototype.get = function (stair) {
  return this.stairs[stair].val;
};
Staircase.prototype.getLast = function (stair) {
  return this.stairs[stair].val[this.stairs[stair].val.length-1];
};
Staircase.prototype.getActive = function () {
  for (var i in this.stairs) {
    if (this.stairs[i].active) {
      return this.stairs[i];
    }
  }
};
Staircase.prototype.activate = function (stair) {
  this.stairs[stair].active = true;
};
Staircase.prototype.deactivate = function (stair) {
  this.stairs[stair].active = false;
};
Staircase.prototype.isActive = function (stair) {
  return this.stairs[stair].active;
};
Staircase.prototype.active = function (stair) {
  for (var i in this.stairs) {
    if (this.stairs[i].active) {
      return i;
    }
  }
};
Staircase.prototype.lock = function (stair) {
  this.stairs[stair].lock = true;
};
Staircase.prototype.unlock = function (stair) {
  this.stairs[stair].lock = false;
};
Staircase.prototype.isLocked = function (stair) {
  return this.stairs[stair].lock;
};
Staircase.prototype.setVal = function (stair, val) {
  this.stairs[stair].val[this.stairs[stair].val.length] = val;
};

// Returns a random integer between min (inclusive) and max (inclusive)
// Using Math.round() will give you a non-uniform distribution!
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};