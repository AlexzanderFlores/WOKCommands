"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const fs_1 = __importDefault(require("fs"));
const getAllFiles = (dir, extension) => {
    const files = fs_1.default.readdirSync(dir, {
        withFileTypes: true,
    });
    let jsFiles = [];
    for (const file of files) {
        if (file.isDirectory()) {
            jsFiles = [...jsFiles, ...getAllFiles(`${dir}/${file.name}`, extension)];
        }
        else if (file.name.endsWith(extension || '.js') &&
            !file.name.startsWith('!')) {
            let fileName = file.name.replace(/\\/g, '/').split('/');
            fileName = fileName[fileName.length - 1];
            fileName = fileName.split('.')[0].toLowerCase();
            jsFiles.push([`${dir}/${file.name}`, fileName]);
        }
    }
    return jsFiles;
};
module.exports = getAllFiles;
