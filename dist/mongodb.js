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
const mongoose_1 = __importDefault(require("mongoose"));
// Mongo DB connection
if (process.env.MONGO_URI === undefined) {
    throw Error('Please include MONGO_URI in your .env file in the root directory');
}
mongoose_1.default.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
// Setup Url schema
const Schema = mongoose_1.default.Schema;
const urlSchema = new Schema({
    id: {
        type: Number,
        required: true,
    },
    url: {
        type: String,
        required: true,
    }
});
const Url = mongoose_1.default.model('Url', urlSchema);
// Utility functions
exports.findUrls = (url) => __awaiter(void 0, void 0, void 0, function* () {
    const query = Url.find({ url });
    const dbUrls = yield query.exec();
    return dbUrls;
});
exports.allUrlsCount = () => __awaiter(void 0, void 0, void 0, function* () {
    const allUrls = yield Url.estimatedDocumentCount();
    return allUrls;
});
exports.createNewUrlEntry = (url) => __awaiter(void 0, void 0, void 0, function* () {
    const newId = (yield exports.allUrlsCount()) + 1;
    const newUrl = new Url({
        id: newId,
        url,
    });
    return yield newUrl.save();
});
exports.getUrlById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const query = Url.find({ id });
    const ids = yield query.exec();
    return ids[0];
});
