'use client'

import styles from './page.module.css'
import Panel from '@/components/common/panel/Panel'
import { Table, type ColumnEntry } from '@/components/common/table'

export default function Page() {
    const columns: ColumnEntry<Person>[] = [
        {
            key: 'name',
            header: 'Name',
            width: '14rem',
            render: (person) => person.name,
            renderEdit: (person) => <NameInput person={person} />,
            sortValue: (person) => person.name,
        },
        {
            label: 'Contact',
            columns: [
                { key: 'email', header: 'Email', render: (p) => p.email },
                { key: 'phone', header: 'Phone', render: (p) => p.phone },
            ],
        },
    ]

    return (
        <Panel includeHeader label="Experiment">
            <div className={styles.panelContents}>
                <div className={styles.scrollView}>
                    <div className={styles.galleryHeader}>
                        <div className={styles.galleryHeading}>
                            <h1 className={styles.galleryTitle}>Experiment</h1>
                            <p className={styles.gallerySubTitle}>
                                Sandbox for iterating on the Table component.
                            </p>
                        </div>
                    </div>
                    <Table
                        columns={columns}
                        data={people}
                        rowKey={(person) => person.id}
                        mode="view"
                        zebra
                    />
                </div>
            </div>
        </Panel>
    )
}
