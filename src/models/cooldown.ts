import mongoose, { Schema } from 'mongoose'

const reqString = {
  type: String,
  required: true,
}

const schema = new Schema({
  // Command-GuildID or Command-GuildID-UserID
  _id: reqString,
  name: reqString,
  type: reqString,
  cooldown: {
    type: Number,
    required: true,
  },
})

const name = 'wokcommands-cooldowns'

export = mongoose.models[name] || mongoose.model(name, schema, name)
