import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

type BlogCardProps = {
    title: string
    id: string
    description: string
    date: string
    image: string
}

export default function BlogCard({
    title,
    id,
    description,
    date,
    image,
}: BlogCardProps) {
    function formatDate(date: string) {
        return new Date(date).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }
    return (
        <Link
            className="relative rounded-xl shadow-md"
            href={`/blog/${encodeURIComponent(id)}`}
        >
            <div className="relative w-full overflow-hidden rounded-xl before:absolute before:inset-x-0 before:z-[1] before:size-full before:bg-gradient-to-t before:from-neutral-900/[.9] ">
                <Image src={image} alt="test" width={650} height={650} />
            </div>
            <div className="absolute inset-x-0 bottom-0 z-[1]">
                <div className="flex h-full flex-col rounded-b-xl bg-white bg-opacity-90 p-4 sm:p-6 ">
                    <h3 className="text-lg">{title}</h3>
                    <div
                        className="text-gray-500 line-clamp-2"
                        dangerouslySetInnerHTML={{
                            __html: description,
                        }}
                    />
                    <p className="text-sm">{formatDate(date)}</p>
                </div>
            </div>
        </Link>
    )
}
