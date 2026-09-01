import { zEnumQuery, zIntQuery, zStringQuery } from '../../util/index.js';
import z from 'zod';

export enum SortDirection {
	ASC = 'asc',
	DESC = 'desc',
}

export const zSearchRequest = z.object({
	page: zIntQuery,
	limit: zIntQuery.default(25),
	searchField: zStringQuery,
	sortField: zStringQuery,
	query: zStringQuery,
	sort: zEnumQuery(SortDirection).default(SortDirection.DESC),
});

export type SearchRequest = z.infer<typeof zSearchRequest>;
