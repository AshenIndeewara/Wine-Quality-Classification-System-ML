import { useEffect, useState } from 'react'
import Predict from './pages/Predict.jsx'
import { getHealth } from './api.js'

export default function App() {
  const [health, setHealth] = useState(null)

  useEffect(() => {
    getHealth()
      .then(setHealth)
      .catch(() => setHealth({ status: 'unreachable', model_loaded: false }))
  }, [])

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              Wine Quality Classification System
            </h1>
            <p className="text-sm text-slate-500">
              Predicting wine quality from physicochemical measurements
            </p>
          </div>
          <HealthBadge health={health} />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        {health && !health.model_loaded && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"
          >
            <strong className="font-semibold">Model not loaded.</strong>{' '}
            {health.status === 'unreachable'
              ? 'The backend is unreachable. Start it with: uvicorn main:app --reload --app-dir backend'
              : 'Run every cell in ml/notebooks/wine_quality.ipynb first.'}
          </div>
        )}

        <Predict />
      </main>

      <footer className="mx-auto max-w-3xl px-4 pb-8 text-xs text-slate-400">
        Dataset: UCI Wine Quality (Cortez et al., 2009), Decision Support Systems 47(4):547-553.
      </footer>
    </div>
  )
}

function HealthBadge({ health }) {
  if (!health) return null

  const ok = health.model_loaded
  return (
    <div
      className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${
        ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
      }`}
    >
      <span
        aria-hidden="true"
        className={`h-2 w-2 rounded-full ${ok ? 'bg-emerald-500' : 'bg-red-500'}`}
      />
      {ok ? `API online — ${health.model_name}` : 'API offline'}
    </div>
  )
}
