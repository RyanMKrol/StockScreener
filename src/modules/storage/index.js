import fs from 'fs';
import moment from 'moment';

/**
 * Method to save data for re-use later
 *
 * @param {string} index The index we want to save data for
 * @param {object} data The data to store in our file
 */
async function saveIndexData(index, data) {
  await fs.open(fileName(index), 'wx', async (err, fd) => {
    if (err) {
      if (err.code === 'EEXIST') {
        return;
      }

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
 * @param {string} index The index we want to save data for
 * @returns {Promise.<Array.<module:app.Fundamentals>>} The fundamentals that have been saved
 */
async function loadIndexData(index) {
  return new Promise((resolve) => {
    // open the file and check that it exists before reading
    fs.open(fileName(index), 'r', (err, fd) => {
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
 * Method to generate the filename to interact with
 *
 *
 * @param {string} index The index to load/save data for
 * @returns {string} The filename
 */
function fileName(index) {
  const date = moment().format('DD-MM-YYYY');
  return `${__dirname}/../../../data/${index}-fundamentals-${date}.json`;
}

export { saveIndexData, loadIndexData };
