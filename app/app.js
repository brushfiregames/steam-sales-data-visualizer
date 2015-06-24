function makeGraphics(data) {
  $('<div><h1>Revenue By Date</h1><div id="revenueByDate"></div></div>').appendTo('.graphics');
  let datesColumn = data.dates.slice(0);
  datesColumn.unshift('x');
  c3.generate({
    bindto: '#revenueByDate',
    data: {
      x: 'x',
      columns: [
        datesColumn,
        data.revenueByDate
      ]
    },
    axis: { x: { type: 'timeseries' } },
    tooltip: { format: { value: (value) => {
      return d3.format('$,.2f')(value);
    } } }
  });

  $('<div><h1>Units By Date</h1><div id="unitsByDate"></div></div>').appendTo('.graphics');
  let unitsColumn = data.dates.slice(0);
  unitsColumn.unshift('x');
  c3.generate({
    bindto: '#unitsByDate',
    data: {
      x: 'x',
      columns: [
        unitsColumn,
        data.unitsByDate
      ]
    },
    axis: { x: { type: 'timeseries' } },
    tooltip: { format: { value: (value) => {
      return d3.format(',')(value);
    } } }
  });

  $('<div><h1>Revenue By Region</h1><div id="revenueByRegion"></div></div>').appendTo('.graphics');
  c3.generate({
    bindto: '#revenueByRegion',
    data: {
      columns: data.revenueByRegion,
      type: 'pie'
    },
    tooltip: { format: { value: (value, ratio, id) => {
      return d3.format('$,.2f')(value, ratio) + ' (' + d3.format('.1%')(ratio) + ')';
    } } }
  });

  $('<div><h1>Units By Region</h1><div id="unitsByRegion"></div></div>').appendTo('.graphics');
  c3.generate({
    bindto: '#unitsByRegion',
    data: {
      columns: data.unitsByRegion,
      type: 'pie'
    },
    tooltip: { format: { value: (value, ratio, id) => {
      return d3.format(',')(value) + ' (' + d3.format('.1%')(ratio) + ')';
    } } }
  });
}

function processFile(file) {
  // Clear any previous graphics
  $('.graphics').html('');

  let reader = new FileReader();

  // Called when the FileReader completes the file read
  reader.onloadend = () => {
    let csvData = reader.result;

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
      complete: (results) => {
        // Create a worker thread to process the data
        let worker = new Worker('processor.js');

        // Listen for the message to come back to make our graphics
        worker.addEventListener('message', (e) => {
          let data = JSON.parse(e.data);
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
