import mongoose from "mongoose";

const reqString = {
  type: String,
  required: true,
};

const channelCommandSchema = new mongoose.Schema({
  guildId: reqString,
  command: reqString,
  channels: {
    type: [String],
    required: true,
  },
});

export = mongoose.model("wokcommands-channel-commands", channelCommandSchema);
