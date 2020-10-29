import mongoose from 'mongoose'

const mongo = async (mongoPath: string) => {
  await mongoose.connect(mongoPath, {
    keepAlive: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
}

export default mongo
