export interface ICooldownEntity {

}

class CooldownEntity {
  
}

export = CooldownEntity

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
