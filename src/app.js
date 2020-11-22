/** @module app */

import fetchRawFundamentalsData from './modules/fetch';
import { startVsEndDiffFilter } from './modules/filters';

/**
 * @typedef Fundamentals
 * @type {object}
 * @property {string} name - Name of the stock
 * @property {string} link - Link to the stock data
 * @property {Array.<number>} revenue - Revenue data
 * @property {Array.<number>} operatingProfit - Operating profit data
 * @property {Array.<number>} preTaxProfit - Pre-Tax Profit data
 */

/**
 * Main
 *
 * @param {string} index Index to run screener for
 */
async function main(index) {
  const fundamentals = await fetchRawFundamentalsData(index);
  const remainingFundamentals = startVsEndDiffFilter(fundamentals, 'revenue', 20);
  console.log(remainingFundamentals);
}

main('ftse100');
