import express from "express";
import bodyParser from "body-parser";
import Keyv from "keyv";
import KeyvFile from "keyv-file";
import { Logger } from "tslog";

class Database {
  private _store: KeyvFile;
  private _database: Keyv;

  // prettier-ignore
  public get = async () => (await this._database.get("main")) as {[ name: string ]: { domain: string, description: string }};
  // prettier-ignore
  public set = async (value: {[ name: string ]: { domain: string, description: string }}) => await this._database.set("main", value);

  constructor(
    option = {
      filename: "../database.json",
      writeDelay: 100,
      encode: JSON.stringify,
      decode: JSON.parse,
    }
  ) {
    this._store = new KeyvFile(option);
    this._database = new Keyv({ store: this._store });
  }
}

const console = new Logger();
const app = express();
const database = new Database();

process.on("uncaughtException", (err) => console.error(err));

// prettier-ignore
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Get list
app.get("/api/v1/", async (_, res) => {
  let data = await database.get();
  res.status(200).send(JSON.stringify(data));
});

// Get one
app.get("/api/v1/:name", async (req, res) => {
  let data = await database.get();
  if (Object.keys(data).includes(req.params.name)) {
    res.status(200).end(JSON.stringify(data[req.params.name]));
  } else {
    res.status(404).end();
  }
});

// Create new one
app.post("/api/v1/", async (req, res) => {
  if (
    !!req.body.name &&
    !!req.body.domain &&
    !!req.body.description &&
    Object.keys(req.body).length == 3
  ) {
    let data = await database.get();
    data[req.body.name] = {
      domain: req.body.domain,
      description: req.body.description,
    };
    await database.set(data);
    res.status(200).end();
  } else {
    res.status(400).end();
  }
});

// Delete one
app.delete("/api/v1/:name", async (req, res) => {
  let data = await database.get();
  if (Object.keys(data).includes(req.params.name)) {
    // prettier-ignore
    let newData: { [name: string]: { domain: string; description: string } } = {};
    Object.keys(data)
      .filter((name) => req.params.name != name)
      .forEach((name) => {
        newData[name] = data[name];
      });
    await database.set(newData);
    res.status(200).end();
  } else {
    res.status(400).end();
  }
});

app.listen(3000, () => console.info("cns ready"));
