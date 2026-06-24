function hexToRgb(hex) {
  const normalized = hex.replace('#', '')
  const full =
    normalized.length === 3
      ? normalized
          .split('')
          .map((c) => c + c)
          .join('')
      : normalized

  const value = Number.parseInt(full, 16)
  if (Number.isNaN(value)) {
    return { r: 255, g: 255, b: 255 }
  }

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  }
}

export function isDarkColor(hex) {
  const { r, g, b } = hexToRgb(hex)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness < 150
}

export function getPrintTheme(bgColor) {
  const dark = isDarkColor(bgColor)

  return {
    bgColor,
    isDark: dark,
    text: dark ? '#f3f4f6' : '#08060d',
    border: dark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.12)',
    tableHeaderBg: dark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.06)',
    status: dark
      ? {
          active: { bg: 'rgba(74, 222, 128, 0.2)', color: '#86efac' },
          pending: { bg: 'rgba(250, 204, 21, 0.2)', color: '#fde047' },
          inactive: { bg: 'rgba(248, 113, 113, 0.2)', color: '#fca5a5' },
        }
      : {
          active: { bg: 'rgba(34, 197, 94, 0.15)', color: '#16a34a' },
          pending: { bg: 'rgba(234, 179, 8, 0.15)', color: '#ca8a04' },
          inactive: { bg: 'rgba(239, 68, 68, 0.15)', color: '#dc2626' },
        },
  }
}

export function getModalTheme(bgColor) {
  const dark = isDarkColor(bgColor)

  return {
    isDark: dark,
    style: {
      backgroundColor: bgColor,
      '--modal-bg': bgColor,
      '--modal-text': dark ? '#f3f4f6' : '#08060d',
      '--modal-text-muted': dark ? '#cbd5e1' : '#6b6375',
      '--modal-border': dark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.12)',
      '--modal-surface': dark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
      '--modal-table-header-bg': dark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.06)',
      '--modal-table-hover': dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(170, 59, 255, 0.08)',
      '--modal-btn-bg': dark ? 'rgba(255, 255, 255, 0.14)' : '#ffffff',
      '--modal-btn-text': dark ? '#f9fafb' : '#08060d',
      '--modal-btn-border': dark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.12)',
      '--modal-swatch-ring': dark ? '#ffffff' : '#08060d',
      '--modal-accent-ring': dark ? '#c084fc' : '#6366f1',
      '--modal-accent': dark ? '#a78bfa' : '#4f46e5',
      '--modal-card-bg': dark ? 'rgba(15, 23, 42, 0.55)' : 'rgba(255, 255, 255, 0.92)',
      '--modal-toolbar-bg': dark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.65)',
      '--modal-shadow': dark
        ? '0 4px 24px rgba(0, 0, 0, 0.35)'
        : '0 4px 24px rgba(0, 0, 0, 0.08)',
      '--modal-input-bg': dark ? 'rgba(255, 255, 255, 0.08)' : '#ffffff',
      '--modal-dropdown-bg': dark ? '#1e293b' : '#ffffff',
      '--modal-dropdown-text': dark ? '#f1f5f9' : '#0f172a',
      '--modal-dropdown-hover': dark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.08)',
      '--ot-ongoing-bg': dark ? 'rgba(34, 197, 94, 0.18)' : '#c6efce',
      '--ot-waiting-bg': dark ? 'rgba(234, 179, 8, 0.2)' : '#ffeb9c',
      '--ot-otno-bg': dark ? 'rgba(255, 255, 255, 0.1)' : '#f2f2f2',
      '--ot-action-bg': dark ? 'rgba(255, 255, 255, 0.06)' : '#f8fafc',
      '--ot-cell-text': dark ? '#f1f5f9' : '#0f172a',
      '--ot-cell-border': dark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.2)',
      '--ot-input-bg': dark ? 'rgba(15, 23, 42, 0.55)' : '#ffffff',
      '--ot-input-text': dark ? '#f8fafc' : '#0f172a',
      '--ot-input-border': dark ? 'rgba(255, 255, 255, 0.22)' : 'rgba(0, 0, 0, 0.15)',
    },
  }
}
