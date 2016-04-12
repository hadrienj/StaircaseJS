# Background

In psychophysics, perception is often assessed using adaptive procedures (task difficulty is modified according to participants answers). With staircase procedures ([https://en.wikipedia.org/wiki/Psychophysics#Staircase_procedures]()) the stimulus intensity begins high and is reduced when right answers are provided and increased when wrong answers are provided. Several parameters are generally used:

- The equation converting the old value to the new one (according to the answer provided for the old one)
- The number of right answers `n` needed to increase the difficulty (when only one wrong answer will decrease it; corresponds to 1-up, n-down).

The StaircaseJS module can be used to manage the value of a stimulus implementing an adaptive procedure, typically for psychophysical experiments made in JavaScript.

# Usage

Create a new staircase will allow you to store and track the values of the stimulus. The parameters of the staircase (equation used to change the value, 1-up n-down etc.) has to be set when the contructor is instanciated.

## Instanciation

Staircase objects are created using the Staircase constructor with an object as argument:

```javascript
var stair = new Staircase({
  deltaF: {
    firstVal: 100,
    down: 3,
    factor: 1.25,
    limits: [0, 600],
  }
});
```

This object has to contain the name of the staircase as a `key` and its parameters in another object as a `property`. Thus, the form of the argument is:

```js
{
  staircaseName: {
    parameter1: val1,
    parameter2: val2,
    ...
  }
}
```

## Example

### Procedure

In this first example, we will create a `stair` object to manage the frequency of a sound. At each trial, participants hear two sounds and have to tell which one is higher in frequency. One sound has a fixed frequency of 1000Hz and the other has a changing frequency around 1000Hz. The frequency of this second sound is adaptively chosen according to participant's answers.

### Set parameters

```js
var stair = new Staircase({
  deltaF: {
    firstVal: 100,
    down: 2,
    limits: [0, 600],
    factor: 1.25,
  }
});
```

We will set the first value to 100 cents (one semi-tone) and choose a 1-up 2-down procedure (the difficulty will be increased by an amount `x` after 2 right answers and decreased  of this same amount after 1 wrong answer) with the `down` parameter. We also set the limit of the frequency difference between 0 and 600 cents with the `limits` parameter. The `factor` parameter is used to set the amount of change.

Activate the staircase:

```js
stair.init();
```

Provide the answer (right: `true`, wrong: `false`) in the `next` method:

```js
stair.next(goodAnswer);
```

At this time, a new value is stored in the `stair` object depending of the answer. This new value can be used to change the frequency of the sound. We only have to get the value of our `deltaF` staircase:

```js
sound.frequency.value = stair.getLast('deltaF');
```

The historic of the values can be obtained with:

```js
stair.get('deltaF');
// return an array containing all the values
```


## Implementation of the 1-up n-down procedure

These equations are used to implement the 1-up n-down procedure:

- Decreasing (wrong answer): `newValue = oldValue / (Math.pow(factor, 1/down));` and increasing (right answer): `newValue = oldValue * factor;`.

Instead of keeping the same value `n` times and then change the value by `factor`, we change the value each time:

```javascript
// first value = 100
// then good answer
newValue = 100/(Math.pow(1.25, 1/2));
// result = 89.44
// then good answer again
newValue = 89.44/(Math.pow(1.25, 1/2));
// = 80
// then wrong answer
newValue = 80*1.25;
// = 100 (first value)
```

## Multiple staircases

It is possible to use the staircase module to maintain more than one stairecase. To do that, specify multiple objects in the object used to instanciate `Staircase()`.

```js
{
  staircaseName: {
    firstVal: 1,
    down: 3,
    ...
  },
  staircaseName2: {
    firstVal: 2,
    down: 3,
    ...
  },
}
```

### Example

Here is an example of two staircases used to modulate two difficulty parameters in a psychoacoustical task: the frequency difference between two sounds as in the first example and the volume of the sounds.

```javascript
// create a variable containing 2 staircases that will be used in parallel
var stairs = new Staircase({
  deltaF: {
    firstVal: 100,
    down: 2,
    factor: 1.25,
    limits: [0, 600],
  },
  volume: {
    firstVal: 0.5,
    down: 2,
    factor: 1.25,
    limits: [0, 1],
  }
});
```

When the `stairs` variable is initialized, one staircase will be randomly chosen as the active one. A right answer will only increase the difficulty concerning the active staircase.

The method `changeActive()` is used to change the active staircase: the staircase will be deactivated and another one will be activated (again randomly chosen).

For this example, we will implement the two staircases following these rules:

Change the active staircase if:

- the answer is wrong
- there is two much consecutive right answers
- limit of allowed values is reached

The `sameStairMax` option will tell the maximum number of values allowed. Options can be passed as a second object argument in `Staircase()`:


```javascript
// create a variable containing 2 staircases that will be used in parallel
var stairs = new Staircase({
  deltaF: {
    firstVal: 100,
    down: 2,
    factor: 1.25,
    limits: [0, 600],
  },
  volume: {
    firstVal: 0.5,
    down: 2,
    factor: 1.25,
    limits: [0, 1],
  },
},
{
  sameStairMax: 4,
}
);
```

Let's begin by initializing our new `stairs` object:

```js
// Choose randomly the first active staircase
stairs.init();
```

To implement the above conditions we will use different properties of our `stairs` object:

```js
if (stairs.sameStairCount>=stairs.sameStairMax ||
  !goodAnswer ||
  stairs.getActive().limitReached) {
  stairs.changeActive();
}
```

`sameStairCount` is a global variable tracking the number of values in the same staircase. It has to be higher than `sameStairMax`.

The method `getActive()` return the active staircase. We call the property `limitReached` of this staircase. It is true when the actual value reach one bound of the limits set in the parameters.

Finally, `changeActive()` will change the active staircase.

Now the procedure is the same as with one staircase: we call the next value of the updated active staircase:

```js
// goodAns can be true or false
// if it is true, difficulty will be increased
stairs.next(goodAnswer);
```

Finally, we can use the values of our staircases:

```js
sound.vol = stairs.getLast('volume');
sound.frequency.value = stair.getLast('deltaF');
```

## Stairecase parameters:

These parameters can be used to instanciate `Staircase()`:

- `firstVal`: the first value of the variable.
- `down`: how many good answers are required to match one bad answer. For instance, if `down=2` the value will decrease (or increase according to the direction of the difficulty, see parameter `direction`) of an amount `x` after 2 good answers and will increase of the same amount `x` for one bad answer. This corresponds to an 1-up 2-down procedure.
- `factor`: this is the value of the multiplicator used to change the variable.
- `direction`: tells if a good answer is associated with a decrease (`direction=-1`) or an increase (`direction=1`) of the value. The default behaviour is a decrease of the value when a good answer is provided (like for frequency thresholds for example).
- `limits`: define the lower and upper values that can be used. When reached, the value will stay to the bound until there is an opposite answer.
- `operation`: can be `multiply` or `add`. Determine what operation to do with the factor. If `operation: 'multiply'`, the increased value will be `*` by factor and the decrease value `/` by factor. If `operation: 'add'`, the increased value will be `+` by factor and the decrease value `-` by factor.

## Options

A second object containing options can also be passed to the `Staircase` constructor. These options will concern all the staircases.

- `sameStairMax`: it is the maximum changing values on the same staircase before using another staircase.

## Methods

### `init()`

This method will randomly choose the first staircase to use.

### `next(goodAns)`

The `next(goodAns)` method takes a boolean as input and will create a new value in the list of values taken by the variable. This new value is computed according to the boolean: if `true` the answer was right and the difficulty has to be increased; if `false` the answer was wrong and the difficulty has to be decreased.

In addition, the variable `sameStairCount` is incremented each time value is changing on the same staircase.

### `changeActive()`

Reset the `sameStairCount` to 0. Randomly choose another staircase to use (the last active staircase can't be choose again).

### `getActive()`

Return the staircase object corresponding to the active one.

### `get(stair)`

Return the whole array of values of the selected staircase (`stair`).

### `getLast(stair)`

Return only the last value of the selected staircase.

### `activate(stair)`

Set the `active` property of `stair` to `true`.

### `deactivate(stair)`

Set the `active` property of `stair` to `false`.

### `isActive(stair)`

Return the `active` property of `stair`.

### `setsameStairMax()`

Change the number of maximum consecutive values in the same staircase (similar to the option `sameStairMax` used to instanciate the Staircase module).
