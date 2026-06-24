const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

require('dotenv').config({ path: path.resolve(__dirname, '.env') })

const connectDB = require('./config/database')
const otRecordRoutes = require('./routes/otRecordRoutes')

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/ot-records', otRecordRoutes)

const distPath = path.resolve(__dirname, '../mern-app/frontend/dist')
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath))
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
} else {
  app.get('/', (req, res) => res.send('API running'))
}

connectDB()

app.listen(process.env.PORT || 5000, () =>
  console.log(`Server running on port ${process.env.PORT || 5000}`)
)
