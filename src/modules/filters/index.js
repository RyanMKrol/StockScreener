/* eslint-disable max-len */
// For some reason prettier keeps pushing the line past 100, despite the eslint rules
// saying not to go over 100. Not sure what's happening here so I'll just disable the
// rule in this file for now

import {
  startVsEndDiffFilter,
  increasingForLastNumPointsFilter,
  increasingForAllPointsFilter,
} from './Filters';

import { SUPPORTED_STRATEGIES } from '../constants';

/**
 * Creates a group of filters to get only companies that match the user's requirements
 *
 * @param {Array.<object>} interactionResults The answers from the user
 * @returns {Array.<Function>} An array of functions to filter the initial list on
 */
function createFilterGroup(interactionResults) {
  return interactionResults.map((answer) => createFilter(answer));
}

/**
 * This method creates individual filters from the user's answers
 *
 * @param {object} answer An answer from the user around what type of screening they want
 * @returns {Function} A method to filter the fundamentals based on the user's response
 */
function createFilter(answer) {
  switch (answer.type) {
    case SUPPORTED_STRATEGIES.FIRST_LAST_COMPARISON:
      return (fundamentals) => startVsEndDiffFilter(fundamentals, answer.attribute, answer.threshold);
    case SUPPORTED_STRATEGIES.LAST_X_YEARS_COMPARISON:
      return (fundamentals) => increasingForLastNumPointsFilter(
        fundamentals,
        answer.attribute,
        answer.threshold,
        answer.years,
      );
    case SUPPORTED_STRATEGIES.ALL_YEARS_COMPARISON:
      return (fundamentals) => increasingForAllPointsFilter(fundamentals, answer.attribute, answer.threshold);
    default:
      return undefined;
  }
}

export default createFilterGroup;
