import { firstLastDiff, runningPercentageDiff } from './Utilities';

/**
 * Filter to find companies where an attribute is above a
 * certain threshold for the first and last year
 *
 * @param {Array.<module:app.Fundamentals>} array Array of fundamentals
 * @param {string} attribute The attribute we want to filter on
 * @param {number} threshold The threshold we want to enforce on the fundamentals metric
 * @returns {Array.<module:app.Fundamentals>} The remaining fundamentals that fit this filter
 */
function startVsEndDiffFilter(array, attribute, threshold) {
  return array.filter((item) => firstLastDiff(item[attribute]) >= threshold);
}

/**
 * Filter to find companies where an attribute is above a
 * certain threshold for the last X years running
 *
 * @param {Array.<module:app.Fundamentals>} array Array of fundamentals
 * @param {string} attribute The attribute we want to filter on
 * @param {number} threshold The threshold we want to enforce on the fundamentals metric
 * @param {number} pointsNeeded The number of years of data needed
 * @returns {Array.<module:app.Fundamentals>} The remaining fundamentals that fit this filter
 */
function increasingForLastNumPointsFilter(array, attribute, threshold, pointsNeeded) {
  return array.filter((stockFundamentals) => {
    // get the differences in each year
    const runningDifferences = runningPercentageDiff(stockFundamentals[attribute]);

    // reduce this array by the number of years I care about
    const reducedRunningDifferences = runningDifferences.slice(pointsNeeded * -1);

    // if there are fewer years than I've specified, remove the item
    if (reducedRunningDifferences.length !== pointsNeeded) return 0;

    // if every year is above threshold, keep it in the group
    return reducedRunningDifferences.every((x) => x >= threshold);
  });
}

/**
 * Filter to find companies where an attribute is above a
 * certain threshold for every year
 *
 * @param {Array.<module:app.Fundamentals>} array Array of fundamentals
 * @param {string} attribute The attribute we want to filter on
 * @param {number} threshold The threshold we want to enforce on the fundamentals metric
 * @returns {Array.<module:app.Fundamentals>} The remaining fundamentals that fit this filter
 */
function increasingForAllPointsFilter(array, attribute, threshold) {
  return array.filter((stockFundamentals) => {
    // get the differences in each year
    const runningDifferences = runningPercentageDiff(stockFundamentals[attribute]);

    // if every year is above threshold, keep it in the group
    return runningDifferences.every((x) => x >= threshold);
  });
}

export { startVsEndDiffFilter, increasingForLastNumPointsFilter, increasingForAllPointsFilter };
