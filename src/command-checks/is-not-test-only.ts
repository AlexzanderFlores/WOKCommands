import { ICommandCheck } from '../../typings'

export = async (commandCheck: ICommandCheck) => {
  const { guild, command, instance } = commandCheck

  if (!command.testOnly) {
    return true
  }

  return guild && instance.testServers.includes(guild.id)
}
