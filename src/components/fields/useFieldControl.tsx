import { useId, type ReactNode } from 'react'
import {
  get,
  useFormContext,
  useFormState,
  type FieldError,
  type FieldPath,
} from 'react-hook-form'
import type { ApplicationFormValues } from '../../schemas/applicationSchema'

export type FieldName = FieldPath<ApplicationFormValues>

/**
 * Shared wiring for every field component.
 *
 * - `register` comes from the one FormProvider (no props drilling).
 * - `useFormState({ name })` subscribes to this field's state only, so an
 *   error appearing on another field does not re-render this one.
 * - ids come from useId so names like `education.qualifications.0.degree`
 *   never end up inside an `id` attribute.
 */
export function useFieldControl(name: FieldName, hasHint = false) {
  const { register, control } = useFormContext<ApplicationFormValues>()
  const { errors } = useFormState({ control, name })
  const error = get(errors, name) as FieldError | undefined

  const uid = useId()
  const inputId = `${uid}-input`
  const hintId = `${uid}-hint`
  const errorId = `${uid}-error`

  const describedBy =
    [hasHint ? hintId : undefined, error ? errorId : undefined]
      .filter(Boolean)
      .join(' ') || undefined

  return {
    register,
    error,
    inputId,
    hintId,
    errorId,
    // Spread onto the control element.
    a11y: {
      id: inputId,
      'aria-invalid': error ? (true as const) : (false as const),
      'aria-describedby': describedBy,
    },
  }
}

interface FieldMessagesProps {
  hint?: string
  hintId: string
  error?: FieldError
  errorId: string
}

/** Hint text and the error message, announced with role="alert". */
export function FieldMessages({
  hint,
  hintId,
  error,
  errorId,
}: FieldMessagesProps) {
  return (
    <>
      {hint && (
        <p id={hintId} className="field-hint">
          {hint}
        </p>
      )}
      {error?.message && (
        <p id={errorId} role="alert" className="field-error">
          {error.message}
        </p>
      )}
    </>
  )
}

interface FieldShellProps extends FieldMessagesProps {
  label: string
  htmlFor: string
  required?: boolean
  children: ReactNode
}

/** Label + control + hint + error. Written once, used by every field. */
export function FieldShell({
  label,
  htmlFor,
  required,
  children,
  ...messages
}: FieldShellProps) {
  return (
    <div className="field">
      <label htmlFor={htmlFor}>
        {label}
        {required ? (
          <span aria-hidden="true" className="required-mark">
            {' '}
            *
          </span>
        ) : (
          <span className="optional-mark"> (optional)</span>
        )}
      </label>
      {children}
      <FieldMessages {...messages} />
    </div>
  )
}