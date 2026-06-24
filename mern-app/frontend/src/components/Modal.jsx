import { useEffect, useRef, useState } from 'react'
import './Modal.css'
import { downloadExcel, printTable } from '../utils/tableExport'
import { getModalTheme } from '../utils/colorContrast'

const PRESET_COLORS = [
  { label: 'White', value: '#ffffff' },
  { label: 'Light Blue', value: '#e0f2fe' },
  { label: 'Light Green', value: '#dcfce7' },
  { label: 'Light Yellow', value: '#fef9c3' },
  { label: 'Light Pink', value: '#fce7f3' },
  { label: 'Lavender', value: '#ede9fe' },
  { label: 'Dark', value: '#1e293b' },
]

function Modal({
  isOpen,
  onClose,
  title,
  bgColor,
  onBgColorChange,
  tableData,
  sheetDate,
  children,
}) {
  const [isMinimized, setIsMinimized] = useState(false)
  const theme = getModalTheme(bgColor)
  const tableRef = useRef(null)

  useEffect(() => {
    if (!isOpen) setIsMinimized(false)
  }, [isOpen])

  useEffect(() => {
    if (isOpen && !isMinimized) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, isMinimized])

  if (!isOpen) return null

  const handlePrint = () => {
    const sheet = tableRef.current?.querySelector('.ot-sheet')
    if (sheet) printTable(title, sheet, bgColor)
  }

  const handleDownload = async () => {
    if (!tableData?.length) return
    const exportData = tableData.map((row) => ({
      Date: sheetDate || '',
      'OT No.': row.otNo,
      'On Going - File No.': row.ongoingFileNo,
      'On Going - Patient Name': row.ongoingPatientName,
      'On Going - Status': row.ongoingStatus,
      'Waiting - OT No.': row.waitingOtNo,
      'Waiting - File No.': row.waitingFileNo,
      'Waiting - Patient Name': row.waitingPatientName,
      'Waiting - Status': row.waitingStatus,
    }))
    const filename = 'ot-status-board'
    await downloadExcel(exportData, filename)
  }

  if (isMinimized) {
    return (
      <div
        className={`modal-minimized-bar${theme.isDark ? ' modal-minimized-bar--dark' : ''}`}
        style={theme.style}
        role="dialog"
        aria-label={`${title} (minimized)`}
      >
        <button
          type="button"
          className="modal-minimized-restore"
          onClick={() => setIsMinimized(false)}
        >
          <span className="modal-minimized-title">{title}</span>
          <span className="modal-minimized-hint">Click to restore</span>
        </button>
        <div className="modal-window-controls">
          <button
            type="button"
            className="modal-window-btn"
            onClick={() => setIsMinimized(false)}
            aria-label="Restore"
            title="Restore"
          >
            &#9634;
          </button>
          <button
            type="button"
            className="modal-window-btn modal-close"
            onClick={onClose}
            aria-label="Close"
            title="Close"
          >
            &times;
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay">
      <div
        className={`modal-content${theme.isDark ? ' modal-content--dark' : ''}`}
        style={theme.style}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="modal-toolbar">
          <div className="modal-color-picker">
            <span className="color-picker-label">Background:</span>
            <div className="color-presets">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  className={`color-swatch${bgColor === color.value ? ' active' : ''}`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => onBgColorChange(color.value)}
                  title={color.label}
                  aria-label={`Set background to ${color.label}`}
                />
              ))}
            </div>
            <label className="color-custom">
              <span>Custom</span>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => onBgColorChange(e.target.value)}
                aria-label="Pick custom background color"
              />
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="modal-action-btn" onClick={handlePrint}>
              Print
            </button>
            <button
              type="button"
              className="modal-action-btn modal-action-btn--excel"
              onClick={handleDownload}
            >
              Download Excel
            </button>
            <div className="modal-window-controls">
              <button
                type="button"
                className="modal-window-btn"
                onClick={() => setIsMinimized(true)}
                aria-label="Minimize"
                title="Minimize"
              >
                &minus;
              </button>
              <button
                type="button"
                className="modal-window-btn modal-close"
                onClick={onClose}
                aria-label="Close"
                title="Close"
              >
                &times;
              </button>
            </div>
          </div>
        </div>

        <div className="modal-body">
          <div className="table-wrapper" ref={tableRef}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Modal
