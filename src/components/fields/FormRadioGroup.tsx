import { memo, useId } from 'react'
import { FieldMessages, useFieldControl, type FieldName } from './useFieldControl'

interface RadioOption {
  value: string
  label: string
}

interface FormRadioGroupProps {
  name: FieldName
  legend: string
  options: readonly RadioOption[]
  hint?: string
}

function FormRadioGroupBase({
  name,
  legend,
  options,
  hint,
}: FormRadioGroupProps) {
  const { register, error, hintId, errorId, a11y } = useFieldControl(
    name,
    Boolean(hint),
  )
  const groupId = useId()

  return (
    <fieldset
      className="field field-radio-group"
      aria-describedby={a11y['aria-describedby']}
    >
      <legend>
        {legend}
        <span aria-hidden="true" className="required-mark">
          {' '}
          *
        </span>
      </legend>
      <div className="radio-options">
        {options.map((option, index) => {
          const optionId = `${groupId}-${index}`
          return (
            <div key={option.value} className="radio-row">
              <input
                {...register(name)}
                id={optionId}
                type="radio"
                value={option.value}
                aria-invalid={a11y['aria-invalid']}
              />
              <label htmlFor={optionId}>{option.label}</label>
            </div>
          )
        })}
      </div>
      <FieldMessages
        hint={hint}
        hintId={hintId}
        error={error}
        errorId={errorId}
      />
    </fieldset>
  )
}

export const FormRadioGroup = memo(FormRadioGroupBase)
export default FormRadioGroup