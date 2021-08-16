"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const mongoose_1 = __importDefault(require("mongoose"));
const reqString = {
    type: String,
    required: true,
};
const prefixSchema = new mongoose_1.default.Schema({
    // Guild ID
    _id: reqString,
    prefix: reqString,
});
module.exports = mongoose_1.default.model('wokcommands-prefixes', prefixSchema);
