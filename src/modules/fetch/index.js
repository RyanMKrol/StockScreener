import fetch from 'node-fetch';

/**
 * The ingress for fetching fundamentals data
 *
 * @param {string} index Index to fetch fundamentals for
 * @returns {Array.<module:app.Fundamentals>} The fundamentals for every stock in the index
 */
async function fetchRawFundamentalsData(index) {
  return fetch(`http://stocktickersapi.xyz/fundamentals/${index}`)
    .then((res) => res.json())
    .then((res) => res.fundamentals);
}
export default fetchRawFundamentalsData;
