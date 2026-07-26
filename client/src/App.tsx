import { useEffect, useState } from 'react'
import './App.css'

import { analyze, translate, type Analysis } from './api'
import { AnalysisPanel } from './components/AnalysisPanel'

function App() {
  const [original, setOriginal] = useState('')
  const [translation, setTranslation] = useState('')
  const [fromLang, setFromLang] = useState<'es' | 'en'>('es')
  const [toLang, setToLang] = useState<'es' | 'en'>('en')
  const [autoTranslating, setAutoTranslating] = useState(false)
  const [autoError, setAutoError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<Analysis | null>(null)
  const [analyzeNotice, setAnalyzeNotice] = useState<string | null>(null)
  const [swapCount, setSwapCount] = useState(0)
  const [resultVersion, setResultVersion] = useState(0)

  const getErrorMessage = (value: unknown, fallback: string) =>
    value instanceof Error ? value.message : fallback

  // Auto-translate on typing (debounced) when user hasn't overridden translation manually
  useEffect(() => {
    if (!original.trim()) return

    const handle = setTimeout(async () => {
      try {
        setAutoTranslating(true)
        setAutoError(null)
        const text = await translate({ text: original, fromLang, toLang })
        setTranslation(text)
      } catch (error: unknown) {
        setAutoError(getErrorMessage(error, 'No se pudo traducir en tiempo real'))
      } finally {
        setAutoTranslating(false)
      }
    }, 500)

    return () => clearTimeout(handle)
  }, [original, fromLang, toLang])

  const onAnalyze = async () => {
    setError(null)
    const wordCount = original.trim().split(/\s+/).filter(Boolean).length
    if (wordCount < 4) {
      setResult(null)
      setAnalyzeNotice('Esta función solo está disponible para frases de 4 palabras o más — así no gastamos peticiones de la API en textos muy cortos.')
      setResultVersion((v) => v + 1)
      return
    }
    setAnalyzeNotice(null)
    setLoading(true)
    setResult(null)
    try {
      const data = await analyze({ originalText: original, fromLang, toLang })
      setResult(data)
      setResultVersion((v) => v + 1)
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Error inesperado'))
    } finally {
      setLoading(false)
    }
  }

  const swapLanguages = () => {
    setSwapCount((c) => c + 1)
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
      setAnalyzeNotice(null)
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
              <span className="swap-icon" style={{ transform: `rotate(${swapCount * 180}deg)` }}>↔️</span>
              Intercambiar
            </button>
          </div>
          <textarea
            id="original"
            className="textarea"
            placeholder={placeholders[fromLang]}
            value={original}
            onChange={(e) => {
              const nextOriginal = e.target.value
              setOriginal(nextOriginal)

              if (!nextOriginal.trim()) {
                setTranslation('')
                setResult(null)
                setAnalyzeNotice(null)
                setAutoError(null)
              }
            }}
          />
        </section>

        <section className="pane pane-right">
          <div className="label-row">
            <label htmlFor="translation" className="label">Traducción {toLabel}</label>
            {autoTranslating && <span className="muted">Traduciendo…</span>}
          </div>
          <textarea
            id="translation"
            className="textarea"
            placeholder={`Aquí aparecerá la traducción ${toLabel} automáticamente.`}
            value={translation}
            readOnly
          />
          {autoError && <div key={autoError} className="error">{autoError}</div>}
        </section>

        <section className="pane pane-bottom">
          <div className="actions">
            <button className="btn" onClick={onAnalyze} disabled={loading || !original.trim()}>
              {loading ? (
                <>
                  Analizando…
                  <span className="spinner" />
                </>
              ) : (
                'Analizar y corregir'
              )}
            </button>
            {error && <span key={error} className="error">{error}</span>}
          </div>
          <AnalysisPanel key={resultVersion} data={result || undefined} notice={analyzeNotice || undefined} />
        </section>
      </main>
    </div>
  )
}

export default App
