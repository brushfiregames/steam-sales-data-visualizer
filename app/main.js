function makeRegionGraphics(data) {
  // Get a unique list of the regions in which the game has sold
  let regions = _.uniq(_.map(data, (row) => { return row['Region']; })).sort();

  // Count up some data based on those regions
  let revenueByRegion = _.map(regions, (region) => {
    let revenue = _.reduce(data, (revenue, row) => {
      if (row['Region'] === region) {
        revenue += row['Net Steam Sales (USD)'];
      }
      return revenue;
    }, 0);

    return [region, revenue];
  });

  let unitsByRegion = _.map(regions, (region) => {
    let revenue = _.reduce(data, (revenue, row) => {
      if (row['Region'] === region) {
        revenue += row['Net Units Sold'];
      }
      return revenue;
    }, 0);

    return [region, revenue];
  });

  // Create some graphics from the region data
  $('<div><h1>Revenue By Region</h1><div id="regionNetRevenuePie"></div></div>').appendTo('.graphics');
  c3.generate({
    bindto: '#regionNetRevenuePie',
    data: { columns: revenueByRegion, type: 'pie' },
    tooltip: { format: { value: (value, ratio, id) => {
      return d3.format('$,.2f')(value, ratio) + ' (' + d3.format('.1%')(ratio) + ')';
    } } }
  });

  $('<div><h1>Units By Region</h1><div id="regionNetUnitsPie"></div></div>').appendTo('.graphics');
  c3.generate({
    bindto: '#regionNetUnitsPie',
    data: { columns: unitsByRegion, type: 'pie' },
    tooltip: { format: { value: (value, ratio, id) => {
      return d3.format(',')(value) + ' (' + d3.format('.1%')(ratio) + ')';
    } } }
  });
}

function makeGraphics(data) {
  // Clear any previous graphics
  $('.graphics').html('');

  // Now render out our various graphics
  makeRegionGraphics(data);
}

function processFile(file) {
  let reader = new FileReader();

  // Called when the FileReader completes the file read
  reader.onloadend = () => {
    let csvData = reader.result;

    // Steam puts some extra data in the CSV that needs to be removed before we can parse it.
    // The first line we care about is the header row which starts with Date so we'll strip
    // everything before that out of the data.
    csvData = csvData.substring(csvData.indexOf('Date'));

    // Parse the data into objects
    Papa.parse(csvData, {
      header: true,
      dynamicTyping: true,
      worker: true,
      skipEmptyLines: true,
      complete: (results) => { makeGraphics(results.data); }
    });
  };

  // Start the file read
  reader.readAsBinaryString(file);
}

$(document).ready(() => {
  // Wire up file drops so we can easily read in the files
  let filedrop = $('.filedrop');
  filedrop.on({
    dragenter: (e) => { filedrop.addClass('active'); },
    dragleave: (e) => { filedrop.removeClass('active'); },
    drop: (e) => {
      filedrop.removeClass('active');
      processFile(e.originalEvent.dataTransfer.files[0]);
    }
  });

  // Setup the document to generally ignore file drops so we don't trigger
  // browser default behavior of opening up the files in the current tab.
  let cancelDragFunc = function(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };
  $(document.body).on({ dragover: cancelDragFunc, drop: cancelDragFunc });
});
