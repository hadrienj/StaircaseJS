function Staircase(stairs, opts) {
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
      stair.val[stair.val.length-1] = stair.limits[0];
      stair.limitReached = true;
    } else {
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
      stair.val[stair.val.length-1] = stair.limits[1];
      stair.limitReached = true;
    } else {
      stair.limitReached = false;
    }
  };
  if (goodAns && stair.direction===-1) {
    // right answer and number of last right answers > down
    stair.countSuccGood++;
    if (stair.operation === 'add' && stair.countSuccGood<stair.down) {

    } else {
    	stair.sameStairCount++;
    	decreaseVal();
    }
  } else if (goodAns && stair.direction===1) {
    // right answer and number of last right answers > down
    stair.countSuccGood++;
    if (stair.operation === 'add' && stair.countSuccGood<stair.down) {

    } else {
    	stair.sameStairCount++;
    	increaseVal();
    }
  } else if (!goodAns && stair.direction===-1) {
    // answer is wrong
    increaseVal();
  } else if (!goodAns && stair.direction===1) {
    // answer is wrong
    decreaseVal();
  }
  return stair.val[stair.val.length-1];
};
Staircase.prototype.init = function () {
  // deactivate all other staircases
  for (var i in this.stairs) {
    if (this.stairs[i].active) {
      this.stairs[i].active = false;
    }
  }
  // choose one stair to activate
  var rand = randInt(0, Object.keys(this.stairs).length-1);
  this.stairs[Object.keys(this.stairs)[rand]].active = true;
};
Staircase.prototype.changeActive = function () {
  var possibleStairs = [];
  for (var i in this.stairs) {
    if (!this.stairs[i].active) {
      possibleStairs[possibleStairs.length] = i;
    } else {
      this.stairs[i].active = false;
      this.stairs[i].sameStairCount = 0;
      this.stairs[i].countSuccGood = 0;
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