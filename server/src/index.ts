import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { AnalyzeBodySchema, TranslateBodySchema } from './validators.js'
import { analyzeText } from './analyze.js'
import { translateText } from './translate.js'
import 'dotenv/config'

const app = express()

const PORT = Number(process.env.SERVER_PORT || 3000)
const ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173'

app.use(cors({ origin: ORIGIN }))
app.use(express.json({ limit: '1mb' }))
app.use(morgan('dev'))

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false
})
app.use(limiter)

app.get('/health', (_req, res) => {
    res.json({ ok: true })
})

app.post('/api/translate', async (req, res) => {
    try {
        const parsed = TranslateBodySchema.parse(req.body)
        if (!process.env.GROQ_API_KEY) {
            return res.status(500).json({ error: 'GROQ_API_KEY no configurada en el servidor.' })
        }
        const translation = await translateText(parsed)
        res.json({ translation })
    } catch (err: any) {
        if (err?.name === 'ZodError') {
            return res.status(400).json({ error: 'Entrada inválida', details: err.issues })
        }
        res.status(500).json({ error: err?.message || 'Error interno' })
    }
})

app.post('/api/analyze', async (req, res) => {
    try {
        const parsed = AnalyzeBodySchema.parse(req.body)

        if (!process.env.GROQ_API_KEY) {
            return res.status(500).json({ error: 'GROQ_API_KEY no configurada en el servidor.' })
        }

        const data = await analyzeText({
            originalText: parsed.originalText.trim(),
            fromLang: parsed.fromLang
        })

        res.json(data)
    } catch (err: any) {
        if (err?.name === 'ZodError') {
            return res.status(400).json({ error: 'Entrada inválida', details: err.issues })
        }
        const status = err?.code === 'INVALID_AI_RESPONSE' ? 502 : 500
        res.status(status).json({ error: err?.message || 'Error interno' })
    }
})

app.listen(PORT, () => {
    console.log(`[server] listening on http://localhost:${PORT}`)
})
