import styles from './blog.module.css'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

interface BlogCardProps {
    title: string
    id: string
    description: string
    date: string
    image: string
}

export function BlogCard({
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
        <Link href={`/blog/${encodeURIComponent(id)}`} className={styles.card}>
            <div className={styles.imageWrapper}>
                <Image
                    src={image}
                    alt={title}
                    width={650}
                    height={650}
                    className={styles.image}
                />
            </div>

            <div className={styles.contentOverlay}>
                <div className={styles.content}>
                    <h3 className={styles.title}>{title}</h3>

                    <div
                        className={styles.description}
                        dangerouslySetInnerHTML={{
                            __html: description,
                        }}
                    />

                    <p className={styles.date}>{formatDate(date)}</p>
                </div>
            </div>
        </Link>
    )
}
