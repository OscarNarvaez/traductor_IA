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

export type AnalyzeRequest = {
    originalText: string
    userTranslation?: string
    fromLang?: 'es' | 'en'
    toLang?: 'es' | 'en'
}

export type TranslateRequest = {
    text: string
    fromLang: 'es' | 'en'
    toLang: 'es' | 'en'
}
