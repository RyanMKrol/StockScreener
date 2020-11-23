import curl from 'curl';
import cheerio from 'cheerio';
import async from 'async';
import * as noodleUtils from 'noodle-utils';
import { saveIndexData, loadIndexData } from '../storage';

import { INDEX_CONSTITUENTS_LINKS, SUPPORTED_ATTRIBUTES } from '../constants';

const WAIT_BETWEEN_FETCHES = 5000;
const SIMULTANEOUS_FUNDAMENTALS_FETCHES = 2;

const SHARE_NAME_URL_PARAM = 'shareprice';

const HTML_REVENUE = 'Revenue';
const HTML_PRE_TAX_PROFIT = 'Pre tax Profit';
const HTML_OPERATING_PROFIT = 'Operating Profit / Loss';

/**
 * @typedef CheerioParseResult
 * @see https://www.npmjs.com/package/cheerio
 */

/**
 * The ingress for fetching fundamentals data
 *
 * @param {string} index Index to fetch fundamentals for
 * @returns {Array.<module:app.Fundamentals>} The fundamentals for every stock in the index
 */
async function fetchRawFundamentalsData(index) {
  const data = await loadIndexData(index);

  if (data) return data;

  const fundamentalsLinks = await fetchFundamentalsLinks(index);
  const fundamentals = await fetchFundamentals(fundamentalsLinks);

  await saveIndexData(index, JSON.stringify(fundamentals));

  return fundamentals;
}

/**
 * Method to fetch relevant fundamentals data for given stock links
 *
 * @param {Array.<string>} links Links for the stocks we want data for
 * @returns {Array.<module:app.Fundamentals>} The fundamentals for every stock in the index
 */
async function fetchFundamentals(links) {
  return async.mapLimit(links, SIMULTANEOUS_FUNDAMENTALS_FETCHES, async (link) => {
    await noodleUtils.sleep(WAIT_BETWEEN_FETCHES);

    const stockName = new URL(link).searchParams.get(SHARE_NAME_URL_PARAM);

    return new Promise((resolve, reject) => {
      curl.get(link, (err, response, body) => {
        try {
          const $ = cheerio.load(body);

          resolve({
            name: stockName,
            link,
            [SUPPORTED_ATTRIBUTES.REVENUE]: attributeProcessor($, HTML_REVENUE),
            [SUPPORTED_ATTRIBUTES.PRE_TAX_PROFIT]: attributeProcessor($, HTML_PRE_TAX_PROFIT),
            [SUPPORTED_ATTRIBUTES.OPERATING_PROFIT]: attributeProcessor($, HTML_OPERATING_PROFIT),
          });
        } catch (error) {
          reject(new Error('Failed to fetch the fundamentals'));
        }
      });
    });
  });
}

/**
 * Processor for extracting attributes from fundamentals
 *
 * @param {CheerioParseResult} $ The result of parsing the initial page body with Cheerio
 * @param {string} rowTitle The title corresponding to the attribute we want to fetch
 * @returns {Array.<number>} The numbers corresponding to the attribute we want
 */
function attributeProcessor($, rowTitle) {
  const baseLinks = $('.sp-fundamentals__table tr').filter(
    (i, elem) => $(elem)
      .children('td')
      .first()
      .text() === rowTitle,
  );

  const attributeData = $(baseLinks)
    .children('td')
    .map((i, elem) => (i === 0 ? undefined : $(elem).text()))
    .get()
    .map((x) => {
      // checks if the number is negative to modify the final result
      const negativeMultiplyer = x.includes('(') ? -1 : 1;

      // removes all string data to be able to parse number later
      const rawNumber = x.replace(/[,|(|)]/g, '');

      return parseInt(rawNumber, 10) * negativeMultiplyer;
    });

  // reversed because the data on site starts from most recent
  return attributeData.reverse();
}

/**
 * Method to fetch the fundamentals links for each stock in a given index
 *
 * @param {string} index Index to run screener for
 * @returns {Array.<string>} Array of links correlating to the fundamentals page for each stock
 */
async function fetchFundamentalsLinks(index) {
  const constituentsUrl = INDEX_CONSTITUENTS_LINKS[index];

  return new Promise((resolve, reject) => {
    curl.get(constituentsUrl, (err, response, body) => {
      try {
        const $ = cheerio.load(body);

        const baseLinks = $('.sp-constituents tr > td:nth-child(1) a:nth-child(2)')
          .map((i, elem) => $(elem).attr('href'))
          .get();

        const links = baseLinks.map((x) => x.replace('SharePrice.asp', 'share-fundamentals.asp'));

        resolve(links);
      } catch (error) {
        reject(new Error('Failed to fetch the constituents'));
      }
    });
  });
}

export default fetchRawFundamentalsData;
