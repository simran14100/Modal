import { useEffect, useRef, useState } from 'react'
import { OT_STATUS_CLASS, OT_STATUS_OPTIONS } from '../constants/otStatus'

function StatusSelect({ value, onChange, options = OT_STATUS_OPTIONS }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const displayValue = value || 'Blank'
  const statusClass = OT_STATUS_CLASS[displayValue] || 'blank'

  return (
    <div ref={rootRef} className={`status-select${open ? ' status-select--open' : ''}`}>
      <button
        type="button"
        className="status-select-trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={`status-badge status-${statusClass}`}>{displayValue}</span>
        <span className="status-select-arrow" aria-hidden="true" />
      </button>

      {open && (
        <ul className="status-select-menu" role="listbox" aria-label="Status">
          {options.map((status) => (
            <li key={status} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={displayValue === status}
                className={`status-select-option${displayValue === status ? ' selected' : ''}`}
                onClick={() => {
                  onChange(status)
                  setOpen(false)
                }}
              >
                <span className={`status-badge status-${OT_STATUS_CLASS[status] || 'blank'}`}>
                  {status}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default StatusSelect
