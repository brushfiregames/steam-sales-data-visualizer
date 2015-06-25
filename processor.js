// This file is run as a web worker to process our CSV data into all of the values
// we need to generate our graphics and run the page.

'use strict';

importScripts('ext/moment-with-locales.min.js');
importScripts('ext/underscore-min.js');

function sumColumnWithMatch(csvData, columnToMatch, valueToMatch, columnToSum) {
  return _.reduce(csvData, function (result, row) {
    if (row[columnToMatch] === valueToMatch) {
      result += row[columnToSum];
    }
    return result;
  }, 0);
}

self.addEventListener('message', function (e) {
  var csvData = e.data;
  var result = {};

  // Process the list of all regions and countries in which the game sold
  result.regions = _.uniq(_.map(csvData, function (row) {
    return row['Region'];
  })).sort();
  result.countries = _.uniq(_.map(csvData, function (row) {
    return row['Country'];
  })).sort();

  // Compute revenue and units by region
  result.revenueByRegion = _.map(result.regions, function (region) {
    return [region, sumColumnWithMatch(csvData, 'Region', region, 'Net Steam Sales (USD)')];
  });
  result.unitsByRegion = _.map(result.regions, function (region) {
    return [region, sumColumnWithMatch(csvData, 'Region', region, 'Net Units Sold')];
  });

  // Compute revenue and units by country
  result.revenueByCountry = _.map(result.countries, function (country) {
    return [country, sumColumnWithMatch(csvData, 'Country', country, 'Net Steam Sales (USD)')];
  });
  result.unitsByCountry = _.map(result.countries, function (country) {
    return [country, sumColumnWithMatch(csvData, 'Country', country, 'Net Units Sold')];
  });

  // Grab all dates from the file
  result.dates = _.map(_.uniq(_.map(csvData, function (row) {
    return row['Date'];
  })), function (val) {
    return moment(val);
  });

  // Find the min and max dates
  result.minDate = moment.min(result.dates);
  result.maxDate = moment.max(result.dates);

  // Convert all dates into simple formats like the CSV file
  result.dates = _.map(result.dates, function (date) {
    return date.format('YYYY-MM-DD');
  });
  result.minDate = result.minDate.format('YYYY-MM-DD');
  result.maxDate = result.maxDate.format('YYYY-MM-DD');

  // Create data that gives us the revenue earned on each date
  result.revenueByDate = _.map(result.dates, function (date) {
    return sumColumnWithMatch(csvData, 'Date', date, 'Net Steam Sales (USD)');
  });
  result.revenueByDate.unshift('Revenue');

  // Create data that gives us the net units on each date
  result.unitsByDate = _.map(result.dates, function (date) {
    return sumColumnWithMatch(csvData, 'Date', date, 'Net Units Sold');
  });
  result.unitsByDate.unshift('Units');

  // Post message back to the app now that we're done
  self.postMessage(JSON.stringify(result));
}, false);