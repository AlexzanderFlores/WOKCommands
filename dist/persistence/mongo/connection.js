"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMongoConnection = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.default = async (mongoPath, instance, dbOptions = {}) => {
    const options = {
        keepAlive: true,
        ...dbOptions,
    };
    await mongoose_1.default.connect(mongoPath, options);
    const { connection } = mongoose_1.default;
    return connection;
};
const getMongoConnection = () => {
    return mongoose_1.default.connection;
};
exports.getMongoConnection = getMongoConnection;
