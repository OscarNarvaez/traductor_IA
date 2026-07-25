import { useEffect, useState } from 'react'
import './App.css'

import { analyze, translate } from './api'
import { AnalysisPanel } from './components/AnalysisPanel'

function App() {
  const [original, setOriginal] = useState('')
  const [translation, setTranslation] = useState('')
  const [fromLang, setFromLang] = useState<'es' | 'en'>('es')
  const [toLang, setToLang] = useState<'es' | 'en'>('en')
  const [autoTranslating, setAutoTranslating] = useState(false)
  const [autoError, setAutoError] = useState<string | null>(null)
  const [userTranslationDirty, setUserTranslationDirty] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any | null>(null)

  // Auto-translate on typing (debounced) when user hasn't overridden translation manually
  useEffect(() => {
    if (!original.trim()) {
      setTranslation('')
      setResult(null)
      setAutoError(null)
      return
    }
    if (userTranslationDirty) return

    const handle = setTimeout(async () => {
      try {
        setAutoTranslating(true)
        setAutoError(null)
        const text = await translate({ text: original, fromLang, toLang })
        setTranslation(text)
      } catch (e: any) {
        setAutoError(e?.message || 'No se pudo traducir en tiempo real')
      } finally {
        setAutoTranslating(false)
      }
    }, 500)

    return () => clearTimeout(handle)
  }, [original, fromLang, toLang, userTranslationDirty])

  const onAnalyze = async () => {
    setError(null)
    setLoading(true)
    setResult(null)
    try {
      const data = await analyze({ originalText: original, userTranslation: translation || undefined, fromLang, toLang })
      setResult(data)
      // Mostrar una traducción solo si el usuario no ha escrito manualmente.
      if (!userTranslationDirty) {
        setTranslation(data.translationCorrection || data.translation || '')
      }
      setUserTranslationDirty(false)
    } catch (e: any) {
      setError(e?.message || 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  const swapLanguages = () => {
    setFromLang((prev) => {
      const newFrom = toLang
      setToLang(prev)
      // Intercambia los textos para mantener coherencia
      setOriginal((prevOriginal) => {
        const newOriginal = translation
        setTranslation(prevOriginal)
        return newOriginal
      })
      setResult(null)
      setUserTranslationDirty(false)
      return newFrom
    })
  }

  const placeholders = {
    es: 'Escribe aquí tu texto en español. Ej.: Ayer fui al cine y me gustó mucho la película, pero el final fue un poco confuso.',
    en: 'Write your text in English. Ex.: Yesterday I went to the movies and loved the film, but the ending was a bit confusing.'
  }

  const toLabel = toLang === 'en' ? 'al inglés' : 'al español'
  const fromLabel = fromLang === 'en' ? 'inglés' : 'español'

  return (
    <div className="app">
      <header className="header">
        <h1>Traductor Didáctico de Inglés</h1>
        <p className="subtitle">Escribe como crees que está bien. Yo traduzco, corrijo y explico.</p>
      </header>

      <main className="grid">
        <section className="pane pane-left">
          <div className="label-row">
            <label htmlFor="original" className="label">Texto original ({fromLabel})</label>
            <button className="swap" type="button" onClick={swapLanguages}>
              ↔️ Intercambiar
            </button>
          </div>
          <textarea
            id="original"
            className="textarea"
            placeholder={placeholders[fromLang]}
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
          />
        </section>

        <section className="pane pane-right">
          <div className="label-row">
            <label htmlFor="translation" className="label">Traducción {toLabel} (editable)</label>
            {autoTranslating && <span className="muted">Traduciendo…</span>}
          </div>
          <textarea
            id="translation"
            className="textarea"
            placeholder={`Aquí aparecerá la traducción ${toLabel}. Puedes editarla si quieres.`}
            value={translation}
            onChange={(e) => {
              setTranslation(e.target.value)
              setUserTranslationDirty(true)
            }}
          />
          {autoError && <div className="error">{autoError}</div>}
        </section>

        <section className="pane pane-bottom">
          <div className="actions">
            <button className="btn" onClick={onAnalyze} disabled={loading || !original.trim()}>
              {loading ? 'Analizando…' : 'Analizar y corregir'}
            </button>
            {error && <span className="error">{error}</span>}
          </div>
          <AnalysisPanel data={result || undefined} />
        </section>
      </main>
    </div>
  )
}

export default App
