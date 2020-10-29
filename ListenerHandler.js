"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var fs_1 = __importDefault(require("fs"));
var get_all_files_1 = __importDefault(require("./get-all-files"));
var ListenerHandler = /** @class */ (function () {
    function ListenerHandler(client, dir) {
        if (dir) {
            if (fs_1.default.existsSync(dir)) {
                var files = get_all_files_1.default(dir);
                var amount = files.length;
                if (amount > 0) {
                    console.log("WOKCommands > Loaded " + amount + " listener" + (amount === 1 ? '' : 's') + ".");
                    for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
                        var _a = files_1[_i], file = _a[0], fileName = _a[1];
                        var func = require(file);
                        var feature = func.feature;
                        if (!feature) {
                            throw new Error("\n\nFeature \"" + fileName + "\" does not export a \"feature\" object. See\n\nhttps://github.com/AlexzanderFlores/WOKCommands#creating-a-feature\n\nfor more information.\n\n");
                        }
                        var name_1 = feature.name, canDisable = feature.canDisable, notFeature = feature.notFeature;
                        if (notFeature === true) {
                            continue;
                        }
                        if (name_1 === undefined || canDisable === undefined) {
                            throw new Error("\n\nFeature \"" + fileName + "\" is missing \"name\" and/or \"canDisable\" properties without \"notFeature\" being set to true. See\n\nhttps://github.com/AlexzanderFlores/WOKCommands#creating-a-feature\n\nfor more information.\n\n");
                        }
                        if (typeof func === 'function') {
                            func(client);
                        }
                    }
                }
            }
            else {
                throw new Error("Listeners directory \"" + dir + "\" doesn't exist!");
            }
        }
    }
    return ListenerHandler;
}());
module.exports = ListenerHandler;
