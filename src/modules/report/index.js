import { save, generateReportFilename } from '../storage';

/**
 * Method for generating report from fundamentals data
 *
 * @param {Array.<module:app.Fundamentals>} fundamentals The fundamentals to write to the report
 */
async function generateReport(fundamentals) {
  const fileName = generateReportFilename();
  const storageString = fundamentals.reduce(
    (acc, item) => `${acc}<a href="${item.followUpLink}">${item.ticker}</a></br>\n`,
    '',
  );

  const reportString = `
    <html>
      <body>
        ${storageString}
      </body>
    </html>
  `;

  await save(fileName, reportString);
}

export default generateReport;
