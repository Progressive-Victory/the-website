import { Donor, ShippingStatus } from '@/models'
import {
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
import { parsePaginationParams } from '@/util/url-parsing'
import deepEqual from 'deep-equal'
import { isValidObjectId } from 'mongoose'
import { NextRequest, NextResponse } from 'next/server'
import z from 'zod'

export async function GET(req: NextRequest) {
    const response = await checkAuthPermissions([
        PermissionName.ADMIN_PANEL_ACCESS,
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

    const ALLOWED_FILTER_PARAMS = []

    const ALLOWED_SEARCH_FIELDS = []

    const { page, limit, skip, query, field, sort, params } =
        parsePaginationParams(req.url)

    const donors = Donor.aggregate()
    const validField = field

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

        donors.search({
            index: 'default',
            sort: { score: { $meta: 'searchScore' } },
            ...operator,
        })
    } else if (sort === 'asc' || sort === 'desc') {
        const sortBy = sort === 'asc' ? 1 : -1

        if (validField) {
            donors.sort({ [field]: sortBy })
        } else {
            donors.sort({ firstname: sortBy, lastName: sortBy })
        }
    }

    applyMatchFilters(donors, params, ALLOWED_FILTER_PARAMS)

    const { data, count } = await executeAggregationPaginated(Donor, donors, {
        skip,
        limit,
    })

    return NextResponse.json({
        page,
        limit,
        count,
        data: data.map((u) => ({
            ...u,
        })),
    })
}

const PatchUserRequest = z
    .object({
        id: z.string(),
        shippingStatus: z.enum(ShippingStatus).optional(),
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

    if (!isValidObjectId(id)) {
        return NextResponse.json(
            {
                error: 'Bad Request',
                message: `Invalid object ID in 'id' field`,
            },
            { status: 400 }
        )
    }

    await dbConnect()

    const donor = await Donor.findById(id)
    if (!donor) {
        return NextResponse.json(
            {
                error: 'Not Found',
                message: 'The requested object does not exist',
            },
            { status: 404 }
        )
    }

    for (const key in rest) {
        if (rest[key] !== undefined && !deepEqual(rest[key], donor[key])) {
            donor[key] = rest[key]
        }
    }

    await donor.save()

    return NextResponse.json(donor, { status: 200 })
}
