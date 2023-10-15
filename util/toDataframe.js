const { randomInt } = require("crypto");
const { writeDataframe, readCleanedEvents } = require("./fs");

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

const convertToCSV = async () => {
  const events = readCleanedEvents();
  const dataframe = toDataframeFormat(events);
  writeDataframe(dataframe);
};

module.exports = convertToCSV;
