import { memo } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import FormInput from '../components/fields/FormInput'
import FormSelect from '../components/fields/FormSelect'
import { FieldArrayError } from '../components/fields/FieldArrayError'
import { DEGREES } from '../schemas/options'
import type { ApplicationFormValues } from '../schemas/applicationSchema'
import { emptyQualification } from '../schemas/defaultValues'

interface QualificationRowProps {
  index: number
  onRemove: (index: number) => void
}

// memo: a row only re-renders when its own index changes, not when a
// sibling row is added, removed or edited.
const QualificationRow = memo(function QualificationRow({
  index,
  onRemove,
}: QualificationRowProps) {
  const base = `education.qualifications.${index}` as const

  return (
    <fieldset className="row-card">
      <legend>Qualification {index + 1}</legend>
      <div className="grid-2">
        <FormSelect name={`${base}.degree`} label="Degree" options={DEGREES} />
        <FormInput name={`${base}.institution`} label="Institution" />
        <FormInput
          name={`${base}.yearOfPassing`}
          label="Year of passing"
          inputMode="numeric"
          placeholder="e.g. 2024"
        />
        <FormInput
          name={`${base}.percentage`}
          label="Percentage"
          inputMode="decimal"
          placeholder="e.g. 78.5"
        />
      </div>
      <button
        type="button"
        className="btn btn-danger"
        onClick={() => onRemove(index)}
        aria-label={`Remove qualification ${index + 1}`}
      >
        Remove
      </button>
    </fieldset>
  )
})

export default function EducationStep() {
  const { control } = useFormContext<ApplicationFormValues>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'education.qualifications',
  })

  return (
    <>
      {fields.map((field, index) => (
        <QualificationRow key={field.id} index={index} onRemove={remove} />
      ))}
      <FieldArrayError name="education.qualifications" />
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => append(emptyQualification)}
      >
        + Add qualification
      </button>
    </>
  )
}