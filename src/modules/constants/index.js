const INDEX_CONSTITUENTS_LINKS = {
  FTSE_100: 'https://www.lse.co.uk/share-prices/indices/ftse-100/constituents.html',
  FTSE_250: 'https://www.lse.co.uk/share-prices/indices/ftse-250/constituents.html',
  AIM_100: 'https://www.lse.co.uk/share-prices/indices/ftse-aim-100/constituents.html',
};

const SUPPORTED_ATTRIBUTES = {
  REVENUE: 'Revenue',
  PRE_TAX_PROFIT: 'Pre Tax Profit',
  OPERATING_PROFIT: 'Operating Profit',
};

const SUPPORTED_STRATEGIES = {
  FIRST_LAST_COMPARISON: 'First Year vs Last Year',
  LAST_X_YEARS_COMPARISON: 'Increasing for Last X Years',
  FIRST_X_YEARS_COMPARISON: 'Increasing for First X Years',
  ALL_YEARS_COMPARISON: 'Increasing Every Year',
};

export { INDEX_CONSTITUENTS_LINKS, SUPPORTED_ATTRIBUTES, SUPPORTED_STRATEGIES };
