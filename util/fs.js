const fs = require("fs");
const path = require("path");

const csvReader = require("csv-parser");

const PROCESSED_PATH = path.join(process.cwd(), "data");
const RAW_EVENTS_FILE = "events.json";
const TAGGED_EVENTS_FILE = "taggedEvents.json";
const CLEANED_EVENTS_FILE = "cleanedEvents.json";
const DATAFRAME_FILE = "dataframe.csv";

const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const readRawEvents = () => {
  return JSON.parse(
    fs.readFileSync(path.join(PROCESSED_PATH, RAW_EVENTS_FILE), "utf8")
  );
};

const writeRawEvents = (events) => {
  fs.writeFileSync(
    path.join(PROCESSED_PATH, RAW_EVENTS_FILE),
    JSON.stringify(events)
  );
};

const readTaggedEvents = () => {
  return JSON.parse(
    fs.readFileSync(path.join(PROCESSED_PATH, TAGGED_EVENTS_FILE), "utf8")
  );
};

const writeTaggedEvents = (events) => {
  fs.writeFileSync(
    path.join(PROCESSED_PATH, TAGGED_EVENTS_FILE),
    JSON.stringify(events)
  );
};

const readCleanedEvents = () => {
  return JSON.parse(
    fs.readFileSync(path.join(PROCESSED_PATH, CLEANED_EVENTS_FILE), "utf8")
  );
};

const writeCleanedEvents = (events) => {
  fs.writeFileSync(
    path.join(PROCESSED_PATH, CLEANED_EVENTS_FILE),
    JSON.stringify(events)
  );
};

const readDataframe = () => {
  let results = [];
  fs.createReadStream(path.join(PROCESSED_PATH, DATAFRAME_FILE))
    .pipe(csvReader())
    .on("data", (row) => {
      results.push(row);
    })
    .on("end", () => {
      return results;
    });
};

const writeDataframe = (dataframe) => {
  const csvWriter = createCsvWriter({
    path: path.join(PROCESSED_PATH, DATAFRAME_FILE),
    header: [
      { id: "duration", title: "DURATION" },
      { id: "tag", title: "TAG" },
      { id: "avgh", title: "AVERAGE_HEARTRATE" },
    ],
  });

  csvWriter.writeRecords(dataframe).then(() => {
    console.log(`Done writing ${dataframe.length} records!`);
  });
};

module.exports = {
  readRawEvents,
  writeRawEvents,
  readTaggedEvents,
  writeTaggedEvents,
  readCleanedEvents,
  writeCleanedEvents,
  readDataframe,
  writeDataframe,
};
