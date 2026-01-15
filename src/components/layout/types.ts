export interface SubnavColumn {
    title: string
    items: NavItem[]
}

export interface SubnavConfig {
    columns: SubnavColumn[]
}

export interface NavItem {
    name: string
    href: string
    subnav?: SubnavConfig
}
