import curl from 'curl';
import cheerio from 'cheerio';

/**
 * Main
 *
 * @param {string} index Index to run screener for
 */
async function main(index) {
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
