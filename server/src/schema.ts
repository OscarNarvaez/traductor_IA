import { z } from 'zod'

export const ExplanationItem = z.object({
    type: z.enum(['grammar', 'spelling', 'wording', 'usage', 'style', 'punctuation']).optional(),
    original: z.string().default(''),
    corrected: z.string().default(''),
    reason: z.string(),
    tip: z.string().optional(),
    example: z.object({ wrong: z.string(), right: z.string() }).optional()
})

export const AnalysisSchema = z.object({
    translation: z.string(),
    originalCorrection: z.string(),
    translationCorrection: z.string(),
    languageLevel: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).optional().default('B1'),
    explanations: z.array(ExplanationItem).default([])
})

export type Analysis = z.infer<typeof AnalysisSchema>
