"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var mongoose_1 = __importDefault(require("mongoose"));
var reqString = {
    type: String,
    required: true,
};
var channelCommandSchema = new mongoose_1.default.Schema({
    guildId: reqString,
    command: reqString,
    channels: {
        type: [String],
        required: true,
    },
});
module.exports = mongoose_1.default.model("wokcommands-channel-commands", channelCommandSchema);
