const OtRecord = require('../models/OtRecord')

const renumberAllRecords = async () => {
  const records = await OtRecord.find().sort({ otNo: 1 })
  if (records.length === 0) return records

  for (let i = 0; i < records.length; i++) {
    const tempOtNo = -(i + 1)
    if (records[i].otNo !== tempOtNo) {
      await OtRecord.updateOne({ _id: records[i]._id }, { otNo: tempOtNo })
    }
  }

  for (let i = 0; i < records.length; i++) {
    await OtRecord.updateOne({ _id: records[i]._id }, { otNo: i + 1 })
  }
   
  return OtRecord.find().sort({ otNo: 1 })
}

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
  locked: false,
})

const formatRecord = (record) => {
  const row = {
    otNo: record.otNo,
    ongoingFileNo: record.ongoingFileNo,
    ongoingPatientName: record.ongoingPatientName,
    ongoingStatus: record.ongoingStatus,
    waitingOtNo: record.waitingOtNo,
    waitingFileNo: record.waitingFileNo,
    waitingPatientName: record.waitingPatientName,
    waitingStatus: record.waitingStatus,
    locked: Boolean(record.locked),
  }

  if (record._id) {
    row.id = record._id.toString()
  }

  return row
}

exports.getOtRecords = async (req, res) => {
  try {
    let records = await OtRecord.find().sort({ otNo: 1 })

    if (records.length === 0) {
      return res.json(Array.from({ length: 8 }, (_, i) => emptyRecord(i + 1)))
    }

    const hasGaps = records.some((record, index) => record.otNo !== index + 1)
    if (hasGaps) {
      records = await renumberAllRecords()
    }

    res.json(records.map(formatRecord))
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch OT records', error: error.message })
  }
}

exports.createOtRecord = async (req, res) => {
  try {
    const count = await OtRecord.countDocuments()
    const otNo = count + 1

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

    const existing = await OtRecord.findOne({ otNo })
    if (existing?.locked) {
      return res.status(403).json({ message: 'This OT row is locked and cannot be edited' })
    }

    const rowData = {
      ongoingFileNo: req.body.ongoingFileNo ?? '',
      ongoingPatientName: req.body.ongoingPatientName ?? '',
      ongoingStatus: req.body.ongoingStatus ?? 'Blank',
      waitingOtNo: req.body.waitingOtNo ?? '',
      waitingFileNo: req.body.waitingFileNo ?? '',
      waitingPatientName: req.body.waitingPatientName ?? '',
      waitingStatus: req.body.waitingStatus ?? 'Blank',
    }

    const payload = {
      otNo,
      ...rowData,
      locked: false,
    }

    const record = await OtRecord.findOneAndUpdate({ otNo }, payload, {
      new: true,
      upsert: true,
      runValidators: true,
    })

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

    const records = await renumberAllRecords()
    res.json(records.map(formatRecord))
  } catch (error) {
    res.status(400).json({ message: 'Failed to delete OT record', error: error.message })
  }
}

exports.lockOtRecord = async (req, res) => {
  try {
    const otNo = Number(req.params.otNo)
    if (Number.isNaN(otNo) || otNo < 1) {
      return res.status(400).json({ message: 'Invalid OT No.' })
    }

    const existing = await OtRecord.findOne({ otNo })
    if (existing?.locked) {
      return res.json(formatRecord(existing))
    }

    const payload = {
      otNo,
      ongoingFileNo: req.body.ongoingFileNo ?? existing?.ongoingFileNo ?? '',
      ongoingPatientName: req.body.ongoingPatientName ?? existing?.ongoingPatientName ?? '',
      ongoingStatus: req.body.ongoingStatus ?? existing?.ongoingStatus ?? 'Blank',
      waitingOtNo: req.body.waitingOtNo ?? existing?.waitingOtNo ?? '',
      waitingFileNo: req.body.waitingFileNo ?? existing?.waitingFileNo ?? '',
      waitingPatientName: req.body.waitingPatientName ?? existing?.waitingPatientName ?? '',
      waitingStatus: req.body.waitingStatus ?? existing?.waitingStatus ?? 'Blank',
      locked: true,
    }

    const record = await OtRecord.findOneAndUpdate({ otNo }, payload, {
      new: true,
      upsert: true,
      runValidators: true,
    })

    res.json(formatRecord(record))
  } catch (error) {
    res.status(400).json({ message: 'Failed to lock OT record', error: error.message })
  }
}
