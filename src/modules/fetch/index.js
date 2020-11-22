import curl from 'curl';
import cheerio from 'cheerio';
import async from 'async';

const SIMULTANEOUS_FUNDAMENTALS_FETCHES = 5;

const SHARE_NAME_URL_PARAM = 'shareprice';

const REVENUE_TITLE = 'Revenue';
const PRE_TAX_PROFIT_TITLE = 'Pre tax Profit';
const OPERATING_PROFIT_TITLE = 'Operating Profit / Loss';

const INDEX_CONSTITUENTS_LINKS = {
  ftse100: 'https://www.lse.co.uk/share-prices/indices/ftse-100/constituents.html',
  ftse250: 'https://www.lse.co.uk/share-prices/indices/ftse-250/constituents.html',
  aim100: 'https://www.lse.co.uk/share-prices/indices/ftse-aim-100/constituents.html',
};

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
 * @typedef CheerioParseResult
 * @see https://www.npmjs.com/package/cheerio
 */

/**
 * The ingress for fetching fundamentals data
 *
 * @param {string} index Index to fetch fundamentals for
 * @returns {Array.<Fundamentals>} The fundamentals for every stock in the index
 */
async function fetchRawFundamentalsData(index) {
  const fundamentalsLinks = await fetchFundamentalsLinks(index);
  const fundamentals = await fetchFundamentals(fundamentalsLinks);

  return fundamentals;
}

/**
 * Method to fetch relevant fundamentals data for given stock links
 *
 * @param {Array.<string>} links Links for the stocks we want data for
 * @returns {Array.<Fundamentals>} The fundamentals for every stock in the index
 */
async function fetchFundamentals(links) {
  return async.mapLimit(
    links,
    SIMULTANEOUS_FUNDAMENTALS_FETCHES,
    async (link) => new Promise((resolve, reject) => {
      const stockName = new URL(link).searchParams.get(SHARE_NAME_URL_PARAM);

      curl.get(link, (err, response, body) => {
        try {
          const $ = cheerio.load(body);

          resolve({
            name: stockName,
            link,
            revenue: attributeProcessor($, REVENUE_TITLE),
            pretTaxProfit: attributeProcessor($, PRE_TAX_PROFIT_TITLE),
            operatingProfit: attributeProcessor($, OPERATING_PROFIT_TITLE),
          });
        } catch (error) {
          reject(new Error('Failed to fetch the fundamentals'));
        }
      });
    }),
  );
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

  return attributeData;
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
