const API_BASE = '/api/ot-records'

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || 'Request failed')
  }
  return data
}

export function fetchOtRecords() {
  return fetch(API_BASE).then(handleResponse)
}

export function createOtRecord() {
  return fetch(API_BASE, { method: 'POST' }).then(handleResponse)
}

export function updateOtRecord(otNo, record) {
  return fetch(`${API_BASE}/${otNo}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(record),
  }).then(handleResponse)
}

export function deleteOtRecord(otNo) {
  return fetch(`${API_BASE}/${otNo}`, { method: 'DELETE' }).then(handleResponse)
}
