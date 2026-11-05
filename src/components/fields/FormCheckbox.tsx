import { memo } from 'react'
import { FieldMessages, useFieldControl, type FieldName } from './useFieldControl'

interface FormCheckboxProps {
  name: FieldName
  label: string
  hint?: string
}

function FormCheckboxBase({ name, label, hint }: FormCheckboxProps) {
  const { register, error, inputId, hintId, errorId, a11y } = useFieldControl(
    name,
    Boolean(hint),
  )

  return (
    <div className="field field-checkbox">
      <div className="checkbox-row">
        <input {...register(name)} {...a11y} type="checkbox" />
        <label htmlFor={inputId}>{label}</label>
      </div>
      <FieldMessages
        hint={hint}
        hintId={hintId}
        error={error}
        errorId={errorId}
      />
    </div>
  )
}

export const FormCheckbox = memo(FormCheckboxBase)
export default FormCheckbox