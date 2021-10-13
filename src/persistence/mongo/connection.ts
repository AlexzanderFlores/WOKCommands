import mongoose, { Connection } from 'mongoose'
import WOKCommands from '../..'

export default async (
  mongoPath: string,
  instance: WOKCommands,
  dbOptions = {}
) => {
  const options = {
    keepAlive: true,
    ...dbOptions,
  }
  await mongoose.connect(mongoPath, options)

  const { connection } = mongoose
  return connection;
}

export const getMongoConnection = (): Connection => {
  return mongoose.connection
}
