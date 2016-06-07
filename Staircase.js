function Staircase(stairs) {
  this.stairs = {};
  for (var i in stairs) {
    this.stairs[i] = stairs[i];
    this.stairs[i].firstVal = stairs[i].firstVal;
    this.stairs[i].down = stairs[i].down;
    this.stairs[i].up = stairs[i].up || 1;
    this.stairs[i].factor = stairs[i].factor;
    this.stairs[i].direction = stairs[i].direction;
    this.stairs[i].limits = stairs[i].limits;
    this.stairs[i].operation = stairs[i].operation;
    this.stairs[i].wait = stairs[i].wait || false;
    this.stairs[i].sameStairMax = stairs[i].sameStairMax;
    this.stairs[i].name = i;
    this.stairs[i].val = stairs[i].val || [this.stairs[i].firstVal];
    this.stairs[i].active = stairs[i].active || false;
    this.stairs[i].limitReached = stairs[i].limitReached || false;
    this.stairs[i].successiveGood = stairs[i].successiveGood || 0;
    this.stairs[i].successiveBad = stairs[i].successiveBad || 0;
    this.stairs[i].sameStairCount = stairs[i].sameStairCount || 0;
  }
  this.tasks = {
    easier: {
      add: {
        noWait: {
          '1': function(stair) {
            stair.successiveGood = 0;
            stair.successiveBad++;
            return stair.val[stair.val.length-1]-stair.factor*(stair.factor/stair.up);
          },
          '-1': function(stair) {
            stair.successiveGood = 0;
            stair.successiveBad++;
            return stair.val[stair.val.length-1]+stair.factor*(stair.factor/stair.up);
          },
        },
        wait: {
          '1': function(stair) {
            stair.successiveGood = 0;
            stair.successiveBad++;
            if (stair.successiveBad>=stair.up) {
              // change value only if sufficient successive good values
              return stair.val[stair.val.length-1]-stair.factor;
            } else {
              return stair.val[stair.val.length-1];
            }
          },
          '-1': function(stair) {
            stair.successiveGood = 0;
            stair.successiveBad++;
            if (stair.successiveBad>=stair.up) {
              // change value only if sufficient successive good values
              return stair.val[stair.val.length-1]+stair.factor;
            } else {
              return stair.val[stair.val.length-1];
            }
          },
        }
      },
      multiply: {
        noWait: {
          '1': function(stair) {
            stair.successiveGood = 0;
            stair.successiveBad++;
            return stair.val[stair.val.length-1] /
              (Math.pow(stair.factor, stair.down/stair.up));
          },
          '-1': function(stair) {
            stair.successiveGood = 0;
            stair.successiveBad++;
            return stair.val[stair.val.length-1] * stair.factor;
          },
        },
        wait: {
          '1': function(stair) {
            stair.successiveGood = 0;
            stair.successiveBad++;
            if (stair.successiveBad>=stair.up) {
              // change value only if sufficient successive good values
              return stair.val[stair.val.length-1]/stair.factor;
            } else {
              return stair.val[stair.val.length-1];
            }
          },
          '-1': function(stair) {
            stair.successiveGood = 0;
            stair.successiveBad++;
            if (stair.successiveBad>=stair.up) {
              // change value only if sufficient successive good values
              return stair.val[stair.val.length-1]*stair.factor;
            } else {
              return stair.val[stair.val.length-1];
            }
          },
        }
      },
    },
    harder: {
      add: {
        wait: {
          '1': function(stair) {
            stair.sameStairCount++;
            stair.successiveGood++;
            stair.successiveBad = 0;
            if (stair.successiveGood>=stair.down) {
              return stair.val[stair.val.length-1]+stair.factor;
            } else {
              return stair.val[stair.val.length-1];
            }
          },
          '-1': function(stair) {
            stair.sameStairCount++;
            stair.successiveGood++;
            stair.successiveBad = 0;
            if (stair.successiveGood>=stair.down) {
              return stair.val[stair.val.length-1]-stair.factor;
            } else {
              return stair.val[stair.val.length-1];
            }
          },
        },
        noWait: {
          '1': function(stair) {
            stair.sameStairCount++;
            stair.successiveGood++;
            stair.successiveBad = 0;
            return stair.val[stair.val.length-1]+stair.factor*(stair.factor/stair.down);
          },
          '-1': function(stair) {
            stair.sameStairCount++;
            stair.successiveGood++;
            stair.successiveBad = 0;
            return stair.val[stair.val.length-1]-stair.factor*(stair.factor/stair.down);
          },
        },
      },
      multiply: {
        wait: {
          '1': function(stair) {
            stair.sameStairCount++;
            stair.successiveGood++;
            stair.successiveBad = 0;
            if (stair.successiveGood>=stair.down) {
              // change value only if sufficient successive good values
              return stair.val[stair.val.length-1]*stair.factor;
            } else {
              return stair.val[stair.val.length-1];
            }
          },
          '-1': function(stair) {
            stair.sameStairCount++;
            stair.successiveGood++;
            stair.successiveBad = 0;
            if (stair.successiveGood>=stair.down) {
              // change value only if sufficient successive good values
              return stair.val[stair.val.length-1]/stair.factor;
            } else {
              return stair.val[stair.val.length-1];
            }
          },
        },
        noWait: {
          '1': function(stair) {
            stair.sameStairCount++;
            stair.successiveGood++;
            stair.successiveBad = 0;
            return stair.val[stair.val.length-1] * stair.factor;
          },
          '-1': function(stair) {
            stair.sameStairCount++;
            stair.successiveGood++;
            stair.successiveBad = 0;
            return stair.val[stair.val.length-1] / (Math.pow(stair.factor, stair.up/stair.down));
          },
        }
      }
    }
  }
};
Staircase.prototype.choose = function(goodAns) {
  var stair = this.getActive();
  var ans = (goodAns)
    ? 'harder'
    : 'easier';
  var wait = (stair.wait)
    ? 'wait'
    : 'noWait';
  return this.tasks[ans][stair.operation][wait][stair.direction](stair);
};
Staircase.prototype.checkLimits = function() {
  // check limits
    if (stair.val[stair.val.length-1]<stair.val[stair.val.length-2] &&
        stair.val[stair.val.length-1]<stair.limits[0]) {
      stair.val[stair.val.length-1] = stair.limits[0];
      stair.limitReached = true;
    } else if (stair.val[stair.val.length-1]>stair.val[stair.val.length-2] &&
        stair.val[stair.val.length-1]>stair.limits[1]) {
      stair.val[stair.val.length-1] = stair.limits[1];
      stair.limitReached = true;
    } else {
      stair.limitReached = false;
    }
};
Staircase.prototype.next = function (goodAns) {
  checkErr.ARG('next', arguments, 1);
  // find the active stair
  var stair = this.getActive();
  stair.val[stair.val.length] = this.choose(goodAns);
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
  return this;
};
Staircase.prototype.changeActive = function () {
  var possibleStairs = [];
  for (var i in this.stairs) {
    if (!this.stairs[i].active && !this.stairs[i].lock) {
      possibleStairs[possibleStairs.length] = i;
    } else if (this.stairs[i].active) {
      this.stairs[i].active = false;
      this.stairs[i].sameStairCount = 0;
      this.stairs[i].successiveGood = 0;
      this.stairs[i].limitReached = false;
    }
  }
  var rand = randInt(0, possibleStairs.length-1);
  this.stairs[possibleStairs[rand]].active = true;
};
Staircase.prototype.setsameStairMax = function (max, stair) {
  checkErr.ARG('setsameStairMax', arguments, 2);
  checkErr.UNDEFINED(this.stairs, stair);
  return this.stairs[stair].sameStairMax = max;
};
Staircase.prototype.get = function (stair) {
  checkErr.ARG('get', arguments, 1);
  checkErr.UNDEFINED(this.stairs, stair);
  return this.stairs[stair].val;
};
Staircase.prototype.getLast = function (stair) {
  checkErr.ARG('getLast', arguments, 1);
  checkErr.UNDEFINED(this.stairs, stair);
  return this.stairs[stair].val[this.stairs[stair].val.length-1];
};
Staircase.prototype.getActive = function () {
  for (var i in this.stairs) {
    if (this.stairs[i].active) {
      return this.stairs[i];
    }
  }
  throw new Error("There is no active staircase. Consider initialize before"+
    " using 'next' method");
};
Staircase.prototype.activate = function (stair) {
  checkErr.ARG('activate', arguments, 1);
  checkErr.UNDEFINED(this.stairs, stair);
  this.stairs[stair].active = true;
};
Staircase.prototype.deactivate = function (stair) {
  checkErr.ARG('deactivate', arguments, 1);
  checkErr.UNDEFINED(this.stairs, stair);
  this.stairs[stair].active = false;
};
Staircase.prototype.isActive = function (stair) {
  checkErr.ARG('isActive', arguments, 1);
  checkErr.UNDEFINED(this.stairs, stair);
  return this.stairs[stair].active;
};
Staircase.prototype.active = function (stair) {
  checkErr.ARG('active', arguments, 1);
  checkErr.UNDEFINED(this.stairs, stair);
  for (var i in this.stairs) {
    if (this.stairs[i].active) {
      return i;
    }
  }
};
Staircase.prototype.lock = function (stair) {
  checkErr.ARG('lock', arguments, 1);
  checkErr.UNDEFINED(this.stairs, stair);
  this.stairs[stair].lock = true;
};
Staircase.prototype.unlock = function (stair) {
  checkErr.ARG('unlock', arguments, 1);
  checkErr.UNDEFINED(this.stairs, stair);
  this.stairs[stair].lock = false;
};
Staircase.prototype.isLocked = function (stair) {
  checkErr.ARG('isLocked', arguments, 1);
  checkErr.UNDEFINED(this.stairs, stair);
  return this.stairs[stair].lock;
};
Staircase.prototype.setVal = function (stair, val) {
  checkErr.ARG('setVal', arguments, 2);
  checkErr.UNDEFINED(this.stairs, stair);
  this.stairs[stair].val[this.stairs[stair].val.length] = val;
};

var CheckErr = function() {};
CheckErr.prototype.UNDEFINED = function(thisStairs, stair) {
  if (thisStairs[stair]===undefined) {
    throw new Error("Unable to find the staircase '"+stair+"'")
  }
};
CheckErr.prototype.ARG = function(func, arg, argNum) {
  if (arg.length===0) {
    throw new Error("Wrong number of arguments for the method '"+func+"'"
      +". Required: "+argNum);
  }
};

// Returns a random integer between min (inclusive) and max (inclusive)
// Using Math.round() will give you a non-uniform distribution!
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};