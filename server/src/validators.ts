import { z } from 'zod'

const LangEnum = z.enum(['es', 'en'])

export const AnalyzeBodySchema = z.object({
    originalText: z.string().min(1, 'El texto original no puede estar vacío').max(2000, 'Texto demasiado largo (máx 2000 caracteres)'),
    userTranslation: z.string().max(2000).optional(),
    fromLang: LangEnum.default('es'),
    toLang: LangEnum.default('en')
}).refine((v) => v.fromLang !== v.toLang, { message: 'Los idiomas no pueden ser iguales', path: ['toLang'] })

export const TranslateBodySchema = z.object({
    text: z.string().min(1, 'El texto no puede estar vacío').max(2000, 'Texto demasiado largo (máx 2000 caracteres)'),
    fromLang: LangEnum.default('es'),
    toLang: LangEnum.default('en')
}).refine((v) => v.fromLang !== v.toLang, { message: 'Los idiomas no pueden ser iguales', path: ['toLang'] })

export type AnalyzeBody = z.infer<typeof AnalyzeBodySchema>
export type TranslateBody = z.infer<typeof TranslateBodySchema>
