const reader = require('line-reader')
const fs = require('fs');
/*
if line is all caps
 -> if line starts with roman numerals
    read in as levels until reaching next all caps
 read in as individual talent until next all caps
*/
let talents = []
let activeTalent = {};
let currentlyReading = '';
let currentString = '';
  reader.eachLine('./talents.txt', (line, last) => {
    if (isAllCaps(line)) {
      if (currentlyReading == "EFFECT") {
        if (currentString != "") {
          if (activeTalent.hasOwnProperty("children")) {
            activeTalent.children[activeTalent.children.length - 1].effect = currentString;
          } else activeTalent.effect = currentString;
        }
      }
      currentlyReading = '';
      currentString = '';
      if (isTalentComplete(activeTalent)) {
        talents.push(activeTalent);
        activeTalent = {};
      }
      if (activeTalent.name) {
        activeTalent = {};
      }
      activeTalent.name = line;
    } else if (startsWithRomanNumerals(line) > 0) {
      if (currentlyReading == "EFFECT") {
        if (currentString != "") {
          if (activeTalent.hasOwnProperty("children")) {
            activeTalent.children[activeTalent.children.length - 1].effect = currentString;
          } else activeTalent.effect = currentString;
        }
      }
      currentlyReading = '';
      currentString = '';
      if (!activeTalent.hasOwnProperty("children")) {
        activeTalent.children = [];
      }
      if (!activeTalent.children[startsWithRomanNumerals(line) - 1]) {
        activeTalent.children[startsWithRomanNumerals(line) - 1] = {};
      }
      activeTalent.children[startsWithRomanNumerals(line) - 1].name = line;
    } else if (isRequirements(line)) {
      if (currentString) {
        if (activeTalent.hasOwnProperty("children")) {
          activeTalent.children[activeTalent.children.length - 1].description = currentString;
        } else activeTalent.description = currentString;
        currentString = "";
      }
      currentlyReading = "REQS";
      currentString += line;
    } else if (isEffect(line)) {
      if (currentString) {
        if (activeTalent.hasOwnProperty("children")) {
          activeTalent.children[activeTalent.children.length - 1].requirements = currentString;
        } else activeTalent.requirements = currentString;
        currentString = "";
      }
      currentlyReading = "EFFECT";
      currentString += line;
    }  else if (currentlyReading == "") {
      currentlyReading = "DESC";
      currentString += line;
    } else if (currentlyReading != "") {
      currentString += line;
    }

    if (last) {
      if (isTalentComplete(activeTalent)) {
        talents.push(activeTalent);
      }
      fs.writeFile('talentsread.txt', JSON.stringify(talents), (err) => {
        if (err) throw err;
        console.log('Saved!')
      })
    }
  })

function isAllCaps(string) {
  return (string == string.toUpperCase())
}

function startsWithRomanNumerals(string) {
  if (string.startsWith("I.")) {
    return 1;
  } else if (string.startsWith("II.")) {
    return 2;
  } else if (string.startsWith("III.")) {
    return 3;
  } else return 0;
}

function isRequirements(string) {
  return string.startsWith("Requirements:");
}

function isEffect(string) {
  return string.startsWith("Effect:");
}

function isTalentComplete(talent) {
  if (!talent.name) {
    //console.log("No name");
    //console.log(talent);
    return false;
  }

  if (!talent.hasOwnProperty("children")) {
    if (!talent.effect) {
      //console.log("No effect");
      return false;
    }
    if (!talent.description) {
      //console.log("No desc");
      return false;
    }
    if (!talent.requirements) {
      //console.log("No req");
      //console.log(JSON.stringify(talent))
      return false;
    }
  } else {
    let childErr = 0;
    talent.children.forEach( tal => {
      if (!tal.name) {
        //console.log("No child name");
        childErr++
      }
      if (!tal.description) {
        //console.log("No child desc");
        childErr++
      }
      if (!tal.requirements) {
        //console.log("No child req");
        childErr++
      }
      if (!tal.effect) {
        //console.log("No child effect");
        childErr++
      }
    })
    if (childErr > 0) {
      return false;
    }
  }
  return true;
}
