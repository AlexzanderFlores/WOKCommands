import mongoose from 'mongoose'

const reqString = {
  type: String,
  required: true,
}

const cooldownSchema = new mongoose.Schema({
  // Command-GuildID or Command-GuildID-UserID
  _id: reqString,
  name: reqString,
  type: reqString,
  cooldown: {
    type: Number,
    required: true,
  },
})

export = mongoose.model('wokcommands-cooldowns', cooldownSchema)
