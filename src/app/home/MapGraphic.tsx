'use client'

import styles from './map.module.css'
import { Map } from '@/components/Map'
import { BaseButton } from '@/components/common/buttons/Button'
import buttonStyles from '@/components/common/buttons/Button.module.css'

export function MapGraphic() {
    return (
        <div className={styles.container}>
            <div className={styles.mapWrapper}>
                <Map hideOpenStreetMap disableInteraction />
            </div>

            <div className={styles.textSection}>
                <h1 className={styles.heading}>
                    Thousands of{' '}
                    <span className={styles.highlight}>Volunteers</span>
                    <br /> Across the US
                </h1>

                <p className={styles.description}>
                    The PV community is constantly growing! Our members are
                    organizing in their local communities, identifying campaigns
                    in their area, and using the shared resources, tactics, and
                    people power of Progressive Victory!
                </p>
                <BaseButton
                    label="Get Involved"
                    href="/volunteer"
                    className={buttonStyles.prominent}
                />
            </div>
        </div>
    )
}
