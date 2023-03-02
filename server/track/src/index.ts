import http from "http";
import express from "express";
import { Logger } from "tslog";
import Keyv from "keyv";
import * as YoutubeStreamUrl from "youtube-stream-url";

// Set Port Number
// prettier-ignore
const PORT = process.env.PORT && Number(process.env.PORT) ? Number(process.env.PORT) : 8080

// Change default console to 'tslog'
const console = new Logger();

// continue process when an error occurs and log
process.on("uncaughtException", (err) => console.error(err));

// Set Router
let app = express();

// Set default response mode to json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_, res) => {
  res.send(JSON.stringify({}));
});

app.post("/play", (req, res) => {
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
    
  } else res.status(500).send({});
});

// Create http server
http.createServer(app).listen(PORT, () => {
  console.info("start track-api");
});
