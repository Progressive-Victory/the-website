/*
 * This script exists to perform a mass update to the database to change how discord avatars stored.
 * At the time of writing, avatars are stored in the `image` field of the User model as a static URL
 * of the form "https://cdn.discordapp.com/avatars/{discordId}/{discordUserAvatar}?size=512"
 * This script will parse these all to move the discordUserAvatar to a separate field in the User model.
 * This will aid in solving certain bugs as well as provide more flexibility to future development.
 *
 * This can simply be run from anywhere configured through the .env file for the target database using tsx.
 * The output is worth monitoring to see that it completes without errors. Any database failures will result
 * in a message and a non-zero exit code. It will result in a zero exit code without database errors even
 * if any document marked for update is not modified. Under certain circumstances, this may still be concerning.
 *
 * While this is included in this project because it needs to be run in the same enviroment as the website,
 * care should be taken before running this script. It may be safely run multiple times, but any future
 * updates to the `discordUserAvatar` are likely to be overwritten by running again. After deploying changes
 * to use the new field instead of the old and running this migration, we should consider deleting this script
 * or archiving it for future reference.
 *
 * - Hyrum Hammon (hhammon)
 */

import * as dotenv from 'dotenv'
import mongoose from 'mongoose'
import User from '@/models/User'

dotenv.config()

// Copied from util/libmongo.ts
const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable')
}

async function dbConnect() {
    // If the connection is already established (readyState 1 means connected),
    // return the mongoose instance right away.
    if (mongoose.connection.readyState >= 1) {
        return mongoose
    }

    try {
        // Connect to MongoDB; note that in a serverless environment it is
        // acceptable to connect on every invocation since cold starts are expected.
        await mongoose.connect(MONGODB_URI!, {
            bufferCommands: false, // Disable mongoose buffering, recommended for serverless.
        })

        return mongoose
    } catch (error) {
        console.error('MongoDB connection error:', error)
        throw error
    }
}
// End util/libmongo.ts

async function main() {
    await dbConnect()

    const users = await User.find()
        .select({
            _id: 1,
            image: 1,
        })
        .exec()

    // Get data needed to perform an update for each user.
    const updates = users
        .map((user) => {
            if (!user.image) return null

            // Get last part of path and trim off query string
            const imageParts = user.image.split('/')
            let discordUserAvatar: string | null =
                imageParts[imageParts.length - 1].split('?')[0]

            // null values were string encoded into the URL and should be turned back to null.
            if (discordUserAvatar == 'null') {
                discordUserAvatar = null
            }

            return {
                _id: user._id,
                discordUserAvatar,
            }
        })
        .filter((x) => !!x)

    // Chunk updates so many can happen concurrently, but not all at once.
    const chunkSize = 100
    const chunks: (typeof updates)[] = []
    for (let i = 0; i < updates.length; i += chunkSize) {
        chunks.push(updates.slice(i, i + chunkSize))
    }

    let errors = 0
    let unmodified = 0
    for (let chunkIdx = 0; chunkIdx < chunks.length; chunkIdx++) {
        const chunk = chunks[chunkIdx]

        console.log(
            `Beginning chunk ${chunkIdx + 1}/${chunks.length}, ${
                chunk.length
            } updates.`
        )

        const results = await Promise.allSettled(
            chunk.map((update) => {
                return User.updateOne(
                    { _id: update._id },
                    {
                        $set: {
                            discordUserAvatar: update.discordUserAvatar,
                        },
                    }
                )
            })
        )

        // Log any errors as well as unmodified documents.
        // Unmodified documents are likely not concerning unless the script is being run for the first time.
        results.forEach((result, idx) => {
            if (result.status == 'rejected') {
                console.error(
                    `Failed to update ID '${chunk[idx]._id}'. Error: `,
                    result.reason
                )

                errors++
            } else {
                if (result.value.modifiedCount == 0) {
                    console.log(
                        `No document modified for ID '${chunk[idx]._id}'.`
                    )

                    unmodified++
                }
            }
        })
    }

    console.log(
        `Completed with ${errors} errors, ${unmodified} unmodified documents, and ${
            updates.length - errors - unmodified
        } modified documents.`
    )

    // A live db connection prevents the process from terminating at the end of the function.
    // Exit with code 1 if there were any errors
    process.exit(errors && 1)
}

main()
