const User = require('../models/User')

const formatUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
})

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: 1 })
    res.json(users.map(formatUser))
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message })
  }
}

exports.createUser = async (req, res) => {
  try {
    const user = await User.create({
      name: req.body.name ?? '',
      email: req.body.email ?? '',
      role: req.body.role ?? '',
      status: req.body.status ?? 'Active',
    })
    res.status(201).json(formatUser(user))
  } catch (error) {
    res.status(400).json({ message: 'Failed to create user', error: error.message })
  }
}

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
        status: req.body.status,
      },
      { new: true, runValidators: true }
    )

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json(formatUser(user))
  } catch (error) {
    res.status(400).json({ message: 'Failed to update user', error: error.message })
  }
}

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({ message: 'User deleted' })
  } catch (error) {
    res.status(400).json({ message: 'Failed to delete user', error: error.message })
  }
}
