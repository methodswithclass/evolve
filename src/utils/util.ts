export const sum = (array: any, $callback: any) => {
  let sum = 0;

  let callback = (value: any, index: any, array: any) => {
    return value;
  };

  if ($callback) callback = $callback;

  for (let i in array) {
    sum += callback(array[i], i, array);
  }

  return sum;
};

export const average = (array: any, $callback: any) => {
  const total = sum(array, $callback);

  return total / array.length;
};

export const truncate = (number: number, decimal: number) => {
  const value =
    Math.floor(number * Math.pow(10, decimal)) / Math.pow(10, decimal);

  return value;
};

export const last = (array: any) => {
  return array[array.length - 1];
};

export const shuffle = (array: any) => {
  let currentIndex: number = array.length,
    temporaryValue: number,
    randomIndex: number;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};

export default {
  sum,
  average,
  truncate,
  last,
  shuffle,
};
