import { memo } from 'react'
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import FormInput from '../components/fields/FormInput'
import FormSelect from '../components/fields/FormSelect'
import FormRadioGroup from '../components/fields/FormRadioGroup'
import { FieldArrayError } from '../components/fields/FieldArrayError'
import { CANDIDATE_TYPES, NOTICE_PERIODS } from '../schemas/options'
import type { ApplicationFormValues } from '../schemas/applicationSchema'
import { emptyCompany } from '../schemas/defaultValues'

interface CompanyRowProps {
  index: number
  onRemove: (index: number) => void
}

const CompanyRow = memo(function CompanyRow({
  index,
  onRemove,
}: CompanyRowProps) {
  const base = `experience.companies.${index}` as const

  return (
    <fieldset className="row-card">
      <legend>Previous company {index + 1}</legend>
      <div className="grid-2">
        <FormInput name={`${base}.companyName`} label="Company name" />
        <FormInput name={`${base}.role`} label="Role" />
        <FormInput name={`${base}.from`} label="From" type="date" />
        <FormInput name={`${base}.to`} label="To" type="date" />
      </div>
      <button
        type="button"
        className="btn btn-danger"
        onClick={() => onRemove(index)}
        aria-label={`Remove company ${index + 1}`}
      >
        Remove
      </button>
    </fieldset>
  )
})

function FresherFields() {
  return (
    <FormInput
      name="experience.availability"
      label="Available to join from"
      type="date"
    />
  )
}

function ExperiencedFields() {
  const { control } = useFormContext<ApplicationFormValues>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'experience.companies',
  })

  return (
    <>
      <div className="grid-2">
        <FormInput
          name="experience.totalExperience"
          label="Total experience (years)"
          inputMode="decimal"
          placeholder="e.g. 3.5"
        />
        <FormSelect
          name="experience.noticePeriod"
          label="Notice period"
          options={NOTICE_PERIODS}
        />
      </div>

      <h3 className="subheading">Previous companies</h3>
      {fields.map((field, index) => (
        <CompanyRow key={field.id} index={index} onRemove={remove} />
      ))}
      <FieldArrayError name="experience.companies" />
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => append(emptyCompany)}
      >
        + Add company
      </button>
    </>
  )
}

// The only component that subscribes to the Fresher / Experienced choice.
// Switching re-renders this small switch, not the whole step or the wizard.
function ConditionalFields() {
  const { control } = useFormContext<ApplicationFormValues>()
  const candidateType = useWatch({ control, name: 'experience.candidateType' })

  return candidateType === 'experienced' ? (
    <ExperiencedFields />
  ) : (
    <FresherFields />
  )
}

export default function ExperienceStep() {
  return (
    <>
      <FormRadioGroup
        name="experience.candidateType"
        legend="I am a"
        options={CANDIDATE_TYPES}
      />
      <ConditionalFields />
    </>
  )
}