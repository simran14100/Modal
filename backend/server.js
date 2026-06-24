const express = require('express')
const cors = require('cors')
const path = require('path')

require('dotenv').config({ path: path.resolve(__dirname, '.env') })

const connectDB = require('./config/database')
const otRecordRoutes = require('./routes/otRecordRoutes')

const app = express()
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => res.send('API running'))
app.use('/api/ot-records', otRecordRoutes)

connectDB()

app.listen(process.env.PORT || 5000, () =>
  console.log(`Server running on port ${process.env.PORT || 5000}`)
)
