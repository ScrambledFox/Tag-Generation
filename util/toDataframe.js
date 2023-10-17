const { randomInt } = require("crypto");
const { writeDataframe, readCleanedEvents } = require("./fs");
const getMostProminentTagFromEvent = require("./events");

const toDataframeFormat = (events) => {
  const dataframe = [];
  for (const event of events) {
    // Get most prominent tag
    event.tag = getMostProminentTagFromEvent(event);
    if (event.tag === undefined) continue;

    // Get start and end times
    const start = new Date(event.start.dateTime);
    const end = new Date(event.end.dateTime);

    // Check if start or end are NaN
    if (isNaN(start.getTime()) || isNaN(end.getTime())) continue;

    // Push data entry
    dataframe.push({
      tag: event.tag,
      duration: (end - start) / 1000 / 60,
      dayOfWeek: start.getDay(),
      hourOfDay: start.getHours(),
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
