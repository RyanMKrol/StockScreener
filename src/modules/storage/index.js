import * as shell from 'shelljs';
import fs from 'fs';

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
 * Open a file
 *
 * @param {string} filename The location of the file to open
 */
function openFile(filename) {
  shell.exec(`open ${filename}`);
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
  save, load, generateReportFilename, openFile,
};
