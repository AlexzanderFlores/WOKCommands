"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var mongoose_1 = __importDefault(require("mongoose"));
var reqString = {
    type: String,
    required: true,
};
var requiredRoleSchema = new mongoose_1.default.Schema({
    guildId: reqString,
    command: reqString,
    requiredRoles: {
        type: [String],
        required: true,
    },
});
module.exports = mongoose_1.default.model('wokcommands-required-roles', requiredRoleSchema);
