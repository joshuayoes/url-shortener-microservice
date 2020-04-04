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
require('dotenv').config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const dns_1 = __importDefault(require("dns"));
const mongodb_1 = require("./mongodb");
// Basic Configuration 
const app = express_1.default();
const port = process.env.PORT || 3000;
// Middleware
app.use(cors_1.default());
app.use(body_parser_1.default.urlencoded({ extended: true }));
// Set public directory for assets
app.use('/public', express_1.default.static(__dirname + '/public'));
// Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});
app.post('/api/shorturl/new', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { url } = req.body;
    // strips http(s):// and routes (i.e. hostname/api/routes) from url
    const regex = /(http:|https:)\/\/|\/[\d\w-\$\_\.\+\!\*\‘\(\)\,\%\?\=\#]*/gi;
    const host = url.replace(regex, '');
    // async wrapper for dns.lookup() method
    const dnsLookup = (host) => {
        return new Promise((resolve, reject) => {
            dns_1.default.lookup(host, (err, address, family) => {
                if (err) {
                    reject(err);
                }
                resolve({ address, family });
            });
        });
    };
    try {
        // validate that url is valid 
        yield dnsLookup(host);
    }
    catch (_a) {
        // send error if invalid url 
        return res.json({
            "error": "invalid URL"
        });
    }
    ;
    // check to see if Url is already in database
    const urlExistsInDatabase = (yield mongodb_1.findUrls(url)).length === 1;
    // if Url is already in database, return existing short_url
    if (urlExistsInDatabase) {
        const existingUrl = (yield mongodb_1.findUrls(url))[0];
        return res.status(200).json({
            "original_url": url,
            "short_url": existingUrl.id
        });
    }
    // if Url is not in database, create new entry
    try {
        const newUrl = yield mongodb_1.createNewUrlEntry(url);
        res.status(200).json({
            "original_url": newUrl.url,
            "short_url": newUrl.id,
        });
    }
    catch (err) {
        // send error if invalid url 
        return res.status(500).send(err);
    }
}));
// redirect users to url in database
app.get('/api/shorturl/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    const { url } = yield mongodb_1.getUrlById(id);
    res.writeHead(302, {
        "Location": url
    });
    res.end();
}));
// Mount server
app.listen(port, () => console.log('Listening on port 3000...'));
