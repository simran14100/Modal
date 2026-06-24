const OtRecord = require('../models/OtRecord')

const emptyRecord = (otNo) => ({
  id: null,
  otNo,
  ongoingFileNo: '',
  ongoingPatientName: '',
  ongoingStatus: 'Blank',
  waitingOtNo: '',
  waitingFileNo: '',
  waitingPatientName: '',
  waitingStatus: 'Blank',
})

const formatRecord = (record) => ({
  id: record._id.toString(),
  otNo: record.otNo,
  ongoingFileNo: record.ongoingFileNo,
  ongoingPatientName: record.ongoingPatientName,
  ongoingStatus: record.ongoingStatus,
  waitingOtNo: record.waitingOtNo,
  waitingFileNo: record.waitingFileNo,
  waitingPatientName: record.waitingPatientName,
  waitingStatus: record.waitingStatus,
})

exports.getOtRecords = async (req, res) => {
  try {
    const records = await OtRecord.find().sort({ otNo: 1 })

    if (records.length === 0) {
      return res.json(Array.from({ length: 8 }, (_, i) => emptyRecord(i + 1)))
    }

    res.json(records.map(formatRecord))
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch OT records', error: error.message })
  }
}

exports.createOtRecord = async (req, res) => {
  try {
    const last = await OtRecord.findOne().sort({ otNo: -1 })
    const otNo = (last?.otNo || 0) + 1

    const record = await OtRecord.create({ otNo })
    res.status(201).json(formatRecord(record))
  } catch (error) {
    res.status(400).json({ message: 'Failed to create OT record', error: error.message })
  }
}

exports.upsertOtRecord = async (req, res) => {
  try {
    const otNo = Number(req.params.otNo)
    if (Number.isNaN(otNo) || otNo < 1) {
      return res.status(400).json({ message: 'Invalid OT No.' })
    }

    const record = await OtRecord.findOneAndUpdate(
      { otNo },
      {
        otNo,
        ongoingFileNo: req.body.ongoingFileNo ?? '',
        ongoingPatientName: req.body.ongoingPatientName ?? '',
        ongoingStatus: req.body.ongoingStatus ?? 'Blank',
        waitingOtNo: req.body.waitingOtNo ?? '',
        waitingFileNo: req.body.waitingFileNo ?? '',
        waitingPatientName: req.body.waitingPatientName ?? '',
        waitingStatus: req.body.waitingStatus ?? 'Blank',
      },
      { new: true, upsert: true, runValidators: true }
    )

    res.json(formatRecord(record))
  } catch (error) {
    res.status(400).json({ message: 'Failed to save OT record', error: error.message })
  }
}

exports.deleteOtRecord = async (req, res) => {
  try {
    const otNo = Number(req.params.otNo)
    const record = await OtRecord.findOneAndDelete({ otNo })

    if (!record) {
      return res.status(404).json({ message: 'OT record not found' })
    }

    res.json({ message: 'OT record deleted' })
  } catch (error) {
    res.status(400).json({ message: 'Failed to delete OT record', error: error.message })
  }
}
