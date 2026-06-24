const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    role: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Active', 'Pending', 'Inactive'],
      default: 'Active',
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('User', userSchema)
