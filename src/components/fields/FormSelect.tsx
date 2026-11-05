import { memo } from 'react'
import { FieldShell, useFieldControl, type FieldName } from './useFieldControl'

interface FormSelectProps {
  name: FieldName
  label: string
  options: readonly string[]
  placeholder?: string
  hint?: string
  required?: boolean
}

function FormSelectBase({
  name,
  label,
  options,
  placeholder = 'Select...',
  hint,
  required = true,
}: FormSelectProps) {
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
      <select {...register(name)} {...a11y} aria-required={required}>
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </FieldShell>
  )
}

export const FormSelect = memo(FormSelectBase)
export default FormSelect