"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const keyv_1 = __importDefault(require("keyv"));
const keyv_file_1 = __importDefault(require("keyv-file"));
const tslog_1 = require("tslog");
class Database {
    constructor(option = {
        filename: "../database.json",
        writeDelay: 100,
        encode: JSON.stringify,
        decode: JSON.parse,
    }) {
        // prettier-ignore
        this.get = () => __awaiter(this, void 0, void 0, function* () { return (yield this._database.get("main")); });
        // prettier-ignore
        this.set = (value) => __awaiter(this, void 0, void 0, function* () { return yield this._database.set("main", value); });
        this._store = new keyv_file_1.default(option);
        this._database = new keyv_1.default({ store: this._store });
    }
}
const console = new tslog_1.Logger();
const app = (0, express_1.default)();
const database = new Database();
process.on("uncaughtException", (err) => console.error(err));
// prettier-ignore
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(body_parser_1.default.json());
app.get("/api/v1/", (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = yield database.get();
    res.status(200).send(JSON.stringify(data));
}));
app.get("/api/v1/:name", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = yield database.get();
    if (Object.keys(data).includes(req.params.name)) {
        res.status(200).end(JSON.stringify(data[req.params.name]));
    }
    else {
        res.status(404).end();
    }
}));
app.post("/api/v1/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!!req.body.name &&
        !!req.body.domain &&
        !!req.body.description &&
        Object.keys(req.body).length == 3) {
        let data = yield database.get();
        data[req.body.name] = {
            domain: req.body.domain,
            description: req.body.description,
        };
        yield database.set(data);
        res.status(200).end();
    }
    else {
        res.status(400).end();
    }
}));
app.delete("/api/v1/:name", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = yield database.get();
    if (Object.keys(data).includes(req.params.name)) {
        // prettier-ignore
        let newData = {};
        Object.keys(data)
            .filter((name) => req.params.name != name)
            .forEach((name) => {
            newData[name] = data[name];
        });
        yield database.set(newData);
        res.status(200).end();
    }
    else {
        res.status(400).end();
    }
}));
app.listen(3000, () => console.info("cns ready"));
//# sourceMappingURL=index.js.map