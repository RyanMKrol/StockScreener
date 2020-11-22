/** @module app */

import fetchRawFundamentalsData from './modules/fetch';
import { generateIndex, generateScreeningData } from './modules/interaction';
import createFilterGroup from './modules/filters';

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
 */
async function main() {
  const index = await generateIndex();
  const screeningInfo = await generateScreeningData();
  const filters = createFilterGroup(screeningInfo);
  const fundamentals = await fetchRawFundamentalsData(index);

  const screenedStocks = filters.reduce((acc, filter) => filter(acc), fundamentals);

  console.log(screenedStocks);
}

main();
