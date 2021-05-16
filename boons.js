const reader = require('line-reader')
const fs = require('fs');
      Promise = require('bluebird')

/*
if line starts with capital and ends with /() Chararacter Creation Only/ ->
  new boon/bane
*/
let boons = [];
let activeBoon = {};
let currentString = "";
let currentlyReading = 0;

var eachLine = Promise.promisify(reader.eachLine);

eachLine('./boons.txt', (line, last) => {
  doBoons(line, last, true);
}).then(() => {
  currentString = "";
  currentlyReading = 0;
  activeBoon = {};
  eachLine('./banes.txt', (line, last) => {
  doBoons(line, last, false);
})})

function doBoons(line, last, doingBoons) {
  if (isTitleLine(line)) {
    if (currentString) {
      activeBoon.description[currentlyReading] = currentString;
      currentString = "";
    }
    if (isBoonComplete(activeBoon)) {
      boons.push(activeBoon);
      activeBoon = {};
      currentlyReading = 0;
    }
    activeBoon.name = isTitleLine(line)[1]
    activeBoon.cost = [];
    activeBoon.description = [];
    getPointsCost(isTitleLine(line)[2], doingBoons).forEach((cost, i) => {
      activeBoon.cost[i] = cost;
    });
  } else if (isBulletPointLine(line)) {
    if (currentString) {
      activeBoon.description[currentlyReading] = currentString;
      currentlyReading++;
      currentString = "";
    }
    currentString += line;
  } else if (currentString) {
    currentString += line;
  } else if (!currentString && currentlyReading == 0) {
    currentString += line;
  }

  if (last) {
    if (isBoonComplete(activeBoon)) {
      boons.push(activeBoon);
    }
    if (!doingBoons) {
      fs.appendFile('boonsread.json', JSON.stringify(boons), (err) => {
        if (err) throw err;
        console.log('Saved!')
      })
    }    
  }
}


function isTitleLine(string) { //returns [5]
  //[3] is points in (x/y) format
  // if [5] then chargen only
  let regex = /^([A-Z]+[A-z ]+) (\([0-9](\/[0-9\/]+)*\))( Character Creation only)*( Cannot be removed)*$/
  let result = string.match(regex);
  return result;
}

function isBulletPointLine(string) {
  let regex = /^ [0-9]+:/;
  return regex.test(string);
}

function getPointsCost(string, boon) {
  let points = [];
  string = string.substr(1, string.length - 2);
  points = string.split("/");
  points.forEach((cost, i) => {
    cost = parseInt(cost);
    if (!boon) {
      points[i] = -Math.abs(cost);
    } else points[i] = cost;
  })
  return points;
}

function isBoonComplete(boon) {
  if (!boon.name) {
    console.log("No name")
    return false;
  }
  if (!boon.description) {
    console.log("No desc");
    return false;
  }
  if (!boon.cost) {
    console.log("No cost");
    return false;
  }
  return true;
}
