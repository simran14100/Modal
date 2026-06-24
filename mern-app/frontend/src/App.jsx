import { useEffect, useState } from 'react'
import Modal from './components/Modal'
import DataTable from './components/DataTable'
import { fetchOtRecords } from './services/api'
import { enterFullscreen, exitFullscreen } from './utils/fullscreen'
import './App.css'

function todayString() {
  return new Date().toISOString().split('T')[0]
}

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalBgColor, setModalBgColor] = useState('#ffffff')
  const [tableData, setTableData] = useState([])
  const [sheetDate, setSheetDate] = useState(todayString())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isModalOpen) return

    const loadRecords = async () => {
      setLoading(true)
      try {
        const records = await fetchOtRecords()
        setTableData(records)
      } catch (error) {
        console.error('Failed to load data from server.', error)
      } finally {
        setLoading(false)
      }
    }

    loadRecords()
  }, [isModalOpen])

  const handleOpenModal = async () => {
    try {
      await enterFullscreen()
    } catch {
      // Fullscreen may be blocked; modal still opens
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = async () => {
    setIsModalOpen(false)
    try {
      await exitFullscreen()
    } catch {
      // ignore
    }
  }

  return (
    <main className="app">
      <h1>OT Status Board</h1>
      <p>Click the button below to open the hospital OT status modal.</p>

      <button type="button" className="open-modal-btn" onClick={handleOpenModal}>
        Open OT Status Modal
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="OT Status Board"
        bgColor={modalBgColor}
        onBgColorChange={setModalBgColor}
        tableData={tableData}
        sheetDate={sheetDate}
      >
        <DataTable
          data={tableData}
          onChange={setTableData}
          loading={loading}
          sheetDate={sheetDate}
          onDateChange={setSheetDate}
        />
      </Modal>
    </main>
  )
}

export default App
