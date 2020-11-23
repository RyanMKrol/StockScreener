import inquirer from 'inquirer';

import { INDEX_CONSTITUENTS_LINKS, SUPPORTED_STRATEGIES, SUPPORTED_ATTRIBUTES } from '../constants';

const INDEX_QUESTIONS = [
  {
    name: 'index',
    type: 'list',
    message: 'What index would you like to screen?',
    choices: Object.keys(INDEX_CONSTITUENTS_LINKS),
  },
];

const SCREENING_QUESTIONS = [
  {
    name: 'type',
    type: 'list',
    message: 'What type of screening would you like to configure?',
    choices: Object.values(SUPPORTED_STRATEGIES),
  },
  {
    name: 'attribute',
    type: 'list',
    message: "What aspect of the company's fundamentals would you like to apply this screening to?",
    choices: Object.values(SUPPORTED_ATTRIBUTES),
  },
  {
    name: 'threshold',
    type: 'number',
    message: 'What would you like the threshold to be? (Default: 0)',
    default: 0,
  },
  {
    name: 'years',
    type: 'number',
    default: 2,
    message: 'For how many years do you want this threshold to hold? (Default: 2)',
    validate: validateRequiredNumberField,
    /**
     * Decides when to run this question
     *
     * @param {object} answers Current answers to check on
     * @returns {boolean} Whether to ask this question
     */
    when: (answers) => answers.type === SUPPORTED_STRATEGIES.LAST_X_YEARS_COMPARISON
      || answers.type === SUPPORTED_STRATEGIES.FIRST_X_YEARS_COMPARISON,
  },
  {
    name: 'wantsMoreSreening',
    type: 'confirm',
    message: 'Would you like to add more screening criteria?',
  },
];

/**
 * validates that the number input has a value
 *
 * @param {number} input The user's input
 * @returns {any} Either the message to send in the input's absense, or true
 */
function validateRequiredNumberField(input) {
  if (Number.isNaN(input) || input <= 0) {
    return 'Must provide a number here!';
  }

  return true;
}

/**
 * Fetching the config to be used for screening our stock fundamentals
 *
 * @param {Array.<object>} fullAnswers Used to track current and previous screening answers
 * @returns {Array.<object>} The data surrounding how to screen our stocks
 */
async function inquireScreeningConfig(fullAnswers) {
  return inquirer.prompt(SCREENING_QUESTIONS).then(async (answers) => {
    fullAnswers.push(answers);
    return answers.wantsMoreSreening ? inquireScreeningConfig(fullAnswers) : fullAnswers;
  });
}

/**
 * Generates the index that the user would like to screen stocks in
 *
 * @returns {string} The index to screen stocks in
 */
async function generateIndex() {
  const { index } = await inquirer.prompt(INDEX_QUESTIONS);

  return index;
}

/**
 * Generates the data used for screening stock fundamentals
 *
 * @returns {Array.<object>} The data surrounding how to screen our stocks
 */
async function generateScreeningData() {
  const baseAnswers = [];
  return inquireScreeningConfig(baseAnswers);
}

export { generateIndex, generateScreeningData };
