const config = require("../config/config.json");
const { readTaggedEvents, writeCleanedEvents } = require("./fs");

const filterEvents = (events) => {
  let filteredEvents = [];

  for (const event of events) {
    let object = {
      id: event.id,
      created: event.created,
      updated: event.updated,
      summary: event.summary,
      description: event.description,
      location: event.location,
      creator: event.creator,
      organizer: event.organizer,
      colorId: event.colorId,
      start: event.start,
      end: event.end,
      foundTags: event.foundTags,
      duration: event.duration,
    };
    filteredEvents.push(object);
  }

  return filteredEvents;
};

const cleanData = async () => {
  let events = readTaggedEvents();

  // Exclude agendas
  let includedEvents = [];
  for (const event of events) {
    for (const agenda in config.agendas) {
      if (
        event.organizer.displayName?.toLowerCase().includes(agenda) ||
        event.organizer.email?.toLowerCase().includes(agenda)
      ) {
        includedEvents.push(event);
        break;
      }
    }
  }
  events = includedEvents;

  // // Calculate duration
  for (const event of events) {
    const start = new Date(event.start.dateTime);
    const end = new Date(event.end.dateTime);

    // Check if start or end are NaN
    if (isNaN(start.getTime()) || isNaN(end.getTime())) event.duration = NaN;

    event.duration = (end - start) / 1000 / 60 / 60;
  }

  // Exclude events with duration < config max duration
  events = events.filter((event) => !isNaN(event.duration));
  events = events.filter(
    (event) => event.duration < config.maxEventDurationInHours
  );

  events = filterEvents(events);

  writeCleanedEvents(events);
};

module.exports = cleanData;
