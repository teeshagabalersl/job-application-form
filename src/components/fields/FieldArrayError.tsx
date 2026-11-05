import { get, useFormContext, useFormState } from 'react-hook-form'
import type { ArrayPath } from 'react-hook-form'
import type { ApplicationFormValues } from '../../schemas/applicationSchema'

/**
 * Error for the list as a whole ("Add at least one qualification"), as
 * opposed to an error on one row. React Hook Form stores it under `.root`
 * for field arrays.
 */
export function FieldArrayError({
  name,
}: {
  name: ArrayPath<ApplicationFormValues>
}) {
  const { control } = useFormContext<ApplicationFormValues>()
  const { errors } = useFormState({ control, name })
  const arrayError = get(errors, name) as
    | { root?: { message?: string }; message?: string }
    | undefined
  const message = arrayError?.root?.message ?? arrayError?.message

  if (!message) return null
  return (
    <p role="alert" className="field-error">
      {message}
    </p>
  )
}