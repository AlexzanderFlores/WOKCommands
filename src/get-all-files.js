"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var fs_1 = __importDefault(require("fs"));
var getAllFiles = function (dir, extension) {
    var files = fs_1.default.readdirSync(dir, {
        withFileTypes: true,
    });
    var jsFiles = [];
    for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
        var file = files_1[_i];
        if (file.isDirectory()) {
            jsFiles = __spreadArray(__spreadArray([], jsFiles), getAllFiles(dir + "/" + file.name));
        }
        else if (file.name.endsWith(extension || '.js') &&
            !file.name.startsWith('!')) {
            var fileName = file.name.replace(/\\/g, '/').split('/');
            fileName = fileName[fileName.length - 1];
            fileName = fileName.split('.')[0].toLowerCase();
            jsFiles.push([dir + "/" + file.name, fileName]);
        }
    }
    return jsFiles;
};
module.exports = getAllFiles;
