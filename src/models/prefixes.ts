import mongoose from 'mongoose'

const reqString = {
  type: String,
  required: true,
}

const prefixSchema = new mongoose.Schema({
  // Guild ID
  _id: reqString,
  prefix: reqString,
})

export = mongoose.model('wokcommands-prefixes', prefixSchema)
