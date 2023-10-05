const fs = require("fs").promises;
const path = require("path");
const process = require("process");

const { google } = require("googleapis");
const { authenticate } = require("@google-cloud/local-auth");
const { auth } = require("googleapis/build/src/apis/abusiveexperiencereport");

const SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];

const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");
const TOKEN_PATH = path.join(process.cwd(), "token.json");

const DATA_FOLDER_PATH = path.join(process.cwd(), "calendar_data");

async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: "authorized_user",
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

/**
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function getCalendarList(auth) {
  const calendar = google.calendar({ version: "v3", auth });
  const res = await calendar.calendarList.list({});
  return res.data.items;
}

/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function listEvents(auth) {
  const calendar = google.calendar({ version: "v3", auth });
  const res = await calendar.events.list({
    calendarId: "primary",
    timeMin: new Date().toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: "startTime",
  });
  const events = res.data.items;
  if (!events || events.length === 0) {
    console.log("No upcoming events found.");
    return;
  }
  console.log("Upcoming 10 events:");
  events.map((event, i) => {
    const start = event.start.dateTime || event.start.date;
    console.log(`${start} - ${event.summary}`);
  });
}

/**
 *
 * @param {google.auth.OAuth2} auth Google API client
 * @param {google.calendar} calendar Calander of which to get the events.
 * @returns
 */
async function getEventList(auth, calendar) {
  const api = google.calendar({ version: "v3", auth });
  const res = await api.events.list({
    calendarId: calendar.id,
    timeMin: new Date().toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: "startTime",
  });
  const events = res.data.items;
  if (!events || events.length === 0) {
    return [];
  }
  return events;
}

/**
 * Get all events
 */
async function getAndWriteAllEvents() {
  const client = await authorize();
  const calendarSources = await getCalendarList(client);

  let events = [];

  for (const calendar of calendarSources) {
    const calendarEvents = await getEventList(client, calendar);
    events = events.concat(calendarEvents);
  }

  // Write to data folder
  fs.mkdir(DATA_FOLDER_PATH, { recursive: true });
  fs.writeFile(
    path.join(DATA_FOLDER_PATH, "events.json"),
    JSON.stringify(events)
  );
}

getAndWriteAllEvents().catch(console.error);
