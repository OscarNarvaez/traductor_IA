import OpenAI from 'openai'
import dotenv from 'dotenv'

// Carga .env tanto desde /server como desde el raíz del monorepo
dotenv.config({ path: './.env' })
dotenv.config({ path: '../.env' })

export function getOpenAI() {
    const key = process.env.OPENAI_API_KEY
    if (!key) throw new Error('OPENAI_API_KEY no configurada')
    return new OpenAI({ apiKey: key })
}

export const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'
