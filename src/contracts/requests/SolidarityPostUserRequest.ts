import z from 'zod'

export const zSolidarityPostUserRequest = z.object({
    phone_number: z.string().nullish(),
    email: z.string().nullish(),
    first_name: z.string().nullish(),
    last_name: z.string().nullish(),
    chapter_id: z.int().nullish(),
    chapter_ids: z.array(z.int()).nullish(),
    custom_user_properties: z
        .object({
            discord_id: z.string().nullish(),
        })
        .nullish(),
    address: z
        .object({
            city: z.string().nullish(),
            state: z.string().nullish(),
            zip_code: z.string().nullish(),
        })
        .nullish(),
})

export type SolidarityPostUserRequest = z.infer<
    typeof zSolidarityPostUserRequest
>
