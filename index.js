const getAndWriteAllEventsFromAPI = require("./getEventsFromAPI");
const generateTags = require("./generateTags");
const convertToCSV = require("./toDataframe");

async function Main() {
  console.log("Getting events from API...");
  await getAndWriteAllEventsFromAPI();
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log("Generating tags...");
  await generateTags();
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log("Converting to CSV...");
  await convertToCSV();
  console.log("Done!");
}

Main();
