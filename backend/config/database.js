const { Resolver } = require('dns')
const { promisify } = require('util')
const mongoose = require('mongoose')

const connections = {}
let hosts = null

const FLOOR_DB_MAP = {
  5: () => process.env.MONGO_DB_FLOOR_5 || process.env.MONGO_DB || 'Hospital_5F',
  6: () => process.env.MONGO_DB_FLOOR_6 || 'Hospital_6F',
}

async function resolveHosts() {
  if (hosts) return hosts

  const resolver = new Resolver()
  resolver.setServers(['8.8.8.8', '1.1.1.1'])

  const resolveSrv = promisify(resolver.resolveSrv.bind(resolver))
  const cluster = process.env.MONGO_CLUSTER

  if (!process.env.MONGO_USER || !process.env.MONGO_PASS || !cluster) {
    throw new Error('Set MONGO_USER, MONGO_PASS, and MONGO_CLUSTER in backend/.env')
  }

  const records = await resolveSrv(`_mongodb._tcp.${cluster}`)
  console.log('Resolved SRV records:', records.length)

  hosts = records.map((r) => `${r.name}:${r.port}`).join(',')
  return hosts
}

function buildUri(dbName) {
  const user = encodeURIComponent(process.env.MONGO_USER)
  const pass = encodeURIComponent(process.env.MONGO_PASS)
  return `mongodb://${user}:${pass}@${hosts}/${dbName}?tls=true&authSource=admin&retryWrites=true&w=majority`
}

async function getConnection(floor) {
  const key = String(floor)

  if (!FLOOR_DB_MAP[key]) {
    throw new Error(`Invalid floor: ${floor}`)
  }

  if (!connections[key]) {
    await resolveHosts()
    const dbName = FLOOR_DB_MAP[key]()
    const uri = buildUri(dbName)

    console.log(`Connecting floor ${key} to:`, hosts, `(db: ${dbName})`)
    connections[key] = await mongoose.createConnection(uri, {
      serverSelectionTimeoutMS: 10000,
      directConnection: false,
      tls: true,
    }).asPromise()
    console.log(`MongoDB connected for floor ${key}`)
  }

  return connections[key]
}

async function connectDB() {
  try {
    await getConnection('5')
    await getConnection('6')
    console.log('All floor databases connected')
  } catch (err) {
    console.error('MongoDB connection error:', err.message)
  }
}

module.exports = connectDB
module.exports.getConnection = getConnection
