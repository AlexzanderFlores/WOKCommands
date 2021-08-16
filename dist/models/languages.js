"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const mongoose_1 = __importDefault(require("mongoose"));
const reqString = {
    type: String,
    required: true,
};
const languageSchema = new mongoose_1.default.Schema({
    // GuildID
    _id: reqString,
    language: reqString,
});
module.exports = mongoose_1.default.model('wokcommands-languages', languageSchema);
