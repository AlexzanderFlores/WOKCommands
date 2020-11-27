import mongoose from 'mongoose'

const reqString = {
  type: String,
  required: true,
}

const languageSchema = new mongoose.Schema({
  // GuildID
  _id: reqString,
  language: reqString,
})

export = mongoose.model('wokcommands-languages', languageSchema)
