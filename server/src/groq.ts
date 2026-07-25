import OpenAI from 'openai'
import type { Fetch } from 'openai/core'
import dotenv from 'dotenv'

// Carga .env tanto desde /server como desde el raíz del monorepo
dotenv.config({ path: './.env' })
dotenv.config({ path: '../.env' })

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1'

export function getGroqClient() {
    const key = process.env.GROQ_API_KEY
    if (!key) throw new Error('GROQ_API_KEY no configurada')
    // Fuerza el fetch nativo de Node: el SDK cae en su polyfill node-fetch,
    // cuya descompresión gzip choca con las respuestas de Groq/Cloudflare
    // ("Premature close" / ERR_STREAM_PREMATURE_CLOSE). El cast es solo por
    // el desfase entre los tipos DOM (RequestInfo/URL) de "openai" y los
    // tipos de @types/node para el fetch global; en runtime son la misma función.
    return new OpenAI({ apiKey: key, baseURL: GROQ_BASE_URL, fetch: globalThis.fetch as unknown as Fetch })
}

export const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant'
