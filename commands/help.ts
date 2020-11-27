import { Client, Message, MessageEmbed } from 'discord.js'
import WOKCommands from '../'

const pageLimit = 3

const getFirstEmbed = (instance: WOKCommands) => {
  const { commands } = instance.commandHandler

  const embed = new MessageEmbed()
    .setTitle(`${instance.displayName} Help Menu`)
    .setDescription(
      "Please select a command category by clicking it's reaction."
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
    instance.updateCache(client)

    client.on('messageReactionAdd', (reaction, user) => {
      if (!user.bot) {
        const { message } = reaction
        const { embeds, guild } = message

        if (embeds && embeds.length === 1) {
          const embed = embeds[0]
          const displayName = instance.displayName
            ? instance.displayName + ' '
            : ''

          if (embed.title === `${displayName}Help Menu`) {
            const emoji = reaction.emoji.name
            if (emoji === '🚪') {
              const { embed: newEmbed, reactions } = getFirstEmbed(instance)
              embed.setDescription(newEmbed.description)
              embed.setFooter('')
              message.edit(embed)
              message.reactions.removeAll()
              addReactions(message, reactions)
              return
            }

            let category = instance.getCategory(emoji)

            if (embed.description) {
              const split = embed.description.split('\n')
              const cmdStr = ' Commands'
              if (split[0].endsWith(cmdStr)) {
                category = split[0].replace(cmdStr, '')
              }
            }

            const commands = instance.commandHandler.getCommandsByCategory(
              category
            )
            const hasMultiplePages = commands.length > pageLimit

            let desc = `${category} Commands\n\nUse 🚪 to return to the previous menu.`
            if (hasMultiplePages) {
              desc += '\n\nUse ⬅ and ➡ to navigate between pages.'
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
                  desc += `\nAliases: "${names.join('", "')}"`
                }

                desc += `\nSyntax: "${instance.getPrefix(guild)}${mainName}${
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
    const { embed, reactions } = getFirstEmbed(instance)

    message.channel
      .send('', {
        embed,
      })
      .then((message) => {
        addReactions(message, reactions)
      })
  },
}
