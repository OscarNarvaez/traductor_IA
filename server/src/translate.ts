import { getOpenAI, OPENAI_MODEL } from './openai.js'
import { translatePrompt } from './prompt.js'
import type { TranslateRequest } from './types.js'

export async function translateText(params: TranslateRequest): Promise<string> {
    const { text, fromLang, toLang } = params
    const client = getOpenAI()

    if (fromLang === toLang) return text

    const completion = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || OPENAI_MODEL,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
            { role: 'system', content: translatePrompt.replace('{fromLang}', fromLang).replace('{toLang}', toLang) },
            { role: 'user', content: JSON.stringify({ text, fromLang, toLang }) }
        ]
    })

    const content = completion.choices?.[0]?.message?.content ?? '{}'
    try {
        const parsed = JSON.parse(content)
        if (parsed && typeof parsed.translation === 'string') return parsed.translation
    } catch (err) {
        // fall through to fallback
    }
    return text
}
