import fetchRawFundamentalsData from './modules/fetch';

/**
 * Main
 *
 * @param {string} index Index to run screener for
 */
async function main(index) {
  const fundamentals = await fetchRawFundamentalsData(index);

  console.log(fundamentals);
}

main('ftse100');
