const express = require('express')
const {
  getOtRecords,
  createOtRecord,
  upsertOtRecord,
  deleteOtRecord,
  lockOtRecord,
} = require('../controllers/otRecordController')

const router = express.Router()

router.get('/', getOtRecords)
router.post('/', createOtRecord)
router.patch('/:otNo/lock', lockOtRecord)
router.put('/:otNo', upsertOtRecord)
router.delete('/:otNo', deleteOtRecord)

module.exports = router
