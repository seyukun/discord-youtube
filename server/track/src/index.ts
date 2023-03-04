import http from "http";
import express from "express";
import { Logger } from "tslog";
import Keyv from "keyv";
import * as YoutubeStreamUrl from "youtube-stream-url";
import axios from "axios";

// Set Port Number
// prettier-ignore
const PORT = process.env.PORT && Number(process.env.PORT) ? Number(process.env.PORT) : 8080

// Change default console to 'tslog'
const console = new Logger();

// prettier-ignore
const debug = async (message: any) => (!!process.env.debug ? console.debug(message) : null)

// continue process when an error occurs and log
process.on("uncaughtException", (err) => console.error(err));

// Set database
interface Database {
  id: string;
  urls: string[];
}
let database = new Keyv();

// Set Router
let app = express();

// Set default response mode to json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function append(res: express.Response, req: express.Request) {
  // Get and Parse request body
  let json = JSON.parse(req.body);

  // List json keys
  let keys: string[] = json.keys();

  /**
   * Make sure its like this interface
   * { id: string, url: string }
   */
  if (
    keys.length == 2 &&
    keys.includes("id") &&
    keys.includes("url") &&
    typeof json["id"] == "string" &&
    typeof json["url"] == "string"
  ) {
    let id = json["id"];
    let url = json["url"];

    // Get track data from database
    let data = (await database.get(id)) as Database | undefined;

    // if data is empty, init
    // prettier-ignore
    if (data == undefined) data = { id: id, urls: [] } as Database;

    // append url to data
    data.urls.push(url);

    // Set data to database
    await database.set(id, data);

    // Send response
    res.send({});
  } else res.status(500).send({});
}

async function remove(res: express.Response, req: express.Request) {
  // Get and Parse request body
  let json = JSON.parse(req.body);

  // List json keys
  let keys: string[] = json.keys();

  /**
   * Make sure its like this interface
   * { id: string, number: number }
   */
  if (
    keys.length == 2 &&
    keys.includes("id") &&
    keys.includes("number") &&
    typeof json["id"] == "string" &&
    typeof json["number"] == "number"
  ) {
    let id = json["id"];
    let number = json["number"];
    let flag = false;

    // Get data
    let data = (await database.get(id)) as Database | undefined;

    // if data is empty, init
    // prettier-ignore
    if (data == undefined) data = { id: id, urls: [] } as Database;

    // Make sure the number is vaild
    if (data.urls.length <= number) {
      data.urls.slice()
      res.send({});
    } else res.status(500).send({});
  } else res.status(500).send({});
}

async function play(res: express.Response, req: express.Request) {
  // Get and Parse request body
  let json = JSON.parse(req.body);

  // List json keys
  let keys: string[] = json.keys();

  /**
   * Make sure its like this interface
   * { id: string, url: string }
   */
  if (
    keys.length == 2 &&
    keys.includes("id") &&
    keys.includes("url") &&
    typeof json["id"] == "string" &&
    typeof json["url"] == "string"
  ) {
    let id = json["id"];
    let url = json["url"];
    let flag = false;

    // Make sure the url is youtube
    if (
      url.startsWith("https://youtube.com") ||
      url.startsWith("https://www.youtube.com") ||
      url.startsWith("https://youtu.be") ||
      url.startsWith("http://youtube.com") ||
      url.startsWith("http://www.youtube.com") ||
      url.startsWith("http://youtu.be")
    ) {
      axios.post("http://youtube-api:8080/", { id: id, url: url });
      flag = true;
    }

    // Send response
    if (flag) res.send({});
    else res.status(500).send({});
  } else res.status(500).send({});
}

async function destroy(res: express.Response, req: express.Request) {}

app.post("/append", append);
app.post("/play", play);
app.post("/add", play);
app.post("/remove", remove);
app.post("/destroy", destroy);
app.post("/stop", destroy);

// Create http server
http.createServer(app).listen(PORT, () => {
  console.info("start track-api");
});
