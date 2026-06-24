import { useRef, useState } from 'react'
import { createOtRecord, deleteOtRecord, updateOtRecord } from '../services/api'
import StatusSelect from './StatusSelect'

function DataTable({ data, onChange, loading, sheetDate, onDateChange }) {
  const debounceTimers = useRef({})
  const [confirmOtNo, setConfirmOtNo] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  const saveRow = async (otNo, updatedRow) => {
    try {
      const saved = await updateOtRecord(otNo, {
        ongoingFileNo: updatedRow.ongoingFileNo,
        ongoingPatientName: updatedRow.ongoingPatientName,
        ongoingStatus: updatedRow.ongoingStatus,
        waitingOtNo: updatedRow.waitingOtNo,
        waitingFileNo: updatedRow.waitingFileNo,
        waitingPatientName: updatedRow.waitingPatientName,
        waitingStatus: updatedRow.waitingStatus,
      })
      onChange((prev) => prev.map((item) => (item.otNo === otNo ? saved : item)))
    } catch (error) {
      console.error(error)
      setErrorMessage('Failed to save changes. Please try again.')
    }
  }

  const updateRow = (otNo, field, value) => {
    const row = data.find((item) => item.otNo === otNo)
    if (!row) return

    const updatedRow = { ...row, [field]: value }
    onChange(data.map((item) => (item.otNo === otNo ? updatedRow : item)))

    const timerKey = `${otNo}-${field}`
    clearTimeout(debounceTimers.current[timerKey])
    debounceTimers.current[timerKey] = setTimeout(() => saveRow(otNo, updatedRow), 500)
  }

  const addRow = async () => {
    try {
      const newRow = await createOtRecord()
      onChange((prev) => [...prev, newRow].sort((a, b) => a.otNo - b.otNo))
    } catch (error) {
      console.error(error)
      setErrorMessage('Failed to add row. Please try again.')
    }
  }

  const confirmRemoveRow = async () => {
    const otNo = confirmOtNo
    setConfirmOtNo(null)

    try {
      if (data.find((row) => row.otNo === otNo)?.id) {
        await deleteOtRecord(otNo)
      }
      onChange((prev) => prev.filter((row) => row.otNo !== otNo))
    } catch (error) {
      console.error(error)
      setErrorMessage('Failed to remove row. Please try again.')
    }
  }

  if (loading) {
    return <p className="table-loading">Loading data...</p>
  }

  const rows = [...data].sort((a, b) => a.otNo - b.otNo)

  return (
    <div className="editable-table ot-sheet">
      {errorMessage && (
        <div className="ot-error-banner" role="alert">
          {errorMessage}
          <button type="button" onClick={() => setErrorMessage('')} aria-label="Dismiss">
            &times;
          </button>
        </div>
      )}

      {confirmOtNo !== null && (
        <div className="ot-confirm-overlay" role="dialog" aria-modal="true">
          <div className="ot-confirm-box">
            <p>Remove OT row {confirmOtNo}?</p>
            <div className="ot-confirm-actions">
              <button type="button" className="modal-action-btn" onClick={() => setConfirmOtNo(null)}>
                Cancel
              </button>
              <button type="button" className="row-delete-btn" onClick={confirmRemoveRow}>
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="ot-sheet-header">
        <h2 className="ot-hospital-title">Homi Bhabha Cancer Hospital and research Centre</h2>
        <h3 className="ot-hospital-subtitle">New Chandigarh</h3>
        <div className="ot-date-row">
          <label htmlFor="ot-sheet-date">Date</label>
          <input
            id="ot-sheet-date"
            type="date"
            className="table-input ot-date-input"
            value={sheetDate}
            onChange={(e) => onDateChange(e.target.value)}
          />
        </div>
      </header>

      <table className="data-table ot-table">
        <thead>
          <tr>
            <th rowSpan={2} className="ot-th-otno">
              OT No.
            </th>
            <th colSpan={3} className="ot-th-section ot-th-ongoing">
              On Going
            </th>
            <th colSpan={4} className="ot-th-section ot-th-waiting">
              Waiting
            </th>
            <th rowSpan={2} className="ot-th-action">
              Action
            </th>
          </tr>
          <tr>
            <th className="ot-th-ongoing">File No.</th>
            <th className="ot-th-ongoing">Patient Name</th>
            <th className="ot-th-ongoing">Status</th>
            <th className="ot-th-waiting">OT No.</th>
            <th className="ot-th-waiting">File No.</th>
            <th className="ot-th-waiting">Patient Name</th>
            <th className="ot-th-waiting">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.otNo}>
              <td className="ot-td-otno">{row.otNo}</td>
              <td className="ot-td-ongoing">
                <input
                  type="text"
                  className="table-input"
                  value={row.ongoingFileNo || ''}
                  onChange={(e) => updateRow(row.otNo, 'ongoingFileNo', e.target.value)}
                  placeholder="File No."
                />
              </td>
              <td className="ot-td-ongoing">
                <input
                  type="text"
                  className="table-input"
                  value={row.ongoingPatientName || ''}
                  onChange={(e) => updateRow(row.otNo, 'ongoingPatientName', e.target.value)}
                  placeholder="Patient Name"
                />
              </td>
              <td className="ot-td-ongoing">
                <StatusSelect
                  value={row.ongoingStatus || 'Blank'}
                  onChange={(status) => updateRow(row.otNo, 'ongoingStatus', status)}
                />
              </td>
              <td className="ot-td-waiting">
                <input
                  type="text"
                  className="table-input"
                  value={row.waitingOtNo || ''}
                  onChange={(e) => updateRow(row.otNo, 'waitingOtNo', e.target.value)}
                  placeholder="OT No."
                />
              </td>
              <td className="ot-td-waiting">
                <input
                  type="text"
                  className="table-input"
                  value={row.waitingFileNo || ''}
                  onChange={(e) => updateRow(row.otNo, 'waitingFileNo', e.target.value)}
                  placeholder="File No."
                />
              </td>
              <td className="ot-td-waiting">
                <input
                  type="text"
                  className="table-input"
                  value={row.waitingPatientName || ''}
                  onChange={(e) => updateRow(row.otNo, 'waitingPatientName', e.target.value)}
                  placeholder="Patient Name"
                />
              </td>
              <td className="ot-td-waiting">
                <StatusSelect
                  value={row.waitingStatus || 'Blank'}
                  onChange={(status) => updateRow(row.otNo, 'waitingStatus', status)}
                />
              </td>
              <td className="ot-td-action">
                <button
                  type="button"
                  className="row-delete-btn"
                  onClick={() => setConfirmOtNo(row.otNo)}
                  title="Remove row"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button type="button" className="add-row-btn" onClick={addRow}>
        + Add OT Row
      </button>
    </div>
  )
}

export default DataTable
