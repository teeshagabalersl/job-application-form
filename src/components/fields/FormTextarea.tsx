import { memo } from 'react'
import { FieldShell, useFieldControl, type FieldName } from './useFieldControl'

interface FormTextareaProps {
  name: FieldName
  label: string
  rows?: number
  hint?: string
  required?: boolean
}

function FormTextareaBase({
  name,
  label,
  rows = 5,
  hint,
  required = false,
}: FormTextareaProps) {
  const { register, error, inputId, hintId, errorId, a11y } = useFieldControl(
    name,
    Boolean(hint),
  )

  return (
    <FieldShell
      label={label}
      htmlFor={inputId}
      required={required}
      hint={hint}
      hintId={hintId}
      error={error}
      errorId={errorId}
    >
      <textarea
        {...register(name)}
        {...a11y}
        rows={rows}
        aria-required={required}
      />
    </FieldShell>
  )
}

export const FormTextarea = memo(FormTextareaBase)
export default FormTextarea