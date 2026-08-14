const { getConnection } = require('../config/database')
const { getOtRecordModel } = require('../models/OtRecord')

const VALID_FLOORS = new Set(['5', '6'])

async function floorMiddleware(req, res, next) {
  const floor = String(req.query.floor || '')

  if (!VALID_FLOORS.has(floor)) {
    return res.status(400).json({ message: 'A valid floor query param is required (5 or 6)' })
  }

  try {
    const connection = await getConnection(floor)
    req.floor = floor
    req.otRecordModel = getOtRecordModel(connection)
    next()
  } catch (error) {
    res.status(503).json({
      message: `Database not available for floor ${floor}`,
      error: error.message,
    })
  }
}

module.exports = floorMiddleware
