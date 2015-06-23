const GRAPHIC_WIDTH_LARGE = 900;

$(document).ready(() => {
  $('form').submit(() => {
    let file = $('.csvfile').get(0).files[0];
    let reader = new FileReader();
    reader.onloadend = () => {
      // The first few lines in the Steam CSV files aren't part of the CSV data so we
      // need to just remove them.
      let csvData = reader.result;
      csvData = csvData.substring(csvData.indexOf('\n') + 1);
      csvData = csvData.substring(csvData.indexOf('\n') + 1);
      csvData = csvData.substring(csvData.indexOf('\n') + 1);

      // Parse what we have left
      let csvResult = CSV.parse(csvData);
      console.log(csvResult);
    };
    reader.readAsBinaryString(file);

    return false;
  });
});
