export type Explanation = {
    type?: 'grammar' | 'spelling' | 'wording' | 'usage' | 'style' | 'punctuation'
    original: string
    corrected: string
    reason: string
    tip?: string
    example?: { wrong: string; right: string }
}

export type Analysis = {
    translation: string
    originalCorrection: string
    translationCorrection: string
    languageLevel?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
    explanations: Explanation[]
}

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000'

export async function analyze(payload: { originalText: string; userTranslation?: string; fromLang: 'es' | 'en'; toLang: 'es' | 'en' }): Promise<Analysis> {
    const res = await fetch(`${API_BASE}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    if (!res.ok) {
        const err = await safeJson(res)
        throw new Error(err?.error || `Error ${res.status}`)
    }
    return res.json()
}

export async function translate(payload: { text: string; fromLang: 'es' | 'en'; toLang: 'es' | 'en' }): Promise<string> {
    const res = await fetch(`${API_BASE}/api/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    if (!res.ok) {
        const err = await safeJson(res)
        throw new Error(err?.error || `Error ${res.status}`)
    }
    const data = await res.json()
    return data.translation as string
}

async function safeJson(res: Response) {
    try { return await res.json() } catch { return null }
}
