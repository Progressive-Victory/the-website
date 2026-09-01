import { zIntArrayQuery } from '../../util/index.js';
import { zSearchRequest } from './SearchRequest.js';
import z from 'zod';

export const zGetRolesSearchRequest = zSearchRequest.extend({
	permissionIds: zIntArrayQuery,
});

export type GetRolesSearchRequest = z.infer<typeof zGetRolesSearchRequest>;
