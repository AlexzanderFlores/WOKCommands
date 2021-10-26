import mongoose from 'mongoose'

import { GuildSettingsAggregate } from "../../domain/GuildSettingsAggregate"
import { IGuildSettingsRepository } from "../IGuildSettingsRepository"
import prefixeSchema from './models/prefixes'
import requiredRoleSchema from './models/required-roles'
import commandSchema from './models/channel-commands'
import disabledCommandSchema from './models/disabled-commands'
import languageSchema from './models/languages'
export class MongoGuildSettingsRepository implements IGuildSettingsRepository {
  async findOne({ guildId }: { guildId: string }): Promise<GuildSettingsAggregate> {
    throw new Error("Method not implemented.");
  }
  async findAll(): Promise<GuildSettingsAggregate[]> {
    throw new Error("Method not implemented.");
  }
  async save(settings: GuildSettingsAggregate): Promise<GuildSettingsAggregate> {
    const { guildId, prefix, language, commands } = settings

    const conn = mongoose.connection;
    const session = await conn.startSession()

    await conn.transaction(async () => {

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
      const bulkCommandUpdates = Array.from(commands.values()).map(command => {
        const { isEnabled, channels, requiredRoles, commandId } = command
        return {
          command: {
            filter: { guildId, command: commandId },
            update: {
              guildId: guildId,
              command: commandId,
              isEnabled,
              $addToSet: {
                channels: channels ? Array.from(channels.keys()) : null,
                requiredRoles: requiredRoles ? Array.from(requiredRoles.keys()) : null
              },
            },
            upsert: true,
            new: true
          },
        }
      })
      

      await languageSchema.bulkWrite(
        commands.map(command => ({
          updateOne: {
              filter: {id: command.commandId},
              update: {},
              upsert: true,
          }
        })),
        { session }
      )

    }).catch(err => console.error('WOK Commands > there was an error saving the guild settings', err))
    
    session.endSession();

    return settings;
  }
}
