const tags = require("../config/tags.json");
const { readRawEvents, writeTaggedEvents, writeDataframe } = require("./fs");

const objectContainsKeyword = (obj, keyword, { exact = false } = {}) => {
  keyword = keyword.toLowerCase();

  if (typeof obj == "object") {
    for (const child in obj) {
      const doesContain = objectContainsKeyword(obj[child], keyword, {
        exact: exact,
      });

      if (doesContain) return true;
    }
  } else if (typeof obj == "string") {
    if (exact) {
      for (let word of obj.split(" ")) {
        if (word.trim().toLowerCase() === keyword) {
          // console.log("Found keyword: " + word + " == " + keyword);
          return true;
        }
      }
    } else {
      if (obj.toLowerCase().includes(keyword)) {
        return true;
      }
    }
  }

  return false;
};

const eventIsInRange = (event, tag) => {
  if (tag.dateRange === undefined || Object.keys(tag.dateRange).length === 0)
    return true;

  const minTime = new Date(tag.dateRange.min);
  const maxTime = new Date(tag.dateRange.max);

  if (isNaN(minTime.getTime()) || isNaN(maxTime.getTime())) return false;

  const eventStartTime = new Date(event.dateTime);
  const eventEndTime = new Date(event.dateTime);

  return eventStartTime >= minTime && eventEndTime <= maxTime;
};

const eventContainsExcludes = (event, tag) => {
  if (tag.exclude === undefined) return false;

  for (const excludeMatch of tag.exclude) {
    if (objectContainsKeyword(event, excludeMatch, { exact: false })) {
      return true;
    }
  }

  return false;
};

async function checkEventsForTag(events, tags) {
  for (const event of events) {
    event.foundTags = [];

    // Check for each tag.
    for (const tag of tags) {
      // Check dateRange
      if (!eventIsInRange(event, tag)) continue;

      // Check excludes first.
      if (eventContainsExcludes(event, tag)) continue;

      // Check for exact matches.
      for (const exactMatch of tag.exact) {
        if (objectContainsKeyword(event, exactMatch, { exact: true })) {
          addTagToEvent(event, tag);
        }
      }

      // Check for keywords.
      for (const keyword of tag.keywords) {
        if (objectContainsKeyword(event, keyword, { exact: false })) {
          addTagToEvent(event, tag);
        }
      }
    }
  }
}

const addTagToEvent = (event, tag) => {
  let foundTag = false;
  event.foundTags.forEach((existingTag, i) => {
    if (existingTag.id === tag.id) {
      event.foundTags[i].count++;
      foundTag = true;
    }
  });

  if (!foundTag) {
    event.foundTags.push({
      id: tag.id,
      count: 1,
    });
  }
};

// Main function
async function generateTags() {
  const events = readRawEvents();
  await checkEventsForTag(events, tags);
  writeTaggedEvents(events);

  console.log("Done generating tags!");
}

module.exports = generateTags;
