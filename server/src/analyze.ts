import { getOpenAI, OPENAI_MODEL } from './openai.js'
import { AnalysisSchema, type Analysis } from './schema.js'
import { systemPrompt } from './prompt.js'

export async function analyzeText(params: { originalText: string; userTranslation?: string; fromLang?: 'es' | 'en'; toLang?: 'es' | 'en' }): Promise<Analysis> {
    const { originalText, userTranslation, fromLang = 'es', toLang = 'en' } = params

    const userPayload = {
        originalText,
        userTranslation: userTranslation ?? null,
        fromLang,
        toLang
    }

    // Use JSON mode via chat.completions for strict JSON output
    const client = getOpenAI()
    const completion = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || OPENAI_MODEL,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
            { role: 'system', content: systemPrompt.replace('{fromLang}', fromLang).replace('{toLang}', toLang) },
            { role: 'user', content: JSON.stringify(userPayload) }
        ]
    })

    const content = completion.choices?.[0]?.message?.content ?? '{}'

    let parsed: unknown
    try {
        parsed = JSON.parse(content)
    } catch (e) {
        // Fallback minimal structure if parsing fails
        parsed = {
            translation: '',
            originalCorrection: '',
            translationCorrection: userTranslation || '',
            languageLevel: 'B1',
            explanations: [
                {
                    type: 'usage',
                    original: '',
                    corrected: '',
                    reason: 'No se pudo parsear la respuesta de la IA. Intenta nuevamente.'
                }
            ]
        }
    }

    const result = AnalysisSchema.safeParse(parsed)
    if (!result.success) {
        const firstError = result.error.issues[0]
        throw Object.assign(new Error('Respuesta de IA inválida'), {
            code: 'INVALID_AI_RESPONSE',
            details: firstError
        })
    }
    const data = result.data
    // Asegurar que translationCorrection refleje translation cuando el modelo no la devuelva explícita.
    if (!data.translationCorrection) {
        data.translationCorrection = data.translation
    }
    return data
}
