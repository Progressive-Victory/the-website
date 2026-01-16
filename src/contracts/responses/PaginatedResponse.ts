import z from 'zod';
import { $ZodShape } from 'zod/v4/core';

export function zPaginatedResponse<Shape extends $ZodShape>(
	zData: z.ZodObject<Shape>
) {
	return z.object({
		page: z.number(),
		limit: z.number(),
		count: z.number(),
		data: z.array(zData),
	});
}

export interface IPaginatedResponse<T> {
	page: number;
	limit: number;
	count: number;
	data: T[];
}
