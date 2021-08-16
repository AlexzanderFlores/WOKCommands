import { Client } from 'discord.js'

module.exports = (client: Client) => {
  client.on('messageCreate', (message) => {
    client.emit('messageUpsert', message)
  })

  client.on('messageUpdate', (oldMessage, newMessage) => {
    client.emit('messageUpsert', newMessage, oldMessage)
  })
}

module.exports.config = {
  displayName: 'Message Upsert',
  dbName: 'MESSAGE-UPSERT',
}
