const API_BASE = '/api/ot-records'

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || 'Request failed')
  }
  return data
}

function withFloor(floor, path = '') {
  return `${API_BASE}${path}?floor=${floor}`
}

export function fetchOtRecords(floor) {
  return fetch(withFloor(floor)).then(handleResponse)
}

export function createOtRecord(floor) {
  return fetch(withFloor(floor), { method: 'POST' }).then(handleResponse)
}

export function updateOtRecord(floor, otNo, record) {
  return fetch(withFloor(floor, `/${otNo}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(record),
  }).then(handleResponse)
}

export function deleteOtRecord(floor, otNo) {
  return fetch(withFloor(floor, `/${otNo}`), { method: 'DELETE' }).then(handleResponse)
}

export function lockOtRecord(floor, otNo, record) {
  return fetch(withFloor(floor, `/${otNo}/lock`), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(record),
  }).then(handleResponse)
}

export function unlockOtRecord(floor, otNo) {
  return fetch(withFloor(floor, `/${otNo}/unlock`), { method: 'PATCH' }).then(handleResponse)
}
