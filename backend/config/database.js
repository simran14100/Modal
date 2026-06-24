const { Resolver } = require('dns')
const { promisify } = require('util')
const mongoose = require('mongoose')

async function connectDB() {
  try {
    const resolver = new Resolver()
    resolver.setServers(['8.8.8.8', '1.1.1.1'])

    const resolveSrv = promisify(resolver.resolveSrv.bind(resolver))
    const cluster = process.env.MONGO_CLUSTER

    if (!process.env.MONGO_USER || !process.env.MONGO_PASS || !cluster) {
      throw new Error('Set MONGO_USER, MONGO_PASS, and MONGO_CLUSTER in backend/.env')
    }

    const records = await resolveSrv(`_mongodb._tcp.${cluster}`)
    console.log('Resolved SRV records:', records.length)

    const hosts = records.map((r) => `${r.name}:${r.port}`).join(',')
    const user = encodeURIComponent(process.env.MONGO_USER)
    const pass = encodeURIComponent(process.env.MONGO_PASS)
    const db = process.env.MONGO_DB || 'Hospital'
//  its mongodb  url , it should be connected from backend side 
    const uri = `mongodb://${user}:${pass}@${hosts}/${db}?tls=true&authSource=admin&retryWrites=true&w=majority`

    console.log('Connecting to:', hosts)
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      directConnection: false,
      tls: true,
    })
    console.log('MongoDB connected')
  } catch (err) {
    console.error('MongoDB connection error:', err.message)
  }
}
// final setup of database is done here , so go ahead and connect the database from backend side , so do it now as fast as you can , please be ensure that you will gonna do it fast 
module.exports = connectDB
