import { useState } from 'react'
import { ApiError, postPredict } from '../api.js'

const FIELDS = [
  { name: 'fixed_acidity', label: 'Fixed Acidity', unit: 'g/dm³', min: 0, max: 30, step: 0.1 },
  { name: 'volatile_acidity', label: 'Volatile Acidity', unit: 'g/dm³', min: 0, max: 3, step: 0.01 },
  { name: 'citric_acid', label: 'Citric Acid', unit: 'g/dm³', min: 0, max: 3, step: 0.01 },
  { name: 'residual_sugar', label: 'Residual Sugar', unit: 'g/dm³', min: 0, max: 100, step: 0.1 },
  { name: 'chlorides', label: 'Chlorides', unit: 'g/dm³', min: 0, max: 2, step: 0.001 },
  { name: 'free_sulfur_dioxide', label: 'Free Sulfur Dioxide', unit: 'mg/dm³', min: 0, max: 500, step: 1 },
  { name: 'total_sulfur_dioxide', label: 'Total Sulfur Dioxide', unit: 'mg/dm³', min: 0, max: 600, step: 1 },
  { name: 'density', label: 'Density', unit: 'g/cm³', min: 0.9, max: 1.2, step: 0.0001 },
  { name: 'ph', label: 'pH', unit: '', min: 2, max: 5, step: 0.01 },
  { name: 'sulphates', label: 'Sulphates', unit: 'g/dm³', min: 0, max: 5, step: 0.01 },
  { name: 'alcohol', label: 'Alcohol', unit: '% vol', min: 0, max: 25, step: 0.1 },
]


const PRESETS = {
  white: {
    fixed_acidity: 7.0, volatile_acidity: 0.27, citric_acid: 0.36, residual_sugar: 20.7,
    chlorides: 0.045, free_sulfur_dioxide: 45, total_sulfur_dioxide: 170, density: 1.001,
    ph: 3.0, sulphates: 0.45, alcohol: 8.8, wine_type: 'white',
  },
  red: {
    fixed_acidity: 7.4, volatile_acidity: 0.7, citric_acid: 0.0, residual_sugar: 1.9,
    chlorides: 0.076, free_sulfur_dioxide: 11, total_sulfur_dioxide: 34, density: 0.9978,
    ph: 3.51, sulphates: 0.56, alcohol: 9.4, wine_type: 'red',
  },
}

const CLASS_STYLES = {
  Low: { bar: 'bg-amber-500', text: 'text-amber-700', ring: 'border-amber-300 bg-amber-50' },
  Medium: { bar: 'bg-sky-500', text: 'text-sky-700', ring: 'border-sky-300 bg-sky-50' },
  High: { bar: 'bg-emerald-500', text: 'text-emerald-700', ring: 'border-emerald-300 bg-emerald-50' },
}

export default function Predict() {
  const [values, setValues] = useState(PRESETS.white)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const update = (name, raw) =>
    setValues((v) => ({ ...v, [name]: raw === '' ? '' : Number(raw) }))

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setFieldErrors({})
    setResult(null)

    try {
      setResult(await postPredict(values))
    } catch (err) {
      setError(err.message)
      if (err instanceof ApiError) setFieldErrors(err.fieldErrors)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <form onSubmit={onSubmit} className="card lg:col-span-3">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold text-slate-900">Wine properties</h2>
          <div className="flex gap-2 text-xs">
            <span className="text-slate-500">Load sample:</span>
            {Object.keys(PRESETS).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => { setValues(PRESETS[k]); setResult(null); setError(null); setFieldErrors({}) }}
                className="rounded border border-slate-300 px-2 py-1 font-medium capitalize hover:bg-slate-50"
              >
                {k}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="label" htmlFor="wine_type">Wine Type</label>
          <select
            id="wine_type"
            className="input"
            value={values.wine_type}
            onChange={(e) => setValues((v) => ({ ...v, wine_type: e.target.value }))}
          >
            <option value="red">Red</option>
            <option value="white">White</option>
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {FIELDS.map((f) => (
            <div key={f.name}>
              <label className="label" htmlFor={f.name}>
                {f.label}
                {f.unit && <span className="ml-1 font-normal text-slate-400">({f.unit})</span>}
              </label>
              <input
                id={f.name}
                type="number"
                required
                step={f.step}
                min={f.min}
                max={f.max}
                value={values[f.name]}
                onChange={(e) => update(f.name, e.target.value)}
                aria-invalid={fieldErrors[f.name] ? 'true' : undefined}
                aria-describedby={fieldErrors[f.name] ? `${f.name}-error` : undefined}
                className={`input ${fieldErrors[f.name] ? 'input-error' : ''}`}
              />
              {fieldErrors[f.name] && (
                <p id={`${f.name}-error`} className="mt-1 text-xs text-red-600">
                  {fieldErrors[f.name]}
                </p>
              )}
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-wine-600 px-4 py-2.5 font-medium text-white
                     transition hover:bg-wine-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Predicting…' : 'Predict Wine Quality'}
        </button>

        {error && (
          <div role="alert" className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}
      </form>

      <div className="lg:col-span-2">
        {result ? <ResultCard result={result} /> : <EmptyResult />}
      </div>
    </div>
  )
}

function ResultCard({ result }) {
  const style = CLASS_STYLES[result.prediction] ?? CLASS_STYLES.Medium
  const entries = Object.entries(result.probabilities)

  return (
    <div className="card">
      <h2 className="mb-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
        Wine Quality Result
      </h2>

      <div className={`mb-5 rounded-lg border-2 p-5 text-center ${style.ring}`}>
        <div className={`text-3xl font-bold uppercase ${style.text}`}>{result.prediction}</div>
        <div className="mt-1 text-xs text-slate-500">predicted quality class</div>
      </div>

      <h3 className="mb-3 text-sm font-medium text-slate-700">Predicted probability</h3>
      <ul className="space-y-3">
        {entries.map(([cls, p]) => (
          <li key={cls}>
            <div className="mb-1 flex justify-between text-sm">
              <span className={cls === result.prediction ? 'font-semibold text-slate-900' : 'text-slate-600'}>
                {cls}
              </span>
              <span className="tabular-nums text-slate-600">{(p * 100).toFixed(1)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${CLASS_STYLES[cls]?.bar ?? 'bg-slate-400'}`}
                style={{ width: `${Math.max(p * 100, 1)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>

      {/* These are uncalibrated model outputs, so they are labelled as
          probabilities rather than as confidence. */}
      <p className="mt-5 border-t border-slate-100 pt-3 text-xs leading-relaxed text-slate-500">
        Estimated class probabilities from the <strong>{result.model_name}</strong> model.
        These are the model's raw probability outputs and have not been calibrated,
        so they should not be read as a confidence guarantee.
      </p>
    </div>
  )
}

function EmptyResult() {
  return (
    <div className="card flex h-full min-h-64 flex-col items-center justify-center text-center">
      <div aria-hidden="true" className="mb-3 text-4xl">🍷</div>
      <p className="text-sm text-slate-500">
        Enter the wine's physicochemical properties and submit to see the predicted
        quality class.
      </p>
    </div>
  )
}
