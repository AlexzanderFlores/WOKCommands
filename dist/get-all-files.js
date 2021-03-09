"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var fs_1 = require("fs");
var getAllFiles = function (dir) {
    var fileType;
    if (require.main.filename.endsWith(".ts"))
        fileType = ".ts";
    else
        fileType = ".js";
    var files = fs_1.readdirSync(dir, {
        withFileTypes: true,
    });
    var wantedFiles = [];
    for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
        var file = files_1[_i];
        if (file.isDirectory()) {
            wantedFiles = __spreadArrays(wantedFiles, getAllFiles(dir + "/" + file.name));
        }
        else {
            if (file.name.endsWith(fileType) && !file.name.startsWith("!") && !file.name.endsWith(".d.ts")) {
                var fileName = file.name
                    .replace(/\\/g, "/")
                    .split("/");
                fileName = fileName[fileName.length - 1];
                fileName = fileName.split(".")[0].toLowerCase();
                wantedFiles.push([dir + "/" + file.name, fileName]);
            }
        }
    }
    return wantedFiles;
};
module.exports = getAllFiles;
