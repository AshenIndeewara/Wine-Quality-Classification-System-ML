

async function request(path, options) {
  const res = await fetch(`/api${path}`, options)
  const body = await res.json().catch(() => null)

  if (!res.ok) {
   
    throw new ApiError(res.status, body?.detail)
  }
  return body
}

export class ApiError extends Error {
  constructor(status, detail) {
    super(formatDetail(detail, status))
    this.status = status
    this.detail = detail

    this.fieldErrors = fieldErrorsFrom(detail)
  }
}

function fieldErrorsFrom(detail) {
  if (!Array.isArray(detail)) return {}
  return detail.reduce((acc, err) => {
   
    const field = err.loc?.length > 1 ? err.loc[err.loc.length - 1] : '_model'
    acc[field] = err.msg?.replace(/^Value error, /, '') ?? 'Invalid value'
    return acc
  }, {})
}

function formatDetail(detail, status) {
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail) && detail.length) {
    return detail.map((e) => e.msg?.replace(/^Value error, /, '')).join('; ')
  }
  return `Request failed (HTTP ${status})`
}

export const getHealth = () => request('/health')

export const postPredict = (features) =>
  request('/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(features),
  })
