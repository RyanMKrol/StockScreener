/**
 * Returns the difference between the first and last elements of an array
 *
 * @param {Array.<number>} numArray The original numbers to find the first and last difference of
 * @returns {number} The percentage difference between first and last numbers
 */
function firstLastDiff(numArray) {
  return (last(numArray) / first(numArray)) * 100 - 100;
}

/**
 * Returns an array showing the change of numbers in an array
 *
 * @param {Array.<number>} numArray The original numbers to find the running difference of
 * @returns {Array.<number>} Array of percentage changes between each number
 */
function runningPercentageDiff(numArray) {
  return numArray.reduce((acc, current, index) => {
    if (index !== numArray.length - 1) {
      acc.push((numArray[index + 1] / numArray[index]) * 100 - 100);
    }
    return acc;
  }, []);
}

/**
 * Returns the first element in the array
 *
 * @param {Array.<any>} array The array
 * @returns {any} The first element in the array
 */
function first(array) {
  return array[0];
}

/**
 * Returns the last element in the array
 *
 * @param {Array.<any>} array The array
 * @returns {any} The last element in the array
 */
function last(array) {
  return array[array.length - 1];
}

export { firstLastDiff, runningPercentageDiff };
