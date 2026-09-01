import { zSearchRequest } from './SearchRequest.js';
import z from 'zod';

export const zGetDiscordWarnsRequest = z
	.object({
		mod_discord_id: z.string().optional(),
		tgt_discord_id: z.string().optional(),
		time_window: z.string().optional(),
	})
	.extend(zSearchRequest.shape);

export type GetDiscordWarnsRequest = z.infer<typeof zGetDiscordWarnsRequest>;
