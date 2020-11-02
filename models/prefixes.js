"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var mongoose_1 = __importDefault(require("mongoose"));
var reqString = {
    type: String,
    required: true,
};
var prefixSchema = new mongoose_1.default.Schema({
    // Guild ID
    _id: reqString,
    prefix: reqString,
});
module.exports = mongoose_1.default.model('wokcommands-prefixes', prefixSchema);
