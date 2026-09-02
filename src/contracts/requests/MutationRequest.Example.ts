import { zMetaData } from '../data/MetaData'
import z from 'zod'

export const zMutationRequest = z.object({
	metaData: zMetaData.optional(),
})

export type BaseRequest = z.infer<typeof zMutationRequest>