import mongoose, { Schema } from 'mongoose'

const reqString = {
  type: String,
  required: true,
}

const schema = new Schema({
  // GuildID
  _id: reqString,
  language: reqString,
})

const name = 'wokcommands-languages'

export = mongoose.models[name] || mongoose.model(name, schema, name)
