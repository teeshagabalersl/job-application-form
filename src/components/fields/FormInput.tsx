import { memo, type HTMLInputTypeAttribute } from 'react'
import { FieldShell, useFieldControl, type FieldName } from './useFieldControl'

interface FormInputProps {
  name: FieldName
  label: string
  type?: HTMLInputTypeAttribute
  hint?: string
  /** Marks the field as required for assistive tech. Validation is in Zod. */
  required?: boolean
  autoComplete?: string
  inputMode?: 'text' | 'numeric' | 'decimal' | 'tel' | 'email' | 'url'
  placeholder?: string
}

function FormInputBase({
  name,
  label,
  type = 'text',
  hint,
  required = true,
  autoComplete,
  inputMode,
  placeholder,
}: FormInputProps) {
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
      <input
        {...register(name)}
        {...a11y}
        type={type}
        aria-required={required}
        autoComplete={autoComplete}
        inputMode={inputMode}
        placeholder={placeholder}
      />
    </FieldShell>
  )
}

export const FormInput = memo(FormInputBase)
export default FormInput