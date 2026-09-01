import z from 'zod';
import * as core from 'zod/v4/core';

export function zPaginatedResponse<Shape extends core.$ZodShape>(
	zData: z.ZodObject<Shape>
) {
	return z.object({
		page: z.number(),
		limit: z.number(),
		count: z.number(),
		data: z.array(zData),
	});
}

export interface PaginatedResponse<T> {
	page: number;
	limit: number;
	count: number;
	data: T[];
}
