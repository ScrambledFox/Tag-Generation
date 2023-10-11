const fs = require("fs");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const path = require("path");
const process = require("process");

const PROCESSED_PATH = path.join(process.cwd(), "data");
const FILENAME = "multiTaggedEvents.json";

const { randomInt } = require("crypto");

const readEvents = () => {
  return JSON.parse(
    fs.readFileSync(path.join(PROCESSED_PATH, FILENAME), "utf8")
  );
};

const toDataframeFormat = (events) => {
  const dataframe = [];
  for (const event of events) {
    if (event.foundTags.length === 0) continue;

    event.tag = event.foundTags[0];

    const start = new Date(event.start.dateTime);
    const end = new Date(event.end.dateTime);

    // Check if start or end are NaN
    if (isNaN(start.getTime()) || isNaN(end.getTime())) continue;

    const avgHeartrate =
      (end - start) / 1000 / 60 +
      0.1 * (randomInt(0, 100) - 50) +
      (event.tag === "work" ? 100 : 0);

    dataframe.push({
      duration: (end - start) / 1000 / 60,
      tag: event.tag,
      avgh: avgHeartrate,
    });
  }

  console.log(
    `Converted ${dataframe.length} out of ${events.length} events to dataframe format!`
  );
  return dataframe;
};

const writeToCsv = (dataframe) => {
  const csvWriter = createCsvWriter({
    path: path.join(process.cwd(), "data", "dataframe.csv"),
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

const convertToCSV = async () => {
  const events = readEvents();
  const dataframe = toDataframeFormat(events);
  writeToCsv(dataframe);
};

module.exports = convertToCSV;
