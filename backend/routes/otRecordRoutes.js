const express = require('express')
const {
  getOtRecords,
  createOtRecord,
  upsertOtRecord,
  deleteOtRecord,
  lockOtRecord,
  unlockOtRecord,
} = require('../controllers/otRecordController')
const floorMiddleware = require('../middleware/floorMiddleware')

const router = express.Router()

router.use(floorMiddleware)

router.get('/', getOtRecords)
router.post('/', createOtRecord)
router.patch('/:otNo/lock', lockOtRecord)
router.patch('/:otNo/unlock', unlockOtRecord)
router.put('/:otNo', upsertOtRecord)
router.delete('/:otNo', deleteOtRecord)

module.exports = router
