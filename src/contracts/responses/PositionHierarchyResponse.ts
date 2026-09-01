import { zUserProfile, zPosition } from '../data/index.js';
import z from 'zod';

export const zPositionHierarchyResponse = z.object({
	positions: z.array(zPosition),
	users: z.array(zUserProfile),
});

export type PositionHierarchyResponse = z.infer<
	typeof zPositionHierarchyResponse
>;
