"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.default = (client) => {
    client.on('messageCreate', (message) => {
        client.emit('messageUpsert', message);
    });
    client.on('messageUpdate', (oldMessage, newMessage) => {
        client.emit('messageUpsert', newMessage, oldMessage);
    });
};
exports.config = {
    displayName: 'Message Upsert',
    dbName: 'MESSAGE-UPSERT',
};
