import { Client, Guild, Message, MessageEmbed } from 'discord.js'
import WOKCommands from '../'

const pageLimit = 3

const getFirstEmbed = (guild: Guild | null, instance: WOKCommands) => {
  const {
    commandHandler: { commands },
    messageHandler,
  } = instance

  const embed = new MessageEmbed()
    .setTitle(
      `${instance.displayName} ${messageHandler.getEmbed(
        guild,
        'HELP_MENU',
        'TITLE'
      )}`
    )
    .setDescription(
      messageHandler.getEmbed(guild, 'HELP_MENU', 'SELECT_A_CATEGORY')
    )

  if (instance.color) {
    embed.setColor(instance.color)
  }

  const categories: {
    [key: string]: {
      amount: number
      emoji: string
    }
  } = {}

  for (const { category } of commands) {
    if (!category) {
      continue
    }

    if (categories[category]) {
      ++categories[category].amount
    } else {
      categories[category] = {
        amount: 1,
        emoji: instance.getEmoji(category),
      }
    }
  }

  const reactions: string[] = []

  const keys = Object.keys(categories)
  for (let a = 0; a < keys.length; ++a) {
    const key = keys[a]
    const { amount, emoji } = categories[key]

    if (!emoji) {
      console.warn(
        `WOKCommands > Category "${key}" does not have an emoji icon.`
      )

      continue
    }

    const reaction = emoji
    reactions.push(reaction)

    embed.setDescription(
      embed.description +
        `\n\n**${reaction} - ${key}** - ${amount} command${
          amount === 1 ? '' : 's'
        }`
    )
  }

  return {
    embed,
    reactions,
  }
}

const addReactions = (message: Message, reactions: string[]) => {
  const emoji = reactions.shift()

  if (emoji) {
    message.react(emoji)
    addReactions(message, reactions)
  }
}

module.exports = {
  aliases: 'commands',
  maxArgs: 1,
  expectedArgs: '[command]',
  description: "Displays this bot's commands",
  category: 'Help',
  init: (client: Client, instance: WOKCommands) => {
    client.on('messageReactionAdd', async (reaction, user) => {
      const { message } = reaction
      if (message.partial) {
        await message.fetch()
      }

      if (!user.bot) {
        const { embeds, guild } = message

        if (embeds && embeds.length === 1) {
          const embed = embeds[0]
          const displayName = instance.displayName
            ? instance.displayName + ' '
            : ''

          if (
            embed.title ===
            `${displayName}${instance.messageHandler.getEmbed(
              guild,
              'HELP_MENU',
              'TITLE'
            )}`
          ) {
            const emoji = reaction.emoji.name
            if (emoji === '🚪') {
              const { embed: newEmbed, reactions } = getFirstEmbed(
                guild,
                instance
              )
              embed.setDescription(newEmbed.description)
              embed.setFooter('')
              message.edit(embed)
              message.reactions.removeAll()
              addReactions(message, reactions)
              return
            }

            let category = instance.getCategory(emoji)

            const commandsString = instance.messageHandler.getEmbed(
              guild,
              'HELP_MENU',
              'COMMANDS'
            )

            if (embed.description) {
              const split = embed.description.split('\n')
              const cmdStr = ' ' + commandsString
              if (split[0].endsWith(cmdStr)) {
                category = split[0].replace(cmdStr, '')
              }
            }

            const commands = instance.commandHandler.getCommandsByCategory(
              category
            )
            const hasMultiplePages = commands.length > pageLimit

            let desc = `${category} ${commandsString}\n\n${instance.messageHandler.getEmbed(
              guild,
              'HELP_MENU',
              'DESCRIPTION_FIRST_LINE'
            )}`

            if (hasMultiplePages) {
              desc += `\n\n${instance.messageHandler.getEmbed(
                guild,
                'HELP_MENU',
                'DESCRIPTION_SECOND_LINE'
              )}`
            }

            let page = 1
            if (embed && embed.footer && embed.footer.text) {
              page = parseInt(embed.footer.text.split(' ')[1])
            }

            const maxPages = Math.ceil(commands.length / pageLimit)

            if (emoji === '⬅') {
              if (page <= 1) {
                reaction.users.remove(user.id)
                return
              }

              --page
            } else if (emoji === '➡') {
              if (page >= maxPages) {
                reaction.users.remove(user.id)
                return
              }

              ++page
            }

            const start = (page - 1) * pageLimit

            for (
              let a = start, counter = a;
              a < commands.length && a < start + pageLimit;
              ++a
            ) {
              const command = commands[a]

              if (command.category === category) {
                const names = [...command.names]
                const mainName = names.shift()

                desc += `\n\n#${++counter}) **${mainName}** - ${
                  command.description
                }`

                if (names.length) {
                  desc += `\n${instance.messageHandler.getEmbed(
                    guild,
                    'HELP_MENU',
                    'ALIASES'
                  )}: "${names.join('", "')}"`
                }

                desc += `\n${instance.messageHandler.getEmbed(
                  guild,
                  'HELP_MENU',
                  'SYNTAX'
                )}: "${instance.getPrefix(guild)}${mainName}${
                  command.syntax ? ' ' : ''
                }${command.syntax}"`
              }
            }

            embed.setDescription(desc)
            embed.setFooter(`Page ${page} / ${maxPages}.`)
            message.edit(embed)

            message.reactions.removeAll()
            if (hasMultiplePages) {
              message.react('⬅')
              message.react('➡')
            }
            message.react('🚪')
          }
        }
      }
    })
  },
  callback: (
    message: Message,
    args: string[],
    text: string,
    client: Client,
    prefix: string,
    instance: WOKCommands
  ) => {
    const { embed, reactions } = getFirstEmbed(message.guild, instance)

    message.channel
      .send('', {
        embed,
      })
      .then((message) => {
        addReactions(message, reactions)
      })
  },
}
