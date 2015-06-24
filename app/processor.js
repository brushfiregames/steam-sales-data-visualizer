// This file is rn as a web worker to process our CSV data into all of the values
// we need to generate our graphics and run the page.

importScripts('ext/moment-with-locales.min.js');
importScripts('ext/underscore-min.js');

self.addEventListener('message', function(e) {
  let csvData = e.data;
  let result = {};

  // Process the list of all regions in which the game sold
  result.regions = _.uniq(_.map(csvData, (row) => { return row['Region']; })).sort();

  // Compute the revenue earned in each region
  result.revenueByRegion = _.map(result.regions, (region) => {
    let revenue = _.reduce(csvData, (revenue, row) => {
      if (row['Region'] === region) {
        revenue += row['Net Steam Sales (USD)'];
      }
      return revenue;
    }, 0);

    return [region, revenue];
  });

  // Compute the net units sold in each region
  result.unitsByRegion = _.map(result.regions, (region) => {
    let revenue = _.reduce(csvData, (revenue, row) => {
      if (row['Region'] === region) {
        revenue += row['Net Units Sold'];
      }
      return revenue;
    }, 0);

    return [region, revenue];
  });

  // Grab all dates from the file
  result.dates = _.map(_.uniq(_.map(csvData, (row) => row['Date'])), (val) => moment(val));

  // Find the min and max dates
  result.minDate = moment.min(result.dates);
  result.maxDate = moment.max(result.dates);

  // Post message back to the app now that we're done
  self.postMessage(JSON.stringify(result));
}, false);
