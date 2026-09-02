import { zIntArrayQuery } from '../../util/index'
import { zSearchRequest } from './SearchRequest'
import z from 'zod'

export const zGetRolesSearchRequest = zSearchRequest.extend({
	permissionIds: zIntArrayQuery,
})

export type GetRolesSearchRequest = z.infer<typeof zGetRolesSearchRequest>