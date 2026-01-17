export interface PaginatedListProps<T> {
    items: T[];
    onPage(page: number);
}

export function PaginatedList<T>({}: PaginatedListProps<T>) {
    return (
        <div>
            <div></div>
        </div>
    )
}
