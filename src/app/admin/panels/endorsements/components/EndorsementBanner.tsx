import { EndorsementAvatar } from './EndorsementAvatar'
import styles from './EndorsementBanner.module.css'
import {
    DynamicFormFieldProps,
    FormFieldProps,
    useConfigure,
} from '@/components/common/forms'
import { TabBar, TabSpec } from '@/components/common/tab_bar/TabBar'
import { HStack, Spacer, VStack, ZStack } from '@/components/layout'
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
    editing?: boolean
    saving?: boolean
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

// # TODO Merge EndorsementBanner and MemberBanner into a single HeaderBanner Component as part of Admin Panel Refactor to Volunteer Dashboard
export function EndorsementBanner({
    endorsement,
    selectedTab,
    tabs,
    onTabChange,
    id,
    uploadImage,
    editing = false,
    saving = false,
    dynamic,
    containerClassName,
    coverClassName,
}: EndorsementBannerProps) {
    const { onChange } = useConfigure(
        { id, label: 'Image', field: 'imgHref', dynamic },
        validImage
    )
    const [uploading, setUploading] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)
    const isEditing = dynamic?.editing ?? editing
    const isSaving = dynamic?.saving ?? saving
    const canEditImage = isEditing && !isSaving && uploadImage

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
        <VStack align="left" gap={0.75} className={styles.headerTop}>
            <HStack gap={0.75} className={styles.topRow}>
                <HStack gap={0.75}>
                    {canEditImage ? (
                        <label
                            className={styles.avatarButton}
                            title="Change image"
                        >
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
                                onChange={(event) =>
                                    void handleFileChange(event)
                                }
                                disabled={uploading}
                                hidden
                            />
                        </label>
                    ) : (
                        <ZStack>
                            <EndorsementAvatar
                                endorsement={endorsement}
                                size={72}
                            />
                        </ZStack>
                    )}
                    <VStack align="left" gap={0.2}>
                        <h1 className={styles.headerUserName}>
                            {endorsement.name || 'New Endorsement'}
                            {endorsement.incumbent && '*'}
                        </h1>
                        <h2 className={styles.headerUserUsername}>
                            {[
                                stateNames.get(endorsement.state) ??
                                    endorsement.state,
                                endorsement.jurisdiction,
                            ]
                                .filter(Boolean)
                                .join(' · ') || 'No state selected'}
                        </h2>
                        {uploadError && (
                            <span className={styles.uploadError}>
                                {uploadError}
                            </span>
                        )}
                    </VStack>
                </HStack>
                <Spacer />
                <HStack gap={0.5}>
                    <span
                        className={cn(
                            styles.rolePill,
                            endorsement.endorsementPublished
                                ? styles.tagGreen
                                : styles.tagDarkRed
                        )}
                    >
                        {endorsement.endorsementPublished
                            ? 'Published'
                            : 'Not Published'}
                    </span>
                </HStack>
            </HStack>
            <HStack gap={0.5}>
                {endorsement.initiativeLevel !== InitiativeType.None && (
                    <span
                        className={cn(
                            styles.rolePill,
                            endorsement.initiativeLevel === InitiativeType.State
                                ? styles.tagOrange
                                : styles.tagBlue
                        )}
                    >
                        {initiativeLevelLabels[endorsement.initiativeLevel]}
                    </span>
                )}
                {endorsement.endorsementLevel !== EndorsementType.None && (
                    <span
                        className={cn(
                            styles.rolePill,
                            endorsement.endorsementLevel ===
                                EndorsementType.PVPledge && styles.tagPurple,
                            endorsement.endorsementLevel ===
                                EndorsementType.Endorsement && styles.tagGreen,
                            endorsement.endorsementLevel ===
                                EndorsementType.Recommendation && styles.tagRed
                        )}
                    >
                        {endorsementLevelLabels[endorsement.endorsementLevel]}
                    </span>
                )}
            </HStack>
            {tabs && tabs.length > 0 && selectedTab && onTabChange && (
                <TabBar
                    tabs={tabs}
                    value={selectedTab}
                    onChange={onTabChange}
                />
            )}
        </VStack>
    )

    if (!containerClassName) return content

    return (
        <div className={containerClassName}>
            {coverClassName && <div className={coverClassName} />}
            {content}
        </div>
    )
}
