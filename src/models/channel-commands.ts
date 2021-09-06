import mongoose, { Schema } from 'mongoose'

const reqString = {
  type: String,
  required: true,
}

const schema = new Schema({
  guildId: reqString,
  command: reqString,
  channels: {
    type: [String],
    required: true,
  },
})

const name = 'wokcommands-channel-commands'

export = mongoose.models[name] || mongoose.model(name, schema, name)
