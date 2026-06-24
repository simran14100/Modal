import { getPrintTheme } from './colorContrast'

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function getStatusClass(status) {
  const map = { Active: 'active', Pending: 'pending', Inactive: 'inactive' }
  return `status-badge status-${map[status] || 'pending'}`
}

function getPrintableTableHtml(tableElement) {
  const clone = tableElement.cloneNode(true)

  clone.querySelectorAll('input').forEach((input) => {
    if (input.type === 'date') {
      const wrapper = input.closest('.ot-date-row')
      if (wrapper) {
        const label = wrapper.querySelector('label')?.textContent || 'Date'
        wrapper.innerHTML = `<strong>${escapeHtml(label)}:</strong> ${escapeHtml(input.value)}`
      }
      return
    }
    const cell = input.closest('td')
    if (cell) cell.textContent = input.value
  })

  clone.querySelectorAll('select').forEach((select) => {
    const cell = select.closest('td')
    if (!cell) return
    const value = select.value
    cell.innerHTML = `<span class="${getStatusClass(value)}">${escapeHtml(value)}</span>`
  })

  clone.querySelectorAll('.status-select').forEach((statusSelect) => {
    const cell = statusSelect.closest('td')
    const badge = statusSelect.querySelector('.status-badge')
    if (!cell || !badge) return
    cell.innerHTML = `<span class="${badge.className}">${escapeHtml(badge.textContent)}</span>`
  })

  clone.querySelectorAll('.ot-sheet-note, .add-row-btn').forEach((el) => {
    el.remove()
  })

  clone.querySelectorAll('th.ot-th-action, td.ot-td-action').forEach((el) => {
    el.remove()
  })

  return clone.outerHTML
}

function buildPrintStyles(theme) {
  const { bgColor, text, border, tableHeaderBg, status } = theme

  return `
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
      box-sizing: border-box;
    }

    @page {
      margin: 16mm;
    }

    body {
      margin: 0;
      padding: 24px;
      font-family: system-ui, 'Segoe UI', Roboto, sans-serif;
      background-color: ${bgColor};
      color: ${text};
    }

    .print-header {
      padding-bottom: 16px;
      margin-bottom: 16px;
      border-bottom: 1px solid ${border};
    }

    .print-header h1 {
      margin: 0;
      font-size: 22px;
      font-weight: 600;
      color: ${text};
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 15px;
      text-align: left;
      color: ${text};
    }

    .data-table th,
    .data-table td {
      padding: 12px 16px;
      border-bottom: 1px solid ${border};
      color: ${text};
    }

    .data-table th {
      background: ${tableHeaderBg};
      font-weight: 600;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 500;
    }

    .status-active {
      background: ${status.active.bg};
      color: ${status.active.color};
    }

    .status-pending {
      background: ${status.pending.bg};
      color: ${status.pending.color};
    }

    .ot-hospital-title {
      text-align: center;
      font-size: 18px;
      margin: 0 0 4px;
      color: ${text};
    }

    .ot-hospital-subtitle {
      text-align: center;
      font-size: 15px;
      margin: 0 0 12px;
      color: ${text};
    }

    .ot-table th,
    .ot-table td {
      border: 1px solid ${border};
      padding: 8px 10px;
      font-size: 13px;
    }

    .ot-th-ongoing,
    .ot-td-ongoing {
      background: #c6efce !important;
    }

    .ot-th-waiting,
    .ot-td-waiting {
      background: #ffeb9c !important;
    }

    .ot-th-otno,
    .ot-td-otno {
      background: ${tableHeaderBg};
      font-weight: 700;
      text-align: center;
    }

    .ot-sheet-note {
      margin-top: 16px;
      font-size: 12px;
      color: ${text};
    }
      body {
        padding: 0;
        background-color: ${bgColor} !important;
      }
    }
  `
}

export async function downloadExcel(data, filename = 'table-data') {
  const XLSX = await import('xlsx')
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
  XLSX.writeFile(workbook, `${filename}.xlsx`)
}

export function printTable(title, tableElement, bgColor) {
  if (!tableElement) return

  const theme = getPrintTheme(bgColor)
  const tableHtml = getPrintableTableHtml(tableElement)
  const printWindow = window.open('', '_blank', 'width=900,height=700')
  if (!printWindow) return

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>${escapeHtml(title)}</title>
        <style>${buildPrintStyles(theme)}</style>
      </head>
      <body>
        ${tableHtml}
      </body>
    </html>
  `)
  printWindow.document.close()
  printWindow.focus()

  printWindow.onload = () => {
    printWindow.print()
    printWindow.onafterprint = () => printWindow.close()
  }

  setTimeout(() => {
    if (!printWindow.closed) {
      printWindow.print()
    }
  }, 300)
}
