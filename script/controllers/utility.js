function romanToDigits(romanNumeral) {
  const romanToDigitMap = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000,
  };

  let result = 0;

  for (let i = 0; i < romanNumeral.length; i++) {
    const currentValue = romanToDigitMap[romanNumeral[i]];
    const nextValue = romanToDigitMap[romanNumeral[i + 1]];

    if (currentValue >= nextValue || i + 1 === romanNumeral.length) {
      result += currentValue;
    } else {
      result += nextValue - currentValue;
      i++;
    }
  }

  return result;
}

const nextRoll = (roll) => {
  const number = parseInt(roll.slice(8));

  if (!isNaN(number) && number < 99) {
    return roll.slice(0, 8) + (number + 1).toString().padStart(2, "0");
  } else if (number === 99) {
    return roll.slice(0, 8) + "A0";
  } else if (parseInt(roll[9]) < 9) {
    return roll.slice(0, 9) + (parseInt(roll[9]) + 1);
  } else if (roll[9] === "9" && roll[8] !== "Z") {
    return roll.slice(0, 8) + String.fromCharCode(roll.charCodeAt(8) + 1) + "0";
  } else if (roll[8] === "Z") {
    return roll.slice(0, 8) + "00";
  }
};

const rollChecker = (from, to) => {
  from = from.toUpperCase();
  to = to.toUpperCase();
  const roll = [];
  let currentRoll = from;

  while (currentRoll !== nextRoll(to) && roll.length <= 80) {
    roll.push(currentRoll);
    currentRoll = nextRoll(currentRoll);
  }

  return roll;
};

module.exports = {
  romanToDigits,
  rollChecker,
};
