import { getGroqClient, GROQ_MODEL } from './groq.js'
import { AnalysisSchema, type Analysis } from './schema.js'
import { systemPrompt } from './prompt.js'

// El código de 2 letras "en" colisiona con la preposición española "en" cuando
// se interpola en un prompt escrito en español (p. ej. "SIEMPRE en en."), lo que
// confunde al modelo y lo hace ignorar la instrucción de idioma. Usar el nombre
// completo evita la ambigüedad.
const LANGUAGE_NAMES: Record<'es' | 'en', string> = { es: 'español', en: 'inglés' }

export async function analyzeText(params: { originalText: string; fromLang?: 'es' | 'en' }): Promise<Analysis> {
    const { originalText, fromLang = 'es' } = params

    const userPayload = { originalText, fromLang }

    // Use JSON mode via chat.completions for strict JSON output
    const client = getGroqClient()
    const completion = await client.chat.completions.create({
        model: GROQ_MODEL,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
            { role: 'system', content: systemPrompt.replaceAll('{fromLang}', LANGUAGE_NAMES[fromLang]) },
            { role: 'user', content: JSON.stringify(userPayload) }
        ]
    })

    const content = completion.choices?.[0]?.message?.content ?? '{}'

    let parsed: unknown
    try {
        parsed = normalizeParsed(JSON.parse(content), originalText)
    } catch (e) {
        // Fallback minimal structure if parsing fails
        parsed = {
            nativeAlternatives: ['', ''],
            originalCorrection: originalText,
            feedback: 'No se pudo generar el análisis. Intenta nuevamente.',
            hasErrors: false
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
    return result.data
}

// Corrige inconsistencias menores del modelo antes de validar con zod estricto:
// - nativeAlternatives debe tener EXACTAMENTE 2 strings (el tuple de zod rechaza cualquier otra longitud).
// - hasErrors debe ser boolean; si el modelo lo omite, se infiere comparando originalCorrection con el texto original.
function normalizeParsed(raw: unknown, originalText: string): unknown {
    if (!raw || typeof raw !== 'object') return raw
    const obj = raw as Record<string, unknown>

    let alts = Array.isArray(obj.nativeAlternatives)
        ? obj.nativeAlternatives.filter((x): x is string => typeof x === 'string')
        : []
    if (alts.length > 2) alts = alts.slice(0, 2)
    while (alts.length < 2) alts.push(alts[0] ?? '')
    obj.nativeAlternatives = alts

    if (typeof obj.hasErrors !== 'boolean') {
        const corrected = typeof obj.originalCorrection === 'string' ? obj.originalCorrection.trim() : ''
        obj.hasErrors = corrected !== '' && corrected !== originalText.trim()
    }

    return obj
}
