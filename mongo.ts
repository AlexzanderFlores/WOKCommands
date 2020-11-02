import mongoose from 'mongoose'

const results: {
  [name: number]: string
} = {
  0: 'Disconnected',
  1: 'Connected',
  2: 'Connecting',
  3: 'Disconnecting',
}

const mongo = async (mongoPath: string) => {
  await mongoose.connect(mongoPath, {
    keepAlive: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })

  const state = results[mongoose.connection.readyState] || 'Unknown'

  console.log('Mongo State:', state)
}

export default mongo
