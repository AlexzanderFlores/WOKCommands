import { Guild } from 'discord.js'
import WOKCommands from '..'
import Command from '../Command'

export = (guild: Guild | null, command: Command, instance: WOKCommands) => {
  const { testOnly } = command

  if (!testOnly) {
    return true
  }

  return guild && instance.testServers.includes(guild.id)
}
