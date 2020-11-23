import fs from 'fs';
import moment from 'moment';

/**
 * Method to save data for re-use later
 *
 * @param {string} filename The filename to save data against
 * @param {object} data The data to store in our file
 */
async function save(filename, data) {
  await fs.open(filename, 'w', async (err, fd) => {
    if (err && err.code !== 'EEXIST') {
      throw err;
    }

    await fs.writeFile(fd, data, (error) => {
      if (error) throw error;
    });
  });
}

/**
 * Method to load data that has been saved for today
 *
 * @param {string} filename The filename to save data against
 * @returns {Promise.<Array.<module:app.Fundamentals>>} The fundamentals that have been saved
 */
async function load(filename) {
  return new Promise((resolve) => {
    // open the file and check that it exists before reading
    fs.open(filename, 'r', (err, fd) => {
      if (err) {
        resolve();
      } else {
        // use existing file descriptor to read the file
        fs.readFile(fd, (error, data) => {
          if (error) resolve();
          resolve(JSON.parse(data));
        });
      }
    });
  });
}

/**
 * Method to generate the fundamentals filename
 *
 * @param {string} index The index to load/save data for
 * @returns {string} The filename
 */
function generateFundamantalsFilename(index) {
  const date = moment().format('DD-MM-YYYY');
  return `${__dirname}/../../../data/${index}-fundamentals-${date}.json`;
}

/**
 * Method to generate the report filename
 *
 * @returns {string} The filename
 */
function generateReportFilename() {
  return `${__dirname}/../../../data/report.html`;
}

export {
  save, load, generateFundamantalsFilename, generateReportFilename,
};
