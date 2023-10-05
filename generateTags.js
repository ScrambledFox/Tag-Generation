const fs = require("fs").promises;
const path = require("path");
const process = require("process");

const PROCESSED_PATH = path.join(process.cwd(), "processed_data");

const tags = require("./tagConfig.json");
const events = require("./calendar_data/events.json");

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

function addTagsToEvents(events, tags) {
  for (const event of events) {
    event.foundTags = [];
    event.tag = "none";

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
async function main() {
  addTagsToEvents(events, tags);
  await writeEvents(events);

  console.log("Done!");
}

main();
