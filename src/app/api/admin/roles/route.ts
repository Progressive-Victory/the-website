import MongoPermission from '@/models/MongoPermission'
import { MongoRole } from '@/models/MongoRole'
import { checkAuth, ResponseCode } from '@/util/auth'
import dbConnect from '@/util/libmongo'
import {
    applyMatchFilters,
    executeAggregationPaginated,
} from '@/util/mongo-aggregations'
import { parsePaginationParams } from '@/util/url-parsing'
import mongoose from 'mongoose'
import { NextRequest, NextResponse } from 'next/server'
import z from 'zod'

export async function GET(req: NextRequest) {
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

    const ALLOWED_FILTER_PARAMS = [
        {
            key: 'permissions',
            match_key: 'name',
        },
    ]

    const ALLOWED_SEARCH_FIELDS = ['name']

    const { page, limit, skip, query, field, sort, params } =
        parsePaginationParams(req.url)

    const roles = MongoRole.aggregate()
    const validField = field && ALLOWED_SEARCH_FIELDS.includes(field)

    if (query) {
        const operator = validField
            ? {
                  autocomplete: {
                      path: field,
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
        roles.search({
            index: 'default',
            sort: { score: { $meta: 'searchScore' } },
            ...operator,
        })
    } else if (sort === 'asc' || sort === 'desc') {
        const sortBy = sort === 'asc' ? 1 : -1

        if (validField) {
            roles.sort({ [field]: sortBy })
        } else {
            roles.sort({ name: sortBy })
        }
    }

    roles.lookup({
        from: 'permissions',
        localField: 'permissions',
        foreignField: '_id',
        as: 'permissions',
    })

    applyMatchFilters(roles, params, ALLOWED_FILTER_PARAMS)

    const { data, count } = await executeAggregationPaginated(
        MongoRole,
        roles,
        {
            skip,
            limit,
        }
    )

    return NextResponse.json({
        page,
        limit,
        count,
        data,
    })
}

const PostRoleRequest = z
    .object({
        name: z.string(),
        permissions: z.array(z.string()),
    })
    .strict()

export async function POST(req: NextRequest) {
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
            throw new Error('Unidentified response code.')
    }

    const result = PostRoleRequest.safeParse(await req.json())

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

    const { name, permissions } = result.data

    await dbConnect()

    try {
        for (const permission of permissions) {
            if (!mongoose.isValidObjectId(permission)) {
                return NextResponse.json(
                    {
                        error: 'Bad Request',
                        message: `Invalid object ID in 'permissions' field`,
                    },
                    { status: 400 }
                )
            }
        }

        const found = await MongoPermission.countDocuments({
            _id: {
                $in: permissions,
            },
        })

        if (found !== permissions.length) {
            return NextResponse.json(
                {
                    error: 'Not Found',
                    message: 'One of the requested permissions does not exist',
                },
                { status: 404 }
            )
        }

        const role = await MongoRole.create({
            name,
            permissions,
        })

        return NextResponse.json(role)
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
}

const PatchRoleRequest = z
    .object({
        id: z.string(),
        name: z.string().optional(),
        // IDs of the desired permissions
        permissions: z.array(z.string()).optional(),
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
            throw new Error('Unidentified response code.')
    }

    const result = PatchRoleRequest.safeParse(await req.json())

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

    const role = await MongoRole.findById(id)
    if (!role) {
        return NextResponse.json(
            {
                error: 'Not Found',
                message: 'The requested object does not exist',
            },
            { status: 404 }
        )
    }

    try {
        if (rest.permissions) {
            for (const permission of rest.permissions) {
                if (!mongoose.isValidObjectId(permission)) {
                    return NextResponse.json(
                        {
                            error: 'Bad Request',
                            message: `Invalid object ID in 'permissions' field`,
                        },
                        { status: 400 }
                    )
                }
            }

            const found = await MongoPermission.countDocuments({
                _id: {
                    $in: rest.permissions,
                },
            })

            if (found !== rest.permissions.length) {
                return NextResponse.json(
                    {
                        error: 'Not Found',
                        message:
                            'One of the requested permissions does not exist',
                    },
                    { status: 404 }
                )
            }
        }

        for (const key in rest) {
            if (rest[key] !== undefined) role[key] = rest[key]
        }

        await role.save()

        await role.populate('permissions')
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

    return NextResponse.json(role, { status: 200 })
}

const DeleteRoleRequest = z
    .object({
        id: z.string(),
    })
    .strict()

export async function DELETE(req: NextRequest) {
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
            throw new Error('Unidentified response code.')
    }

    const result = DeleteRoleRequest.safeParse(await req.json())

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

    const { id } = result.data

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

    const role = await MongoRole.findByIdAndDelete(id)

    if (!role) {
        return NextResponse.json(
            {
                error: 'Not Found',
                message: 'The requested object does not exist',
            },
            { status: 404 }
        )
    }

    return new NextResponse(null, { status: 204 })
}
