import { useRef, useState } from 'react'
import {
  createOtRecord,
  deleteOtRecord,
  lockOtRecord,
  unlockOtRecord,
  updateOtRecord,
} from '../services/api'
import { isRowLocked } from '../utils/otRowLock'
import StatusSelect from './StatusSelect'

const renumberRows = (rows) => rows.map((row, index) => ({ ...row, otNo: index + 1 }))

function DataTable({ data, onChange, loading, sheetDate, onDateChange }) {
  const debounceTimers = useRef({})
  const [confirmOtNo, setConfirmOtNo] = useState(null)
  const [confirmLockOtNo, setConfirmLockOtNo] = useState(null)
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
      setErrorMessage(error.message || 'Failed to save changes. Please try again.')
    }
  }

  const updateRow = (otNo, field, value) => {
    const row = data.find((item) => item.otNo === otNo)
    if (!row || isRowLocked(row)) return

    const updatedRow = { ...row, [field]: value }
    onChange(data.map((item) => (item.otNo === otNo ? updatedRow : item)))

    clearTimeout(debounceTimers.current[otNo])
    debounceTimers.current[otNo] = setTimeout(() => saveRow(otNo, updatedRow), 500)
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

    Object.keys(debounceTimers.current).forEach((key) => {
      clearTimeout(debounceTimers.current[key])
      delete debounceTimers.current[key]
    })

    try {
      const row = data.find((item) => item.otNo === otNo)
      if (row?.id) {
        const updated = await deleteOtRecord(otNo)
        onChange(updated)
      } else {
        onChange((prev) => renumberRows(prev.filter((item) => item.otNo !== otNo)))
      }
    } catch (error) {
      console.error(error)
      setErrorMessage('Failed to remove row. Please try again.')
    }
  }

  const confirmLockRow = async () => {
    const otNo = confirmLockOtNo
    setConfirmLockOtNo(null)

    const row = data.find((item) => item.otNo === otNo)
    if (!row || isRowLocked(row)) return

    clearTimeout(debounceTimers.current[otNo])

    try {
      const saved = await lockOtRecord(otNo, {
        ongoingFileNo: row.ongoingFileNo,
        ongoingPatientName: row.ongoingPatientName,
        ongoingStatus: row.ongoingStatus,
        waitingOtNo: row.waitingOtNo,
        waitingFileNo: row.waitingFileNo,
        waitingPatientName: row.waitingPatientName,
        waitingStatus: row.waitingStatus,
      })
      onChange((prev) => prev.map((item) => (item.otNo === otNo ? saved : item)))
    } catch (error) {
      console.error(error)
      setErrorMessage(error.message || 'Failed to lock row. Please try again.')
    }
  }

  const unlockRow = async (otNo) => {
    try {
      const saved = await unlockOtRecord(otNo)
      onChange((prev) => prev.map((item) => (item.otNo === otNo ? saved : item)))
    } catch (error) {
      console.error(error)
      setErrorMessage(error.message || 'Failed to unlock row. Please try again.')
    }
  }

  if (loading) {
    return <p className="table-loading">Loading data...</p>
  }

  const rows = [...data].sort((a, b) => a.otNo - b.otNo)

  const renderTextCell = (row, field, placeholder) => {
    const value = row[field] || ''
    const locked = isRowLocked(row)

    if (locked) {
      return <span className="ot-readonly-value">{value || '—'}</span>
    }

    return (
      <input
        type="text"
        className="table-input"
        value={value}
        onChange={(e) => updateRow(row.otNo, field, e.target.value)}
        placeholder={placeholder}
      />
    )
  }

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

      {confirmLockOtNo !== null && (
        <div className="ot-confirm-overlay" role="dialog" aria-modal="true">
          <div className="ot-confirm-box">
            <p>Lock row {confirmLockOtNo}? You will not be able to edit it until you unlock it.</p>
            <div className="ot-confirm-actions">
              <button type="button" className="modal-action-btn" onClick={() => setConfirmLockOtNo(null)}>
                Cancel
              </button>
              <button type="button" className="row-lock-btn" onClick={confirmLockRow}>
                Yes, Lock
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmOtNo !== null && (
        <div className="ot-confirm-overlay" role="dialog" aria-modal="true">
          <div className="ot-confirm-box">
            <p>Remove row {confirmOtNo}?</p>
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
            <th className="ot-th-otno">S.No.</th>
            <th className="ot-th-ongoing">File No.</th>
            <th className="ot-th-ongoing">Patient Name</th>
            <th className="ot-th-ongoing">Status</th>
            <th className="ot-th-waiting">OT No.</th>
            <th className="ot-th-action">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const locked = isRowLocked(row)

            return (
              <tr key={row.otNo} className={locked ? 'ot-row--locked' : ''}>
                <td className="ot-td-otno">{row.otNo}</td>
                <td className="ot-td-ongoing">{renderTextCell(row, 'ongoingFileNo', 'File No.')}</td>
                <td className="ot-td-ongoing">
                  {renderTextCell(row, 'ongoingPatientName', 'Patient Name')}
                </td>
                <td className="ot-td-ongoing">
                  <StatusSelect
                    value={row.ongoingStatus || 'Blank'}
                    onChange={(status) => updateRow(row.otNo, 'ongoingStatus', status)}
                    disabled={locked}
                  />
                </td>
                <td className="ot-td-waiting">{renderTextCell(row, 'waitingOtNo', 'OT No.')}</td>
                <td className="ot-td-action">
                  <div className="ot-action-buttons">
                    {locked ? (
                      <button
                        type="button"
                        className="row-lock-btn"
                        onClick={() => unlockRow(row.otNo)}
                        title="Unlock row"
                      >
                        Unlock
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="row-lock-btn"
                        onClick={() => setConfirmLockOtNo(row.otNo)}
                        title="Lock row"
                      >
                        Lock
                      </button>
                    )}
                    <button
                      type="button"
                      className="row-delete-btn"
                      onClick={() => setConfirmOtNo(row.otNo)}
                      title="Remove row"
                    >
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <button type="button" className="add-row-btn" onClick={addRow}>
        + Add OT Row
      </button>
    </div>
  )
}

export default DataTable
