// All API access. Relative URLs only -- Vite proxies /api to the FastAPI
// backend (see vite.config.js), so no host is hardcoded in the app.

async function request(path, options) {
  const res = await fetch(`/api${path}`, options)
  const body = await res.json().catch(() => null)

  if (!res.ok) {
    // FastAPI returns 422 with a `detail` array of per-field errors. Surface
    // those verbatim so the user sees which field failed and why, rather than
    // a generic "something went wrong".
    throw new ApiError(res.status, body?.detail)
  }
  return body
}

export class ApiError extends Error {
  constructor(status, detail) {
    super(formatDetail(detail, status))
    this.status = status
    this.detail = detail
    // Field name -> message, for inline display next to the offending input.
    this.fieldErrors = fieldErrorsFrom(detail)
  }
}

function fieldErrorsFrom(detail) {
  if (!Array.isArray(detail)) return {}
  return detail.reduce((acc, err) => {
    // loc is like ["body", "ph"]; the last element is the field name. For a
    // model-level validator loc is just ["body"], which we key as "_model".
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
