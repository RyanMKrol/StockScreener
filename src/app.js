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
  const fundamentalsLinks = await fetchFundamentalsLinks(index);

  const data = await async.mapLimit(
    fundamentalsLinks,
    SIMULTANEOUS_FUNDAMENTALS_FETCHES,
    async (link) => new Promise((resolve, reject) => {
      curl.get(link, (err, response, body) => {
        try {
          const $ = cheerio.load(body);

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

          resolve(revenueData);
        } catch (error) {
          reject(new Error('Failed to fetch the fundamentals'));
        }
      });
    }),
  );

  console.log(data);
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
