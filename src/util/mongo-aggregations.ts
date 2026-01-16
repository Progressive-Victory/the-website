import dbConnect from '@/util/libmongo'
import { Aggregate, Model, PipelineStage } from 'mongoose'

export interface Filter {
    /**
     * The key to use within each document
     */
    key: string
    /**
     * The key to use within the matched nested object
     */
    match_key: string
}

export function applyMatchFilters(
    aggregation: Aggregate<unknown>,
    params: URLSearchParams,
    filters: Filter[]
) {
    for (const filter of filters) {
        const values = params.getAll(filter.key)

        if (values.length === 0) continue

        aggregation.match({
            [`${filter.key}.${filter.match_key}`]: {
                $in: values,
            },
        })
    }
}

/**
 * Takes a base aggregation and applies a list of
 */
export async function executeAggregationPaginated<T>(
    model: Model<T>,
    aggregation: Aggregate<unknown>,
    options: {
        skip: number
        limit: number
    }
) {
    await dbConnect()

    const count_results = (await model
        .aggregate(
            (aggregation as unknown as { _pipeline: PipelineStage[] })._pipeline
        )
        .count('count')
        .exec()) as { count?: number }[]

    const count = count_results[0]?.count ?? 0

    const data = (await aggregation
        .skip(options.skip)
        .limit(options.limit)
        .exec()) as T[]

    return {
        data,
        count,
        pages: Math.ceil(count / options.limit),
    }
}
