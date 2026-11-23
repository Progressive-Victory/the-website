import { EndorsementAvatar } from '@/components/common'
import {
    DynamicFormFieldProps,
    FormFieldProps,
    useConfigure,
} from '@/components/common/forms'
import type { BannerPillTone } from '@/components/common/panel/panel_components/BannerPill'
import {
    PanelBanner,
    type PanelBannerTag,
} from '@/components/common/panel/panel_components/PanelBanner'
import { stateOptions } from '@/models'
import { DOT_SEPARATOR, parseErrorMessage } from '@/util'
import { Endorsement, EndorsementType, InitiativeType } from 'pv-contracts/data'
import { ReactNode, useState } from 'react'

interface EndorsementBannerProps extends Partial<
    FormFieldProps<Endorsement, string>
> {
    endorsement: Endorsement
    tabBar?: ReactNode
    uploadImage?: (image: File) => Promise<{ url: string }>
    editing?: boolean
    saving?: boolean
    dynamic?: DynamicFormFieldProps<Endorsement, string>
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

const endorsementLevelTones: Record<EndorsementType, BannerPillTone> = {
    [EndorsementType.PVPledge]: 'purple',
    [EndorsementType.Endorsement]: 'green',
    [EndorsementType.Recommendation]: 'red',
    [EndorsementType.Unendorsed]: 'darkRed',
    [EndorsementType.None]: 'default',
}

const stateNames = new Map(
    stateOptions.map((option) => [option.value, option.label])
)
const validImage = () => true

const buildTags = (endorsement: Endorsement) => {
    const tags: PanelBannerTag[] = []
    if (endorsement.initiativeLevel !== InitiativeType.None)
        tags.push({
            key: 'initiative',
            label: initiativeLevelLabels[endorsement.initiativeLevel],
            tone:
                endorsement.initiativeLevel === InitiativeType.State
                    ? 'orange'
                    : 'blue',
        })
    if (endorsement.endorsementLevel !== EndorsementType.None)
        tags.push({
            key: 'endorsementLevel',
            label: endorsementLevelLabels[endorsement.endorsementLevel],
            tone: endorsementLevelTones[endorsement.endorsementLevel],
        })
    return tags
}

export function EndorsementBanner({
    endorsement,
    tabBar,
    id,
    uploadImage,
    editing = false,
    saving = false,
    dynamic,
}: EndorsementBannerProps) {
    const { onChange } = useConfigure(
        { id, label: 'Image', field: 'imgHref', dynamic },
        validImage
    )
    const [uploading, setUploading] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)
    const isEditing = dynamic?.editing ?? editing
    const isSaving = dynamic?.saving ?? saving
    const canEditImage = isEditing && !isSaving && !!uploadImage

    const handleUpload = async (file: File) => {
        if (!uploadImage) return

        setUploading(true)
        setUploadError(null)

        try {
            const { url } = await uploadImage(file)
            onChange(url)
        } catch (error) {
            setUploadError(parseErrorMessage(error, 'Failed to upload image'))
        } finally {
            setUploading(false)
        }
    }

    const published = endorsement.endorsementPublished

    return (
        <PanelBanner
            cover
            avatar={{
                image: (
                    <EndorsementAvatar
                        endorsement={endorsement}
                        size={72}
                        skeletonDelay={200}
                    />
                ),
                onUpload: canEditImage
                    ? (file) => void handleUpload(file)
                    : undefined,
                uploading,
            }}
            title={
                <>
                    {endorsement.name || 'New Endorsement'}
                    {endorsement.incumbent && '*'}
                </>
            }
            subtitle={
                [
                    stateNames.get(endorsement.state) ?? endorsement.state,
                    endorsement.office,
                    endorsement.jurisdiction,
                ]
                    .filter(Boolean)
                    .join(` ${DOT_SEPARATOR} `) || 'No state selected'
            }
            error={uploadError}
            statusPill={{
                label: published ? 'Published' : 'Not Published',
                tone: published ? 'green' : 'darkRed',
            }}
            tags={buildTags(endorsement)}
            tabBar={tabBar}
        />
    )
}
