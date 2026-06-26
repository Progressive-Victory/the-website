'use client'

import { Detail, Sidebar, SplitView } from '@/components/common/split_view'
import card from '@/components/common/split_view/panelCard.module.css'

export default function Page() {
    return (
        <div className={card.card}>
            <SplitView>
                <SplitView.Sidebar>
                    <Sidebar variant="prominent" largeTitle>
                        <Sidebar.Header>
                            <Sidebar.Title large>Test</Sidebar.Title>
                        </Sidebar.Header>
                        <Sidebar.List />
                    </Sidebar>
                </SplitView.Sidebar>
                <SplitView.Detail>
                    <Detail>
                        <Detail.Body>
                            <div />
                        </Detail.Body>
                    </Detail>
                </SplitView.Detail>
            </SplitView>
        </div>
    )
}
