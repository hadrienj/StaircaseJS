/*
COMPLETE:
    1) Fix checkErr by moving it inside Staircase function
    2) Allow for different up/down step sizes
    3) Add defaults for most values
    4) Tidy randInt into Staircase
    5) Add larger jumps for initial space exploration

TODO:
    6) Improve documentation?
*/
function Staircase(stairs) {
  this.stairs = {};
  for (var i in stairs) {
    this.stairs[i] = stairs[i];
    this.stairs[i].name = i;
    // Check minimum requirements: first value and factor
    if (typeof stairs[i].firstVal=="undefined")
        throw new Error("No firstVal specified for "+i);
    else
        this.stairs[i].firstVal = stairs[i].firstVal;
    if (typeof stairs[i].factor=="undefined")
        throw new Error("No factor specified for "+i);
    else
        this.stairs[i].factor = stairs[i].factor;
    // Everything else we can derive sensible defaults for on the basis of
    // first value and step size if not specified
    // NOTE: easier is always 'up', even if it is a numerical decrease in val
    this.stairs[i].down = stairs[i].down || 1; // N-down in 'wait' mode, LEGACY: scales factor when doing down-steps (getting harder) in 'no-wait' mode
    this.stairs[i].up = stairs[i].up || 1; // N-up in 'wait' mode, LEGACY: scale factor when doing up-steps (getting easier) in 'no-wait' mode
    this.stairs[i].downUpRatio = stairs[i].downUpRatio || 1; // delta-Down/delta-Up (with the x-up,y-down rule controls the convergence point). Not implemented for 'multiply' mode
    this.stairs[i].direction = stairs[i].direction || 1; // -1: lower val is easier | 1: lower val is harder
    this.stairs[i].reversalLimit = stairs[i].reversalLimit || 0; // Maximum reversals before settling on the final value. 0: infinite
    this.stairs[i].limits = stairs[i].limits || [stairs[i].firstVal-10*stairs[i].factor, stairs[i].firstVal+10*stairs[i].factor];
    this.stairs[i].operation = stairs[i].operation || 'add'; // Modes: 'add' | 'multiply'
    this.stairs[i].wait = stairs[i].wait || (this.stairs[i].down!=this.stairs[i].up); // By default we wait if up and down are different
    this.stairs[i].val = stairs[i].val || [this.stairs[i].firstVal]; // If necessary a history of values can be inserted using val
    this.stairs[i].active = stairs[i].active || (false); // A random staircase is activated using Staircase.init() so they all start disabled by default
    this.stairs[i].sameStairMax = stairs[i].sameStairMax || -1; // For external use only, see readme
    this.stairs[i].limitReached = stairs[i].limitReached || false; // External use only
    this.stairs[i].reversals = stairs[i].reversals || 0; // External use only
    this.stairs[i].successiveGood = stairs[i].successiveGood || 0;
    this.stairs[i].successiveBad = stairs[i].successiveBad || 0;
    this.stairs[i].sameStairCount = stairs[i].sameStairCount || 0;
    this.stairs[i].startingExplorationScale = stairs[i].startingExplorationScale || 1; // Scale factor by this much before the first reversal
  }
  this.tasks = {
    easier: { // easier is 'up'
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
    harder: { // harder is 'down'
      add: {
        wait: {
          '1': function(stair) {
            stair.sameStairCount++;
            stair.successiveGood++;
            stair.successiveBad = 0;
            if (stair.successiveGood>=stair.down) {
              return stair.val[stair.val.length-1]+stair.factor*stair.downUpRatio*stair.startingExplorationScale;
            } else {
              return stair.val[stair.val.length-1];
            }
          },
          '-1': function(stair) {
            stair.sameStairCount++;
            stair.successiveGood++;
            stair.successiveBad = 0;
            if (stair.successiveGood>=stair.down) {
              return stair.val[stair.val.length-1]-stair.factor*stair.downUpRatio*stair.startingExplorationScale;
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
            return stair.val[stair.val.length-1]+stair.factor*(stair.factor/stair.down)*stair.downUpRatio*stair.startingExplorationScale; // stair.factor/stair.down and stair.downUpRatio do the same thing but both are present for legacy reasons
          },
          '-1': function(stair) {
            stair.sameStairCount++;
            stair.successiveGood++;
            stair.successiveBad = 0;
            return stair.val[stair.val.length-1]-stair.factor*(stair.factor/stair.down)*stair.downUpRatio*stair.startingExplorationScale; // stair.factor/stair.down and stair.downUpRatio do the same thing but both are present for legacy reasons
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
              return stair.val[stair.val.length-1]*stair.factor*stair.startingExplorationScale;
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
              return stair.val[stair.val.length-1]/stair.factor*stair.startingExplorationScale;
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
            return stair.val[stair.val.length-1] * stair.factor*stair.startingExplorationScale;
          },
          '-1': function(stair) {
            stair.sameStairCount++;
            stair.successiveGood++;
            stair.successiveBad = 0;
            return stair.val[stair.val.length-1] / (Math.pow(stair.factor*stair.startingExplorationScale, stair.up/stair.down));
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
  return this.tasks[ans][stair.operation][wait][stair.direction](stair);
};
Staircase.prototype.checkLimits = function(stair) {
  this.checkErr.ARG('checkLimits', arguments, 1);
  this.checkErr.UNDEFINED(this.stairs, stair);
    if(this.stairs[stair].val.length<2)
        return;
  // check limits
    if (this.stairs[stair].val[this.stairs[stair].val.length-1]<this.stairs[stair].val[this.stairs[stair].val.length-2] &&
        this.stairs[stair].val[this.stairs[stair].val.length-1]<this.stairs[stair].limits[0]) {
      this.stairs[stair].val[this.stairs[stair].val.length-1] = this.stairs[stair].limits[0];
      this.stairs[stair].limitReached = true;
    } else if (this.stairs[stair].val[this.stairs[stair].val.length-1]>this.stairs[stair].val[this.stairs[stair].val.length-2] &&
        this.stairs[stair].val[this.stairs[stair].val.length-1]>this.stairs[stair].limits[1]) {
      this.stairs[stair].val[this.stairs[stair].val.length-1] = this.stairs[stair].limits[1];
      this.stairs[stair].limitReached = true;
    } else {
      this.stairs[stair].limitReached = false;
    }
};
Staircase.prototype.next = function (goodAns) {
  this.checkErr.ARG('next', arguments, 1);
  // find the active stair
  var stair = this.getActive();
  stair.val[stair.val.length] = this.choose(goodAns);
  this.checkLimits(stair.name);
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
  var rand = this.randInt(0, choices.length-1);
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
  var rand = this.randInt(0, possibleStairs.length-1);
  this.stairs[possibleStairs[rand]].active = true;
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
};
Staircase.prototype.deactivate = function (stair) {
  this.checkErr.ARG('deactivate', arguments, 1);
  this.checkErr.UNDEFINED(this.stairs, stair);
  this.stairs[stair].active = false;
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
            reversals[reversals.length] = this.stairs[stair].val[i-1];
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
        throw new Error(stair+": Not enough reversals to calculate final value.");
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
Staircase.prototype.randInt = function (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
