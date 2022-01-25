import mongoose, { Schema } from 'mongoose'

const reqString = {
  type: String,
  required: true,
}

const schema = new Schema({
  guildId: reqString,
  command: reqString,
  requiredRoles: {
    type: [String],
    required: true,
  },
})

const name = 'wokcommands-required-roles'

export = mongoose.models[name] || mongoose.model(name, schema, name)
