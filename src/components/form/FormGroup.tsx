import { FormField, IFormField } from '.'
import { CollapsableSection } from '@/components/common'

export interface IFormGroup {
    title: string
    fields: IFormField[]
    defaultCollapsed?: boolean
}

export function MakeFormGroup(
    title: string,
    fields: IFormField[],
    flags?: { defaultCollapsed?: boolean }
): IFormGroup {
    return { title, fields, ...(flags ?? {}) }
}

export interface FormGroupProps {
    group: IFormGroup
    value?: Record<string, unknown>
    isDisabled: boolean
    isLoading: boolean
    activeFieldMenu: string | null
    setActiveFieldMenu: (value: string | null) => void
    onUpdate: (value: Record<string, unknown>) => void
}

export function FormGroup({
    group,
    value,
    isDisabled,
    isLoading,
    activeFieldMenu,
    setActiveFieldMenu,
    onUpdate,
}: FormGroupProps) {
    return (
        <CollapsableSection
            title={group.title}
            initialOpenState={!group.defaultCollapsed}
        >
            <div className="grid grid-cols-3 gap-2 gap-x-4">
                {(group.fields ?? []).map((field) => (
                    <FormField
                        key={field.name}
                        field={field}
                        value={value ? value[field.key] : undefined}
                        isDisabled={isDisabled}
                        isLoading={isLoading}
                        activeFieldMenu={activeFieldMenu}
                        setActiveFieldMenu={setActiveFieldMenu}
                        onUpdate={(updated) =>
                            onUpdate({ ...(value ?? {}), [field.key]: updated })
                        }
                    />
                ))}
            </div>
        </CollapsableSection>
    )
}
