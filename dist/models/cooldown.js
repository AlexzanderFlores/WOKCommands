"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var mongoose_1 = __importDefault(require("mongoose"));
var reqString = {
    type: String,
    required: true,
};
var cooldownSchema = new mongoose_1.default.Schema({
    // Command-GuildID or Command-GuildID-UserID
    _id: reqString,
    name: reqString,
    type: reqString,
    cooldown: {
        type: Number,
        required: true,
    },
});
module.exports = mongoose_1.default.model('wokcommands-cooldowns', cooldownSchema);
