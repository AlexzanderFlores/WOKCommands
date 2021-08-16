import mongoose, { Connection } from 'mongoose'
import WOKCommands from '.'
import Events from './enums/Events'

const results: {
  [name: number]: string
} = {
  0: 'Disconnected',
  1: 'Connected',
  2: 'Connecting',
  3: 'Disconnecting',
}

const mongo = async (
  mongoPath: string,
  instance: WOKCommands,
  dbOptions = {}
) => {
  await mongoose.connect(mongoPath, {
    keepAlive: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    ...dbOptions,
  })

  const { connection } = mongoose
  const state = results[connection.readyState] || 'Unknown'
  instance.emit(Events.DATABASE_CONNECTED, connection, state)
}

export const getMongoConnection = (): Connection => {
  return mongoose.connection
}

export default mongo
