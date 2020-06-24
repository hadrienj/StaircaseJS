function Staircase(stairs) {
  this.stairs = {};
  for (var i in stairs) {
    this.stairs[i] = stairs[i];
    this.stairs[i].name = i;
    // Check minimum requirements: first value and stepSize
    if (typeof stairs[i].firstVal==="undefined") {
        throw new Error("No firstVal specified for "+i);
    } else if (stairs[i].hasOwnProperty("firstVal")) {
      this.stairs[i].firstVal = stairs[i].firstVal;
    }
    if (typeof stairs[i].stepSizeDown==="undefined") {
      throw new Error("No stepSizeDown specified for "+i);
    } else {
      this.stairs[i].stepSizeDown = stairs[i].stepSizeDown;
    }
    if (typeof stairs[i].stepSizeUp==="undefined") {
      throw new Error("No stepSizeUp specified for "+i);
    } else {
      this.stairs[i].stepSizeUp = stairs[i].stepSizeUp;
    }
    // NOTE: easier is always 'up', even if it is a numerical decrease in val
    this.stairs[i].down = stairs[i].down || 1; // N-down in 'wait' mode, LEGACY: scales stepSize when doing down-steps (getting harder) in 'no-wait' mode
    this.stairs[i].up = stairs[i].up || 1; // N-up in 'wait' mode, LEGACY: scale stepSize when doing up-steps (getting easier) in 'no-wait' mode
    this.stairs[i].direction = stairs[i].direction || -1; // -1: lower val is harder | 1: lower val is easier
    this.stairs[i].reversalLimit = stairs[i].reversalLimit || 0; // Maximum reversals before settling on the final value. 0: infinite
    this.stairs[i].limits = stairs[i].limits || false;
    this.stairs[i].operation = stairs[i].operation || 'add'; // Modes: 'add' | 'multiply'
    this.stairs[i].wait = stairs[i].wait || 1;
    this.stairs[i].val = stairs[i].val || [this.stairs[i].firstVal]; // If necessary a history of values can be inserted using val
    this.stairs[i].active = stairs[i].active || (false); // A random staircase is activated using Staircase.init() so they all start disabled by default
    this.stairs[i].sameStairMax = stairs[i].sameStairMax || -1; // For external use only, see readme
    this.stairs[i].limitReached = stairs[i].limitReached || false; // External use only
    this.stairs[i].reversals = stairs[i].reversals || 0; // External use only
    this.stairs[i].successiveGood = stairs[i].successiveGood || 0;
    this.stairs[i].successiveBad = stairs[i].successiveBad || 0;
    this.stairs[i].sameStairCount = stairs[i].sameStairCount || 0;
    this.stairs[i].verbosity = stairs[i].verbosity || 0; // Logging verbosity: 0-off; 1-on
    if(this.stairs[i].verbosity>0) {
        console.log("Built staircase '"+this.stairs[i].name+"' ("+this.stairs[i].operation+"): Start="+this.stairs[i].firstVal+"; StepSize="+this.stairs[i].stepSize+"; Limits=["+this.stairs[i].limits[0]+", "+this.stairs[i].limits[1]+"]");
    }
  }
  this.tasks = {
    easier: { // easier is 'up'
      add: {
        noWait: {
          '1': function(stair) {
            stair.successiveGood = 0;
            stair.successiveBad++;
            return stair.val[stair.val.length-1]-stair.stepSizeDown*(stair.stepSizeDown/stair.up);
          },
          '-1': function(stair) {
            stair.successiveGood = 0;
            stair.successiveBad++;
            return stair.val[stair.val.length-1]+stair.stepSizeUp*(stair.stepSizeUp/stair.up);
          },
        },
        wait: {
          '1': function(stair) {
            stair.successiveGood = 0;
            stair.successiveBad++;
            if (stair.successiveBad>=stair.up) {
              // change value only if sufficient successive good values
              return stair.val[stair.val.length-1]-stair.stepSizeDown;
            } else {
              return stair.val[stair.val.length-1];
            }
          },
          '-1': function(stair) {
            stair.successiveGood = 0;
            stair.successiveBad++;
            if (stair.successiveBad>=stair.up) {
              // change value only if sufficient successive good values
              return stair.val[stair.val.length-1]+stair.stepSizeUp;
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
              (Math.pow(stair.stepSizeDown, stair.down/stair.up));
          },
          '-1': function(stair) {
            stair.successiveGood = 0;
            stair.successiveBad++;
            return stair.val[stair.val.length-1] * stair.stepSizeUp;
          },
        },
        wait: {
          '1': function(stair) {
            stair.successiveGood = 0;
            stair.successiveBad++;
            if (stair.successiveBad>=stair.up) {
              // change value only if sufficient successive good values
              return stair.val[stair.val.length-1]/stair.stepSizeDown;
            } else {
              return stair.val[stair.val.length-1];
            }
          },
          '-1': function(stair) {
            stair.successiveGood = 0;
            stair.successiveBad++;
            if (stair.successiveBad>=stair.up) {
              // change value only if sufficient successive good values
              return stair.val[stair.val.length-1]*stair.stepSizeUp;
            } else {
              return stair.val[stair.val.length-1];
            }
          },
        }
      },
    },
    harder: { // harder is 'down'
      add: {
        wait: {
          '1': function(stair) {
            stair.sameStairCount++;
            stair.successiveGood++;
            stair.successiveBad = 0;
            if (stair.successiveGood>=stair.down) {
              return stair.val[stair.val.length-1]+stair.stepSizeUp;
            } else {
              return stair.val[stair.val.length-1];
            }
          },
          '-1': function(stair) {
            stair.sameStairCount++;
            stair.successiveGood++;
            stair.successiveBad = 0;
            if (stair.successiveGood>=stair.down) {
              return stair.val[stair.val.length-1]-stair.stepSizeDown;
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
            return stair.val[stair.val.length-1]+stair.stepSizeUp*(stair.stepSizeUp/stair.down);
          },
          '-1': function(stair) {
            stair.sameStairCount++;
            stair.successiveGood++;
            stair.successiveBad = 0;
            return stair.val[stair.val.length-1]-stair.stepSizeDown*(stair.stepSize/stair.down);
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
              return stair.val[stair.val.length-1]*stair.stepSizeUp;
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
              return stair.val[stair.val.length-1]/stair.stepSizeDown;
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
            return stair.val[stair.val.length-1] * stair.stepSizeUp;
          },
          '-1': function(stair) {
            stair.sameStairCount++;
            stair.successiveGood++;
            stair.successiveBad = 0;
            return stair.val[stair.val.length-1] / (Math.pow(stair.stepSizeDown, stair.up/stair.down));
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
  if(!goodAns)
    stair.startingExplorationScale = 1; // First time we get easier we stop the inital exploration scaling.
  var wait = (stair.wait)
    ? 'wait'
    : 'noWait';
  if(stair.verbosity>0)
    console.log("Staircase '"+stair.name+"' ("+stair.operation+"): making test "+ans+", "+wait+" mode.");
  var out = this.tasks[ans][stair.operation][wait][stair.direction](stair);
  return out;
};
Staircase.prototype.checkLimits = function (currentStair) {
  var stair = currentStair;
  // check limits
  if (stair.val[stair.val.length - 1] < stair.val[stair.val.length - 2] &&
    stair.val[stair.val.length - 1] < stair.limits[0]) {
    stair.val[stair.val.length - 1] = stair.limits[0];
    stair.limitReached = true;
  } else if (stair.val[stair.val.length - 1] > stair.val[stair.val.length - 2] &&
    stair.val[stair.val.length - 1] > stair.limits[1]) {
    stair.val[stair.val.length - 1] = stair.limits[1];
    stair.limitReached = true;
  } else {
    stair.limitReached = false;
  }
};
Staircase.prototype.next = function (goodAns) {
  this.checkErr.ARG('next', arguments, 1);
  // find the active stair
  var stair = this.getActive();
  stair.val[stair.val.length] = this.choose(goodAns);
  this.checkLimits(stair);
  return stair.val[stair.val.length-1];
};
Staircase.prototype.init = function () {
  var choices = [];
  // deactivate all other staircases
  for (var i in this.stairs) {
    if (this.stairs[i].active) {
      this.deactivate(i);
    }
    // choose among unlock staircases only
    if (!this.stairs[i].lock) {
      choices[choices.length] = i;
    }
  }
  // choose one stair to activate
  var rand = randInt(0, choices.length-1);
  this.activate(choices[rand]);
  return this;
};
Staircase.prototype.changeActive = function () {
  var possibleStairs = [];
  for (var i in this.stairs) {
    if (!this.stairs[i].active && !this.stairs[i].lock) {
      possibleStairs[possibleStairs.length] = i;
    } else if (this.stairs[i].active) {
        this.deactivate(i);
    }
  }
  var rand = randInt(0, possibleStairs.length-1);
  this.activate(possibleStairs[rand]);
};
Staircase.prototype.setsameStairMax = function (max, stair) {
  this.checkErr.ARG('setsameStairMax', arguments, 2);
  this.checkErr.UNDEFINED(this.stairs, stair);
  return this.stairs[stair].sameStairMax = max;
};
Staircase.prototype.get = function (stair) {
  this.checkErr.ARG('get', arguments, 1);
  this.checkErr.UNDEFINED(this.stairs, stair);
  return this.stairs[stair].val;
};
Staircase.prototype.getLast = function (stair) {
  this.checkErr.ARG('getLast', arguments, 1);
  this.checkErr.UNDEFINED(this.stairs, stair);
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
  this.checkErr.ARG('activate', arguments, 1);
  this.checkErr.UNDEFINED(this.stairs, stair);
  this.stairs[stair].active = true;
  if(this.stairs[stair].verbosity>0)
    console.log("Staircase '"+this.stairs[stair].name+"' now active");
};
Staircase.prototype.deactivate = function (stair) {
  this.checkErr.ARG('deactivate', arguments, 1);
  this.checkErr.UNDEFINED(this.stairs, stair);
  this.stairs[stair].active = false;
  if(this.stairs[stair].verbosity>0)
    console.log("Staircase '"+this.stairs[stair].name+"' deactivated");
};
Staircase.prototype.resetCounts = function(stair) {
  this.stairs[stair].sameStairCount = 0;
  this.stairs[stair].successiveGood = 0;
  this.stairs[stair].limitReached = false;
};
Staircase.prototype.isActive = function (stair) {
  this.checkErr.ARG('isActive', arguments, 1);
  this.checkErr.UNDEFINED(this.stairs, stair);
  return this.stairs[stair].active;
};
Staircase.prototype.active = function (stair) {
  this.checkErr.ARG('active', arguments, 1);
  this.checkErr.UNDEFINED(this.stairs, stair);
  for (var i in this.stairs) {
    if (this.stairs[i].active) {
      return i;
    }
  }
};
Staircase.prototype.lock = function (stair) {
  this.checkErr.ARG('lock', arguments, 1);
  this.checkErr.UNDEFINED(this.stairs, stair);
  this.stairs[stair].lock = true;
};
Staircase.prototype.unlock = function (stair) {
  this.checkErr.ARG('unlock', arguments, 1);
  this.checkErr.UNDEFINED(this.stairs, stair);
  this.stairs[stair].lock = false;
};
Staircase.prototype.isLocked = function (stair) {
  this.checkErr.ARG('isLocked', arguments, 1);
  this.checkErr.UNDEFINED(this.stairs, stair);
  return this.stairs[stair].lock;
};
Staircase.prototype.setVal = function (stair, val) {
  this.checkErr.ARG('setVal', arguments, 2);
  this.checkErr.UNDEFINED(this.stairs, stair);
  this.stairs[stair].val[this.stairs[stair].val.length] = val;
};
Staircase.prototype.getReversals = function (stair) {
    this.checkErr.ARG('getFinalVal', arguments, 1);
    this.checkErr.UNDEFINED(this.stairs, stair);
    // Find the inflection points
    var reversals = []; // start with the first value
    var direction = this.stairs[stair].direction*-1; // start the search getting harder
    for(var i=1;i<this.stairs[stair].val.length;i++) {
        if((direction==1 && this.stairs[stair].val[i]>this.stairs[stair].val[i-1]) ||
            (direction==-1 && this.stairs[stair].val[i]<this.stairs[stair].val[i-1])) {
            reversals[reversals.length] = this.stairs[stair].val[i-1]; // record reversal
            direction = direction*-1; // reverse search direction
        }
    }
    reversals.shift(); // first reversal doesn't count
    return reversals;
}
Staircase.prototype.reversalLimitReached = function (stair) {
    this.checkErr.ARG('getFinalVal', arguments, 1);
    this.checkErr.UNDEFINED(this.stairs, stair);
    var reversals = this.getReversals(stair);
    return (reversals.length>=this.stairs[stair].reversalLimit && this.stairs[stair].reversalLimit!==0);
}
Staircase.prototype.getFinalVal = function (stair) {
    this.checkErr.ARG('getFinalVal', arguments, 1);
    this.checkErr.UNDEFINED(this.stairs, stair);
    var reversals = this.getReversals(stair);
    if(!reversals.length)
        throw new Error("Staircase '"+this.stairs[stair].name+"': Not enough reversals to calculate final value.");
    var sum = 0;
    for(var i=0;i<reversals.length;i++)
        sum = sum + reversals[i];
    return sum/reversals.length; // Convergence value is the mean of the reversal points
}

var Staircase_CheckErr = function() {};
Staircase_CheckErr.prototype.UNDEFINED = function(thisStairs, stair) {
  if (thisStairs[stair]===undefined) {
    throw new Error("Unable to find the staircase '"+stair+"'")
  }
};
Staircase_CheckErr.prototype.ARG = function(func, arg, argNum) {
  if (arg.length===0) {
    throw new Error("Wrong number of arguments for the method '"+func+"'"
      +". Required: "+argNum);
  }
};

Staircase.prototype.checkErr = new Staircase_CheckErr(); // Set up the error checker

// Returns a random integer between min (inclusive) and max (inclusive)
// Using Math.round() will give you a non-uniform distribution!
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
