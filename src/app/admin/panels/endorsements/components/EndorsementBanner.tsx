import { EndorsementAvatar } from './EndorsementAvatar'
import styles from './EndorsementBanner.module.css'
import {
    DynamicFormFieldProps,
    FormFieldProps,
    useConfigure,
} from '@/components/common/forms'
import { TabBar, TabSpec } from '@/components/common/tab_bar/TabBar'
import { Endorsement, EndorsementType, InitiativeType } from '@/contracts/data'
import { stateOptions } from '@/models'
import { cn } from '@/util'
import { ChangeEvent, useState } from 'react'
import { FaCamera } from 'react-icons/fa'

interface EndorsementBannerProps extends Partial<
    FormFieldProps<Endorsement, string>
> {
    endorsement: Endorsement
    selectedTab?: string
    tabs?: TabSpec[]
    onTabChange?: (key: string) => void
    uploadImage?: (image: File) => Promise<{ url: string }>
    dynamic?: DynamicFormFieldProps<Endorsement, string>
    containerClassName?: string
    coverClassName?: string
}

const initiativeLevelLabels: Record<InitiativeType, string> = {
    [InitiativeType.State]: 'State Initiative',
    [InitiativeType.National]: 'National Initiative',
    [InitiativeType.None]: 'None',
}

const endorsementLevelLabels: Record<EndorsementType, string> = {
    [EndorsementType.PVPledge]: 'PV Pledge',
    [EndorsementType.Endorsement]: 'Endorsement',
    [EndorsementType.Recommendation]: 'Recommendation',
    [EndorsementType.Unendorsed]: 'Unendorsed',
    [EndorsementType.None]: 'None',
}

const stateNames = new Map(
    stateOptions.map((option) => [option.value, option.label])
)
const validImage = () => true

export function EndorsementBanner({
    endorsement,
    selectedTab,
    tabs,
    onTabChange,
    id,
    uploadImage,
    dynamic,
    containerClassName,
    coverClassName,
}: EndorsementBannerProps) {
    const { onChange } = useConfigure(
        { id, label: 'Image', field: 'imgUrl', dynamic },
        validImage
    )
    const [uploading, setUploading] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)
    const canEditImage = dynamic?.editing && !dynamic.saving && uploadImage

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        event.target.value = ''
        if (!file || !uploadImage) return

        setUploading(true)
        setUploadError(null)

        try {
            const { url } = await uploadImage(file)
            onChange(url)
        } catch (error) {
            setUploadError(
                error instanceof Error
                    ? error.message
                    : 'Failed to upload image'
            )
        } finally {
            setUploading(false)
        }
    }

    const content = (
        <div className={styles.headerTop}>
            <div className={styles.cardStyle}>
                {canEditImage ? (
                    <label className={styles.avatarButton} title="Change image">
                        <EndorsementAvatar
                            endorsement={endorsement}
                            size={72}
                        />
                        <span className={styles.imageOverlay}>
                            <FaCamera />
                        </span>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(event) => void handleFileChange(event)}
                            disabled={uploading}
                            hidden
                        />
                    </label>
                ) : (
                    <EndorsementAvatar endorsement={endorsement} size={72} />
                )}
                <div className={styles.userInfo}>
                    <h1 className={styles.headerUserName}>
                        {endorsement.name || 'New Endorsement'}
                    </h1>
                    <h2 className={styles.headerUserUsername}>
                        {stateNames.get(endorsement.state) ??
                            (endorsement.state
                                ? endorsement.state
                                : 'No state selected')}
                    </h2>
                    {uploadError && (
                        <span className={styles.uploadError}>
                            {uploadError}
                        </span>
                    )}
                </div>
            </div>
            <div className={styles.roleList}>
                <span className={styles.rolePill}>
                    {initiativeLevelLabels[endorsement.initiativeLevel]}
                </span>
                <span className={styles.rolePill}>
                    {endorsementLevelLabels[endorsement.endorsementLevel]}
                </span>
                <span
                    className={cn(
                        styles.rolePill,
                        endorsement.endorsementPublished
                            ? styles.publishedTag
                            : styles.notPublishedTag
                    )}
                >
                    {endorsement.endorsementPublished
                        ? 'Published'
                        : 'Not Published'}
                </span>
            </div>
            {tabs && tabs.length > 0 && selectedTab && onTabChange && (
                <TabBar
                    tabs={tabs}
                    value={selectedTab}
                    onChange={onTabChange}
                />
            )}
        </div>
    )

    if (!containerClassName) return content

    return (
        <div className={containerClassName}>
            {coverClassName && <div className={coverClassName} />}
            {content}
        </div>
    )
}
