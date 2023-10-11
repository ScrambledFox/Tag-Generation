const fs = require("fs").promises;
const path = require("path");
const process = require("process");

const PROCESSED_PATH = path.join(process.cwd(), "data");
const FILENAME = "events.json";

const tags = require("./tagConfig.json");

// Read the events from a file using fs promises api.
async function readEvents() {
  const events = await fs.readFile(path.join(PROCESSED_PATH, FILENAME), "utf8");
  return JSON.parse(events);
}

function objectContainsKeyword(obj, keyword) {
  keyword = keyword.toLowerCase();

  if (typeof obj == "object") {
    for (const child in obj) {
      const doesContain = objectContainsKeyword(obj[child], keyword);

      if (doesContain) return true;
    }
  } else {
    if (typeof obj == "string") {
      if (obj.toLowerCase().includes(keyword)) {
        return true;
      }
    }
  }

  return false;
}

async function addTagsToEvents(events, tags) {
  for (const event of events) {
    event.foundTags = [];

    for (const tag of tags) {
      for (const keyword of tag.keywords) {
        if (event.foundTags.includes(tag.id)) continue;
        if (objectContainsKeyword(event, keyword)) event.foundTags.push(tag.id);
      }
    }
  }
}

// Write the events to a file.
async function writeEvents(events) {
  fs.mkdir(PROCESSED_PATH, { recursive: true });
  await fs.writeFile(
    path.join(PROCESSED_PATH, "multiTaggedEvents.json"),
    JSON.stringify(events, null, 2)
  );
}

// Main function
async function generateTags() {
  const events = await readEvents();
  await addTagsToEvents(events, tags);
  await writeEvents(events);

  console.log("Done generating tags!");
}

module.exports = generateTags;
