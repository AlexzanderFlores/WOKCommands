import { Message } from 'discord.js'

import { ICommandCheck } from '../../typings'

export = (commandCheck: ICommandCheck) => {
  const { guild, command, instance, reply, channel } = commandCheck

  if (!guild || !command || !command.names) {
    return true
  }

  const key = `${guild.id}-${command.names[0]}`

  const channels = command.requiredChannels.get(key)

  if (channels && channels.length && !channels.includes(channel.id)) {
    let channelList = ''
    for (const channel of channels) {
      channelList += `<#${channel}>, `
    }
    channelList = channelList.substring(0, channelList.length - 2)
    reply(
      instance.messageHandler.get(guild, 'ALLOWED_CHANNELS', {
        CHANNELS: channelList,
      })
    ).then((message: Message | null) => {
      if (!message) {
        return
      }

      if (instance.delErrMsgCooldown === -1 || !message.deletable) {
        return
      }

      setTimeout(() => {
        message.delete()
      }, 1000 * instance.delErrMsgCooldown)
    })

    return false
  }

  return true
}
