import mongoose from 'mongoose'

import { GuildSettingsAggregate } from "../../domain/GuildSettingsAggregate"
import { IGuildSettingsRepository } from "../IGuildSettingsRepository"
import prefixeSchema from './models/prefixes'
import requiredRoleSchema from './models/required-roles'
import channelCommandSchema from './models/channel-commands'
import disabledCommandSchema from './models/disabled-commands'
import languageSchema from './models/languages'
import { CommandEntity } from '../../domain/CommandEntity'
import { Collection } from 'discord.js'
import { Channel } from '../../domain/Channel'
import { Role } from '../../domain/Role'
export class MongoGuildSettingsRepository implements IGuildSettingsRepository {
  async findOne({ guildId }: { guildId: string }): Promise<GuildSettingsAggregate> {
    throw new Error("Method not implemented.");
  }
  async findAll(): Promise<GuildSettingsAggregate[]> {
    const guildSettingsCollection = new Collection<string, GuildSettingsAggregate>()
    const disabledCommands = await disabledCommandSchema.find({})
    const requiredRoles = await requiredRoleSchema.find({})
    const channelCommands = await channelCommandSchema.find({})

    function getOrCreateGuildSettings(guildId: string): GuildSettingsAggregate {
      let guildSettings = guildSettingsCollection.get(guildId)
      if (!guildSettings) {
        guildSettings =  new GuildSettingsAggregate({ guildId })
        guildSettingsCollection.set(guildId, guildSettings)
      }
      return guildSettings
    }

    for(const disabledCommand of disabledCommands) {
      const { guildId, command } = disabledCommand
      const guildSettings = getOrCreateGuildSettings(guildId)
      guildSettings.updateEnabledStateForCommand({ commandId: command, isEnabled: false })
    }

    for(const requiredRole of requiredRoles) {
      const { guildId, command, requiredRoles } = requiredRole
      const guildSettings = getOrCreateGuildSettings(guildId)
      guildSettings.setRequiredRolesForCommand({
        commandId: command,
        requiredRoles: requiredRoles.map((r: string) => new Role({ roleId: r }))
      })
    }

    for(const channel of channelCommands) {
      const { command, guildId, channels } = channel
      const guildSettings = getOrCreateGuildSettings(guildId)
      guildSettings.setRequiredChannelsForCommand({
        commandId: command,
        // TODO: do we need to do what the old code was doing on the returned channels?
        // cmd.setRequiredChannels({
        //   guildId: guild?.id,
        //   channels: channels
        //     .toString()
        //     .replace(/\"\[\]/g, '')
        //     .split(',')
        // })
        channels: channels.map((c: string) => new Channel({ channelId: c }))
      })
    }

    // TODO: figure out where we load language and prefix and move into here
    // replace fetch commands in CommandHandler with a fetch to populate the guildsettings

    return Array.from(guildSettingsCollection.values())
  }
  async save(settings: GuildSettingsAggregate): Promise<GuildSettingsAggregate> {
    const { guildId, prefix, language, commands } = settings

    const conn = mongoose.connection;
    const session = await conn.startSession()

    await session.withTransaction(async () => {
      await prefixeSchema.findOneAndUpdate(
        {
          _id: guildId,
        },
        {
          _id: guildId,
          prefix,
        },
        {
          session,
          upsert: true,
        }
      )

      await languageSchema.findOneAndUpdate(
        {
          _id: guildId,
        },
        {
          _id: guildId,
          language,
        },
        {
          session,
          upsert: true,
        }
      )
      
      // TODO get code from Stack Overflow for persistence logic
      const bulkCommandUpdates = Array.from(commands.values()).reduce((acc, command) => {
        const { isEnabled, channels, requiredRoles, commandId } = command
        acc.channelOperations.push(buildChannelUpsertOrDeleteOperation({ guildId, commandId, channels }))
        acc.requiredRoleOperations.push(buildRequiredRolesUpsertOrDeleteOperation({ guildId, commandId, requiredRoles }))
        acc.disabledCommandOperations.push(buildDisabledCommandUpsertOrDeleteOperation({ guildId, commandId, isEnabled }))
        return acc
      }, {
        channelOperations: [] as any[],
        requiredRoleOperations: [] as any[],
        disabledCommandOperations: [] as any[]
      })

      await channelCommandSchema.bulkWrite(
        bulkCommandUpdates.channelOperations,
        { session }
      )

      await requiredRoleSchema.bulkWrite(
        bulkCommandUpdates.requiredRoleOperations,
        { session }
      )

      await disabledCommandSchema.bulkWrite(
        bulkCommandUpdates.disabledCommandOperations,
        { session }
      )
    }).catch(err => console.error('WOK Commands > there was an error saving the guild settings', err))
    
    session.endSession();

    return settings;
  }
}

function buildChannelUpsertOrDeleteOperation({ channels, guildId, commandId }: {
  channels: Collection<string, Channel> | null,
  guildId: string,
  commandId: string
}) {
  if (!channels || channels.size === 0) {
    return {
      // TODO: original code had this as deleteMany, but not sure that's necessary?
      deleteOne: {
        filter: { guildId, command: commandId },
      }
    }
  }

  return {
    updateOne:{
      filter: { guildId, command: commandId },
      update: {
        guildId: guildId,
        command: commandId,
        $addToSet: {
          channels: Array.from(channels.keys())
        },
      },
      upsert: true,
      // TODO: any specific reason for using `new` here?
      new: true
    }
  }
}

function buildRequiredRolesUpsertOrDeleteOperation({ requiredRoles, guildId, commandId }: {
  requiredRoles: Collection<string, Role> | null,
  guildId: string,
  commandId: string
}) {
  if (!requiredRoles || requiredRoles.size === 0) {
    return {
      deleteOne: {
        filter: { guildId, command: commandId },
      }
    }
  }

  return {
    updateOne:{
      filter: { guildId, command: commandId },
      update: {
        guildId: guildId,
        command: commandId,
        $addToSet: {
          requiredRoles: Array.from(requiredRoles.keys())
        },
      },
      upsert: true
    }
  }
}

function buildDisabledCommandUpsertOrDeleteOperation({ isEnabled, guildId, commandId }: {
  isEnabled: boolean,
  guildId: string,
  commandId: string
}) {
  if (isEnabled) {
    return {
      deleteOne: {
        filter: { guildId, command: commandId },
      }
    }
  }

  return {
    updateOne:{
      filter: { guildId, command: commandId },
      update: {
        guildId: guildId,
        command: commandId
      },
      upsert: true
    }
  }
}
