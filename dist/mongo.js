"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMongoConnection = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Events_1 = __importDefault(require("./enums/Events"));
const results = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting',
};
const mongo = async (mongoPath, instance, dbOptions = {}) => {
    await mongoose_1.default.connect(mongoPath, {
        keepAlive: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        ...dbOptions,
    });
    const { connection } = mongoose_1.default;
    const state = results[connection.readyState] || 'Unknown';
    instance.emit(Events_1.default.DATABASE_CONNECTED, connection, state);
};
const getMongoConnection = () => {
    return mongoose_1.default.connection;
};
exports.getMongoConnection = getMongoConnection;
exports.default = mongo;
