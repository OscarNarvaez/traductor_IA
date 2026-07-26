import { z } from 'zod'

export const AnalysisSchema = z.object({
    nativeAlternatives: z.tuple([z.string(), z.string()]),
    originalCorrection: z.string(),
    feedback: z.string(),
    hasErrors: z.boolean()
})

export type Analysis = z.infer<typeof AnalysisSchema>
