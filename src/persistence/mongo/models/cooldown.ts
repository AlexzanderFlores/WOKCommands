import mongoose, { Schema } from 'mongoose'
import ModelNames from './ModelNames'

const reqString = {
  type: String,
  required: true,
}

const schema = new Schema({
  // Command-GuildID or Command-GuildID-UserID
  _id: reqString,
  guildId: reqString,
  name: reqString,
  type: reqString,
  cooldown: {
    type: Number,
    required: true,
  },
})

const name = ModelNames.COOLDOWNS

export = mongoose.models[name] || mongoose.model(name, schema, name)
