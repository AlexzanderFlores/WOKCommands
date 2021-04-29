"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var fs_1 = __importDefault(require("fs"));
var getAllFiles = function (dir) {
    var files = fs_1.default.readdirSync(dir, {
        withFileTypes: true,
    });
    var jsFiles = [];
    for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
        var file = files_1[_i];
        if (file.isDirectory()) {
            jsFiles = __spreadArrays(jsFiles, getAllFiles(dir + "/" + file.name));
        }
        else if ((file.name.endsWith('.js') || file.name.endsWith('.ts')) && !file.name.startsWith('!')) {
            var fileName = file.name.replace(/\\/g, '/').split('/');
            fileName = fileName[fileName.length - 1];
            fileName = fileName.split('.')[0].toLowerCase();
            jsFiles.push([dir + "/" + file.name, fileName]);
        }
    }
    return jsFiles;
};
module.exports = getAllFiles;
