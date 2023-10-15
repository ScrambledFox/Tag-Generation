const getAndWriteAllEventsFromAPI = require("./util/getEventsFromAPI");
const generateTags = require("./util/generateTags");
const convertToCSV = require("./util/toDataframe");
const cleanData = require("./util/dataCleaning");

async function Main() {
  // console.log("Getting events from API...");
  // await getAndWriteAllEventsFromAPI();
  // await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log("Generating tags...");
  await generateTags();
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log("Cleaning Data...");
  await cleanData();
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log("Converting to CSV...");
  await convertToCSV();
  console.log("Done!");
}

Main();
