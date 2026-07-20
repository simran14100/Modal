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

// ── Auto-scroll tuning ──
// Rows advance one at a time, in a discrete step, every N seconds — not a
// continuous pixel crawl. After the last row, it pauses, then loops back
// to the top and continues indefinitely.
const AUTO_SCROLL_ROW_HEIGHT = 56 // fallback row height in px if we can't measure the DOM
const AUTO_SCROLL_SECONDS_PER_ROW = 4
const AUTO_SCROLL_RESUME_DELAY = 4000 // ms after user stops interacting before rotation resumes
const AUTO_SCROLL_LOOP_PAUSE = 1500 // ms to rest at top/bottom before continuing the loop

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
  const [autoScrollOn, setAutoScrollOn] = useState(
    () => typeof window === 'undefined' || !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  )
  const theme = getModalTheme(bgColor)
  const tableRef = useRef(null)
  const bodyRef = useRef(null)

  const intervalRef = useRef(null)
  const pausedUntilRef = useRef(0)
  const loopResetTimeoutRef = useRef(null)

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

  // Rotate one row every AUTO_SCROLL_SECONDS_PER_ROW seconds, continuously,
  // looping back to the top after the last row (with a brief pause on
  // each end so the rotation doesn't feel jumpy).
  useEffect(() => {
    if (!isOpen || isMinimized || !autoScrollOn) {
      return
    }

    const el = bodyRef.current
    if (!el) return

    const tick = () => {
      const now = Date.now()
      if (now < pausedUntilRef.current) return

      const maxScroll = el.scrollHeight - el.clientHeight
      if (maxScroll <= 0) return

      const rowEl = el.querySelector('tbody tr')
      const rowHeight = rowEl?.getBoundingClientRect().height || AUTO_SCROLL_ROW_HEIGHT

      const next = el.scrollTop + rowHeight

      if (next >= maxScroll) {
        el.scrollTo({ top: maxScroll, behavior: 'smooth' })
        // rest at the bottom, then loop back to the top and keep going
        pausedUntilRef.current = now + AUTO_SCROLL_LOOP_PAUSE
        loopResetTimeoutRef.current = setTimeout(() => {
          if (bodyRef.current) {
            bodyRef.current.scrollTo({ top: 0, behavior: 'smooth' })
          }
          pausedUntilRef.current = Date.now() + AUTO_SCROLL_LOOP_PAUSE
        }, AUTO_SCROLL_LOOP_PAUSE)
      } else {
        el.scrollTo({ top: next, behavior: 'smooth' })
      }
    }

    intervalRef.current = setInterval(tick, AUTO_SCROLL_SECONDS_PER_ROW * 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (loopResetTimeoutRef.current) clearTimeout(loopResetTimeoutRef.current)
    }
  }, [isOpen, isMinimized, autoScrollOn, tableData])

  if (!isOpen) return null

  // Pauses briefly on real interaction (click/press/focus), then auto-resumes.
  // Deliberately NOT tied to mouseenter/mouseleave — if the cursor is already
  // resting over the table when the modal opens, a hover-based pause would
  // never clear (no "leave" event ever fires) and rotation would appear dead.
  const registerActivity = () => {
    pausedUntilRef.current = Date.now() + AUTO_SCROLL_RESUME_DELAY
  }

  const handlePrint = () => {
    const sheet = tableRef.current?.querySelector('.ot-sheet')
    if (sheet) printTable(title, sheet, bgColor)
  }

  const handleDownload = async () => {
    if (!tableData?.length) return
    const exportData = tableData.map((row) => ({
      Date: sheetDate || '',
      'S.No.': row.otNo,
      'File No.': row.ongoingFileNo,
      'Patient Name': row.ongoingPatientName,
      Status: row.ongoingStatus,
      'OT No.': row.waitingOtNo,
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
            <button
              type="button"
              className={`modal-action-btn modal-action-btn--autoscroll${autoScrollOn ? ' active' : ''}`}
              onClick={() => setAutoScrollOn((v) => !v)}
              title={autoScrollOn ? 'Pause auto-rotate' : 'Resume auto-rotate'}
              aria-pressed={autoScrollOn}
            >
              {autoScrollOn ? '⏸ Auto-rotate' : '▶ Auto-rotate'}
            </button>
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

        <div
          className="modal-body"
          ref={bodyRef}
          onPointerDown={registerActivity}
          onTouchStart={registerActivity}
          onFocus={registerActivity}
          onWheel={registerActivity}
        >
          <div className="table-wrapper" ref={tableRef}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Modal