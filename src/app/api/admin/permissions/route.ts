import mongoose from 'mongoose'
import { NextRequest, NextResponse } from 'next/server'
import z from 'zod'

import { Permission } from '@/models/Permission'
import { checkAuth, ResponseCode } from '@/util/auth'
import dbConnect from '@/util/libmongo'
import { executeAggregationPaginated } from '@/util/mongo-aggregations'
import { parsePaginationParams } from '@/util/url-parsing'

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
            throw new Error('Unidentified response code.')
    }

    const ALLOWED_SEARCH_FIELDS = ['name']

    const { page, limit, skip, query, params } = parsePaginationParams(req.url)

    const permissions = Permission.aggregate()

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
        permissions.search({
            index: 'default',
            sort: { score: { $meta: 'searchScore' } },
            ...operator,
        })
    }

    const { data, count, pages } = await executeAggregationPaginated(
        Permission,
        permissions,
        {
            skip,
            limit,
        }
    )

    return NextResponse.json({
        page,
        limit,
        count,
        pages,
        data,
    })
}

const PostPermissionRequest = z
    .object({
        name: z.string(),
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

    const result = PostPermissionRequest.safeParse(await req.json())

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

    const { name } = result.data

    await dbConnect()

    try {
        const permission = await Permission.create({
            name,
        })

        return NextResponse.json(permission)
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

const PatchPermissionRequest = z
    .object({
        id: z.string(),
        name: z.string(),
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

    const result = PatchPermissionRequest.safeParse(await req.json())

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

    const { id, name } = result.data

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

    try {
        const permission = await Permission.findById(id)
        if (!permission) {
            return NextResponse.json(
                {
                    error: 'Not Found',
                    message: 'The requested object does not exist',
                },
                { status: 404 }
            )
        }

        permission.name = name
        await permission.save()

        return NextResponse.json(permission, { status: 200 })
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

const DeletePermissionRequest = z
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

    const result = DeletePermissionRequest.safeParse(await req.json())

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

    const permission = await Permission.findByIdAndDelete(id)

    if (!permission) {
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
