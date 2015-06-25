'use strict';

function makeGraphics(data) {
  $('<div><h1>Revenue/Units By Date</h1><div id="revenueAndUnitsByDate"></div></div>').appendTo('.graphics');
  var datesForC3 = data.dates.slice(0);
  datesForC3.unshift('x');
  c3.generate({
    bindto: '#revenueAndUnitsByDate',
    data: {
      x: 'x',
      columns: [datesForC3, data.revenueByDate, data.unitsByDate],
      axes: {
        Units: 'y2'
      }
    },
    axis: {
      x: { type: 'timeseries' },
      y: { tick: { format: d3.format('$,') } },
      y2: { show: true, tick: { format: d3.format(',') } }
    },
    point: { show: false },
    tooltip: { format: { value: function value(_value, ratio, id) {
          return id === 'Revenue' ? d3.format('$,.2f')(_value) : d3.format(',')(_value);
        } } }
  });

  $('<div><h1>Revenue By Region</h1><div id="revenueByRegion"></div></div>').appendTo('.graphics');
  c3.generate({
    bindto: '#revenueByRegion',
    data: {
      columns: data.revenueByRegion,
      type: 'pie'
    },
    tooltip: { format: { value: function value(_value2, ratio, id) {
          return d3.format('$,.2f')(_value2, ratio) + ' (' + d3.format('.1%')(ratio) + ')';
        } } }
  });

  $('<div><h1>Units By Region</h1><div id="unitsByRegion"></div></div>').appendTo('.graphics');
  c3.generate({
    bindto: '#unitsByRegion',
    data: {
      columns: data.unitsByRegion,
      type: 'pie'
    },
    tooltip: { format: { value: function value(_value3, ratio, id) {
          return d3.format(',')(_value3) + ' (' + d3.format('.1%')(ratio) + ')';
        } } }
  });

  $('<div><h1>Revenue By Country (top 15)</h1><div id="revenueByCountry"></div></div>').appendTo('.graphics');
  // Only use the top 15 countries by revenue
  var revenueByCountry = _.sortBy(_.sortBy(data.revenueByCountry, function (r) {
    return -r[1];
  }).slice(0, 15), function (r) {
    return r[0];
  });
  c3.generate({
    bindto: '#revenueByCountry',
    data: {
      columns: revenueByCountry,
      type: 'pie'
    },
    tooltip: { format: { value: function value(_value4, ratio, id) {
          return d3.format('$,.2f')(_value4, ratio) + ' (' + d3.format('.1%')(ratio) + ')';
        } } }
  });

  $('<div><h1>Units By Country (top 15)</h1><div id="unitsByCountry"></div></div>').appendTo('.graphics');
  // Only use the top 15 countries by units
  var unitsByCountry = _.sortBy(_.sortBy(data.unitsByCountry, function (r) {
    return -r[1];
  }).slice(0, 15), function (r) {
    return r[0];
  });
  c3.generate({
    bindto: '#unitsByCountry',
    data: {
      columns: unitsByCountry,
      type: 'pie'
    },
    tooltip: { format: { value: function value(_value5, ratio, id) {
          return d3.format(',')(_value5) + ' (' + d3.format('.1%')(ratio) + ')';
        } } }
  });
}

function processFile(file) {
  // Clear any previous graphics
  $('.graphics').html('');

  var reader = new FileReader();

  // Called when the FileReader completes the file read
  reader.onloadend = function () {
    var csvData = reader.result;

    // Steam puts some extra data in the CSV that needs to be removed before we can parse it.
    // The first line we care about is the header row which starts with Date so we'll strip
    // everything before that out of the data.
    csvData = csvData.substring(csvData.indexOf('Date'));

    // Parse the CSV data
    Papa.parse(csvData, {
      header: true,
      dynamicTyping: true,
      worker: true,
      skipEmptyLines: true,
      complete: function complete(results) {
        // Create a worker thread to process the data
        var worker = new Worker('processor.js');

        // Listen for the message to come back to make our graphics
        worker.addEventListener('message', function (e) {
          var data = JSON.parse(e.data);
          makeGraphics(data);
          $('.loadinganim').hide();
        }, false);

        // Start the loading process
        worker.postMessage(results.data);
      }
    });
  };

  // Start the file read
  $('.loadinganim').show();
  reader.readAsBinaryString(file);
}

$(document).ready(function () {
  // Wire up file drops so we can easily read in the files
  var filedrop = $('.filedrop');
  filedrop.on({
    dragenter: function dragenter(e) {
      filedrop.addClass('active');
    },
    dragleave: function dragleave(e) {
      filedrop.removeClass('active');
    },
    drop: function drop(e) {
      filedrop.removeClass('active');
      processFile(e.originalEvent.dataTransfer.files[0]);
    }
  });

  // Setup the document to generally ignore file drops so we don't trigger
  // browser default behavior of opening up the files in the current tab.
  var cancelDragFunc = function cancelDragFunc(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };
  $(document.body).on({ dragover: cancelDragFunc, drop: cancelDragFunc });
});