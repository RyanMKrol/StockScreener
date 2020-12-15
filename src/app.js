#!/usr/bin/env node

/** @module app */

import * as utils from 'noodle-utils';
import fetchRawFundamentalsData from './modules/fetch';
import { generateIndex, generateScreeningData } from './modules/interaction';
import createFilterGroup from './modules/filters';
import generateReport from './modules/report';
import { openFile, generateReportFilename } from './modules/storage';

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

  utils.startStatusIndicator('Gathering Fundamentals Data');

  const filters = createFilterGroup(screeningInfo);
  const fundamentals = await fetchRawFundamentalsData(index);

  const screenedStocks = filters.reduce((acc, filter) => filter(acc), fundamentals);

  utils.stopStatusIndicator();

  utils.startStatusIndicator('Generating Screen Report');

  await generateReport(screenedStocks);

  utils.stopStatusIndicator();

  process.stdout.write('Finished!\n');

  openFile(generateReportFilename());
}

main();
