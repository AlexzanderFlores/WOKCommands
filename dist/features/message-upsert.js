"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = function (client) {
    client.on('message', function (message) {
        client.emit('messageUpsert', message);
    });
    client.on('messageUpdate', function (oldMessage, newMessage) {
        client.emit('messageUpsert', newMessage, oldMessage);
    });
};
module.exports.config = {
    displayName: 'Message Upsert',
    dbName: 'MESSAGE-UPSERT',
};
