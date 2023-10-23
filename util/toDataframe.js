const { writeDataframe, readCleanedEvents } = require("./fs");
const TAGS = require("../config/tags.json");

const toDataframeFormat = (events, eventsPerDay) => {
  const dataframe = [];
  for (const event of events) {
    // DO MULTIPLE TAGS, SO IGNORE THIS
    // Get most prominent tag
    // event.tag = getMostProminentTagFromEvent(event);
    // if (event.tag === undefined) continue;

    // Skip if no tags found
    if (event.foundTags.length === 0) continue;

    // Get binary array of all tags present, so false for not present and true for present
    const allTags = [];
    for (const tag of TAGS) {
      allTags[tag.id] = event.foundTags.some(
        (foundTag) => foundTag.id === tag.id
      );
    }

    // Get start and end times
    const start = new Date(event.start.dateTime);
    const end = new Date(event.end.dateTime);

    // Check if start or end are NaN
    if (isNaN(start.getTime()) || isNaN(end.getTime())) continue;

    const startOfDay = new Date(start);
    startOfDay.setHours(0, 0, 0, 0);

    // Push data entry
    dataframe.push({
      ...allTags,
      duration: (end - start) / 1000 / 60,
      dayOfWeek: start.getDay(),
      hourOfDay: start.getHours(),
      startTime: start.getTime(),
      endTime: end.getTime(),
      eventsPerDay: eventsPerDay[startOfDay.getTime()].length,
    });
  }

  console.log(
    `Converted ${dataframe.length} out of ${events.length} events to dataframe format!`
  );
  return dataframe;
};

const countEventsPerDay = (events) => {
  const eventsPerDay = [];

  for (const event of events) {
    const start = new Date(event.start.dateTime);
    start.setHours(0, 0, 0, 0);
    const date = start.getTime();

    if (eventsPerDay[date] === undefined) {
      eventsPerDay[date] = [];
    }

    eventsPerDay[date].push(event);
  }

  return eventsPerDay;
};

const convertToCSV = async () => {
  const events = readCleanedEvents();
  const eventsPerDay = countEventsPerDay(events);
  const dataframe = toDataframeFormat(events, eventsPerDay);
  writeDataframe(dataframe);
};

module.exports = convertToCSV;
