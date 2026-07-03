const mongoose = require('mongoose')

const otRecordSchema = new mongoose.Schema(
  {
    otNo: { type: Number, required: true, unique: true, min: 1 },
    ongoingFileNo: { type: String, default: '' },
    ongoingPatientName: { type: String, default: '' },
    ongoingStatus: { type: String, default: 'Blank' },
    waitingOtNo: { type: String, default: '' },
    waitingFileNo: { type: String, default: '' },
    waitingPatientName: { type: String, default: '' },
    waitingStatus: { type: String, default: 'Blank' },
    locked: { type: Boolean, default: false },
  },
  { timestamps: true }
)

module.exports = mongoose.model('OtRecord', otRecordSchema)
