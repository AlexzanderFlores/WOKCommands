"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var fs_1 = __importDefault(require("fs"));
var get_all_files_1 = __importDefault(require("./get-all-files"));
var FeatureHandler = /** @class */ (function () {
    function FeatureHandler(client, dir) {
        var _this = this;
        this._features = new Map(); // <Feature name, Disabled GuildIDs>
        this.isEnabled = function (guildId, feature) {
            return !(_this._features.get(feature) || []).includes(guildId);
        };
        if (dir) {
            if (fs_1.default.existsSync(dir)) {
                var files = get_all_files_1.default(dir);
                var amount = files.length;
                if (amount > 0) {
                    console.log("WOKCommands > Loaded " + amount + " listener" + (amount === 1 ? '' : 's') + ".");
                    var _loop_1 = function (file) {
                        var func = require(file);
                        if (typeof func === 'function') {
                            func(client, function (guildId) {
                                return _this.isEnabled(guildId, file);
                            });
                        }
                    };
                    for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
                        var file = files_1[_i][0];
                        _loop_1(file);
                    }
                }
            }
            else {
                throw new Error("Listeners directory \"" + dir + "\" doesn't exist!");
            }
        }
    }
    return FeatureHandler;
}());
module.exports = FeatureHandler;
