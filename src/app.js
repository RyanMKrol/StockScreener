import curl from 'curl';
import cheerio from 'cheerio';
import async from 'async';

const SIMULTANEOUS_FUNDAMENTALS_FETCHES = 5;

/**
 * Main
 *
 * @param {string} index Index to run screener for
 */
async function main(index) {
  const results = {};

  const fundamentalsLinks = await fetchFundamentalsLinks(index);

  await async.mapLimit(
    fundamentalsLinks,
    SIMULTANEOUS_FUNDAMENTALS_FETCHES,
    async (link) => new Promise((resolve, reject) => {
      const stockName = new URL(link).searchParams.get('shareprice');

      curl.get(link, (err, response, body) => {
        try {
          const $ = cheerio.load(body);

          const revenueData = revenueProcessor($);
          const preTaxProfitData = preTaxProfitProcessor($);

          results[stockName] = {
            link,
            revenue: revenueData,
            preTaxProfit: preTaxProfitData,
          };

          resolve();
        } catch (error) {
          reject(new Error('Failed to fetch the fundamentals'));
        }
      });
    }),
  );

  console.log(results);
}

/**
 * Processor for extracting profit before tax data
 *
 * @param $
 */
function preTaxProfitProcessor($) {
  const baseLinks = $('.sp-fundamentals__table tr').filter(
    (i, elem) => $(elem)
      .children('td')
      .first()
      .text() === 'Pre tax Profit',
  );

  const preTaxProfitData = $(baseLinks)
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

  return preTaxProfitData;
}

/**
 * Processor for extracting revenue data
 *
 * @param $
 */
function revenueProcessor($) {
  const baseLinks = $('.sp-fundamentals__table tr').filter(
    (i, elem) => $(elem)
      .children('td')
      .first()
      .text() === 'Revenue',
  );

  const revenueData = $(baseLinks)
    .children('td')
    .map((i, elem) => (i === 0 ? undefined : $(elem).text()))
    .get()
    .map((x) => parseInt(x.replace(',', ''), 10));

  return revenueData;
}

/**
 * Method to fetch the fundamentals links for each stock in a given index
 *
 * @param {string} index Index to run screener for
 * @returns {Array.<string>} Array of links correlating to the fundamentals page for each stock
 */
async function fetchFundamentalsLinks(index) {
  const constituentsConfig = {
    ftse100: 'https://www.lse.co.uk/share-prices/indices/ftse-100/constituents.html',
    ftse250: 'https://www.lse.co.uk/share-prices/indices/ftse-250/constituents.html',
    aim100: 'https://www.lse.co.uk/share-prices/indices/ftse-aim-100/constituents.html',
  };

  const constituentsUrl = constituentsConfig[index];

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

main('ftse100');
