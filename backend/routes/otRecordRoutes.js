const express = require('express')
const {
  getOtRecords,
  createOtRecord,
  upsertOtRecord,
  deleteOtRecord,
} = require('../controllers/otRecordController')

const router = express.Router()

router.get('/', getOtRecords)
router.post('/', createOtRecord)
router.put('/:otNo', upsertOtRecord)
router.delete('/:otNo', deleteOtRecord)

module.exports = router
