import { FormGroup, FormGroupProps } from './FormGroup'
import styles from './FormGroup.module.css'
import { cn } from '@/util'

export function InsetFormGroup<T>({ className, ...props }: FormGroupProps<T>) {
    return <FormGroup {...props} className={cn(styles.inset, className)} />
}
