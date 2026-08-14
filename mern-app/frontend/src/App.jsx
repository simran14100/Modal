import { useEffect, useState } from 'react'
import Modal from './components/Modal'
import DataTable from './components/DataTable'
import FloorSelector from './components/FloorSelector'
import { fetchOtRecords } from './services/api'
import { enterFullscreen, exitFullscreen } from './utils/fullscreen'
import './App.css'

function todayString() {
  return new Date().toISOString().split('T')[0]
}

function floorLabel(floor) {
  return floor === '6' ? '6th Floor' : '5th Floor'
}

function App() {
  const [view, setView] = useState('home')
  const [selectedFloor, setSelectedFloor] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalBgColor, setModalBgColor] = useState('#ffffff')
  const [tableData, setTableData] = useState([])
  const [sheetDate, setSheetDate] = useState(todayString())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isModalOpen || !selectedFloor) return

    const loadRecords = async () => {
      setLoading(true)
      try {
        const records = await fetchOtRecords(selectedFloor)
        setTableData(records)
      } catch (error) {
        console.error('Failed to load data from server.', error)
      } finally {
        setLoading(false)
      }
    }

    loadRecords()
  }, [isModalOpen, selectedFloor])

  const handleOpenFloorSelect = () => {
    setView('floor-select')
  }

  const handleSelectFloor = async (floor) => {
    setSelectedFloor(floor)
    try {
      await enterFullscreen()
    } catch {
      // Fullscreen may be blocked; modal still opens
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = async () => {
    setIsModalOpen(false)
    setSelectedFloor(null)
    setTableData([])
    setView('floor-select')
    try {
      await exitFullscreen()
    } catch {
      // ignore
    }
  }

  const handleBackToHome = () => {
    setView('home')
  }

  if (view === 'floor-select') {
    return (
      <main className="app">
        <FloorSelector onSelectFloor={handleSelectFloor} onBack={handleBackToHome} />
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={`OT Status Board — ${selectedFloor ? floorLabel(selectedFloor) : ''}`}
          bgColor={modalBgColor}
          onBgColorChange={setModalBgColor}
          tableData={tableData}
          sheetDate={sheetDate}
          loading={loading}
        >
          {selectedFloor && (
            <DataTable
              floor={selectedFloor}
              data={tableData}
              onChange={setTableData}
              loading={loading}
              sheetDate={sheetDate}
              onDateChange={setSheetDate}
            />
          )}
        </Modal>
      </main>
    )
  }

  return (
    <main className="app">
      <h1>OT Status Board</h1>
      <p>Click the button below to open the hospital OT status modal.</p>

      <button type="button" className="open-modal-btn" onClick={handleOpenFloorSelect}>
        Open OT Status Modal
      </button>
    </main>
  )
}

export default App
