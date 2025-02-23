'use client'

// TODO: clean for XXS, unless WP already does this?
export const HTML: React.FC<{ html: string }> = ({ html }) => {
    return (
        <div
            dangerouslySetInnerHTML={{
                __html: html,
            }}
        />
    )
}
