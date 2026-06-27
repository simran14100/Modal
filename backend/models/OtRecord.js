const mongoose = require('mongoose')

const STATUS_OPTIONS = [
  'Waiting',
  'Anaesthesia/ Preepration',
  'Surgury Ongoing',
  'Shifted to ICU',
  'Shifted to Ward',
  'Blank',
]

const otRecordSchema = new mongoose.Schema(
  {
    otNo: { type: Number, required: true, unique: true, min: 1 },
    ongoingFileNo: { type: String, default: '' },
    ongoingPatientName: { type: String, default: '' },
    ongoingStatus: { type: String, enum: STATUS_OPTIONS, default: 'Blank' },
    waitingOtNo: { type: String, default: '' },
    waitingFileNo: { type: String, default: '' },
    waitingPatientName: { type: String, default: '' },
    waitingStatus: { type: String, enum: STATUS_OPTIONS, default: 'Blank' },
    locked: { type: Boolean, default: false },
  },
  { timestamps: true }
)

module.exports = mongoose.model('OtRecord', otRecordSchema)
