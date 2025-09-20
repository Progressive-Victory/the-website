import deepEqual from 'deep-equal'
import mongoose from 'mongoose'
import { NextRequest, NextResponse } from 'next/server'
import z from 'zod'

import DocumentUpdate, { IDocumentUpdate } from '@/models/DocumentUpdate'
import Role from '@/models/Role'
import { IUser, User } from '@/models/User'
import {
    auth,
    checkAuth,
    checkAuthPermissions,
    PermissionName,
    ResponseCode,
} from '@/util/auth'
import dbConnect from '@/util/libmongo'
import {
    applyMatchFilters,
    executeAggregationPaginated,
} from '@/util/mongo-aggregations'
import { OnboardingStage } from '@/util/stage'
import { parsePaginationParams } from '@/util/url-parsing'

export async function GET(req: NextRequest) {
    const response = await checkAuthPermissions([
        PermissionName.VIEW_MEMBER_DATA,
    ])

    switch (response) {
        case ResponseCode.Successful:
            break
        case ResponseCode.Exception:
            return NextResponse.json({ error: 'Bad request' }, { status: 400 })
        case ResponseCode.NoSession:
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        case ResponseCode.InsufficientAccess:
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        default:
            throw Error('Unidentified response code.')
    }

    const ALLOWED_FILTER_PARAMS = [
        {
            key: 'roles',
            match_key: 'name',
        },
    ]

    const ALLOWED_SEARCH_FIELDS = [
        'discordUsername',
        'email',
        'firstName',
        'lastName',
        'preferredName',
        'phoneNumber',
        'state',
    ]

    const { page, limit, skip, query, params } = parsePaginationParams(req.url)

    const users = User.aggregate()

    if (query) {
        const search_field = params.get('search_field')

        const operator =
            search_field && ALLOWED_SEARCH_FIELDS.includes(search_field)
                ? {
                      autocomplete: {
                          path: search_field,
                          fuzzy: { maxEdits: 1, maxExpansions: 50 },
                          query,
                      },
                  }
                : {
                      text: {
                          path: ALLOWED_SEARCH_FIELDS,
                          query,
                      },
                  }

        // Performs full-text search over the collection across several fields
        users.search({
            index: 'default',
            sort: { score: { $meta: 'searchScore' } },
            ...operator,
        })
    }

    // Join with roles collection
    users.lookup({
        from: 'roles',
        localField: 'roles',
        foreignField: '_id',
        as: 'roles',
    })

    // Join with document_updates collection
    users.lookup({
        from: 'document_updates',
        localField: 'updateHistory',
        foreignField: '_id',
        as: 'updateHistory',
    })

    applyMatchFilters(users, params, ALLOWED_FILTER_PARAMS)

    const { data, count, pages } = await executeAggregationPaginated(
        User,
        users,
        {
            skip,
            limit,
        }
    )

    // TODO: redact fields based on member permissions

    return NextResponse.json({
        page,
        limit,
        count,
        pages,
        data: data.map((u) => ({
            ...u,
            age: calculate_age(u.dateOfBirth ?? null),
        })),
    })
}

function calculate_age(date: string | null) {
    if (!date) return null

    const today = new Date()
    const birthDate = new Date(date)
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--
    }

    return age
}

// missing fields are readonly and cannot be changed through the API
const PatchUserRequest = z
    .object({
        id: z.string(),
        discordUsername: z.string().optional(),
        email: z.string().optional(),
        zipCode: z.string().optional(),
        state: z.string().optional(),
        county: z.string().optional(),
        city: z.string().optional(),
        preferredName: z.string().optional(),
        phoneNumber: z.string().optional(),
        verified: z.boolean().optional(),
        onboardingStage: z.enum(OnboardingStage).optional(),
        dateOfBirth: z.string().optional(),
        roles: z.array(z.string()).optional(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
    })
    .strict()

export async function PATCH(req: NextRequest) {
    const response = await checkAuth(['Superadmin'])

    switch (response) {
        case ResponseCode.Successful:
            break
        case ResponseCode.Exception:
            return NextResponse.json({ error: 'Bad request' }, { status: 400 })
        case ResponseCode.NoSession:
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        case ResponseCode.InsufficientAccess:
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        default:
            throw Error('Unidentified response code.')
    }

    let acting_user: IUser | null = null

    const session = await auth()

    if (session?.discordId) {
        acting_user = await User.findOne({
            discordId: session.discordId,
        })
    }
    

    const result = PatchUserRequest.safeParse(await req.json())

    if (!result.success) {
        return NextResponse.json(
            {
                error: 'Bad Request',
                message: 'Invalid body schema',
                errors: result.error.issues,
            },
            { status: 400 }
        )
    }

    const { id, ...rest } = result.data

    if (!mongoose.isValidObjectId(id)) {
        return NextResponse.json(
            {
                error: 'Bad Request',
                message: `Invalid object ID in 'id' field`,
            },
            { status: 400 }
        )
    }

    await dbConnect()

    const user = await User.findById(id)
    if (!user) {
        return NextResponse.json(
            {
                error: 'Not Found',
                message: 'The requested object does not exist',
            },
            { status: 404 }
        )
    }

    const updates: IDocumentUpdate[] = []

    try {
        if (rest.roles) {
            for (const permission of rest.roles) {
                if (!mongoose.isValidObjectId(permission)) {
                    return NextResponse.json(
                        {
                            error: 'Bad Request',
                            message: `Invalid object ID in 'roles' field`,
                        },
                        { status: 400 }
                    )
                }
            }

            const found = await Role.countDocuments({
                _id: {
                    $in: rest.roles,
                },
            })

            if (found !== rest.roles.length) {
                return NextResponse.json(
                    {
                        error: 'Not Found',
                        message: 'One of the requested roles does not exist',
                    },
                    { status: 404 }
                )
            }
        }

        for (const key in rest) {
            // @ts-expect-error shut up
            if (rest[key] !== undefined && !deepEqual(rest[key], user[key])) {
                updates.push({
                    collection_name: User.collection.name,
                    document_id: user.id,
                    field_name: key,
                    // @ts-expect-error shut up
                    previous_value: user[key],
                    new_value: undefined,
                    // @ts-expect-error shut up
                    updated_at: new Date(),
                    // @ts-expect-error shut up
                    updated_by: acting_user.id ?? null,
                })

                // @ts-expect-error shut up
                user[key] = rest[key]
            }
        }

        await user.save()

        updates.forEach((update) => {
            // @ts-expect-error shut up
            update.new_value = user[update.field_name]
        })

        const document_updates = await DocumentUpdate.create(updates)

        user.updateHistory = [
            ...(user.updateHistory ?? []),
            ...document_updates,
        ]

        await user.save()

        await user.populate([
            {
                path: 'roles',
                populate: {
                    path: 'permissions',
                },
            },
            'updateHistory',
        ])
    } catch (e: unknown) {
        // @ts-expect-error shut up
        if (e?.code === 11000) {
            return NextResponse.json(
                {
                    error: 'Conflict',
                    message: 'The requested name is already in use',
                },
                { status: 409 }
            )
        }

        throw e
    }

    return NextResponse.json(user, { status: 200 })
}
