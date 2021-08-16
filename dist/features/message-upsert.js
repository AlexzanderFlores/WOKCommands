"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = (client) => {
    client.on('messageCreate', (message) => {
        client.emit('messageUpsert', message);
    });
    client.on('messageUpdate', (oldMessage, newMessage) => {
        client.emit('messageUpsert', newMessage, oldMessage);
    });
};
module.exports.config = {
    displayName: 'Message Upsert',
    dbName: 'MESSAGE-UPSERT',
};
