import { useFormContext, useWatch } from 'react-hook-form'
import FormInput from '../components/fields/FormInput'
import FormSelect from '../components/fields/FormSelect'
import FormTextarea from '../components/fields/FormTextarea'
import FormCheckbox from '../components/fields/FormCheckbox'
import { COVER_NOTE_MAX_LENGTH, POSITIONS } from '../schemas/options'
import type { ApplicationFormValues } from '../schemas/applicationSchema'

// Isolated so typing in the cover note re-renders only this counter,
// not the textarea's parent step.
function CoverNoteCounter() {
  const { control } = useFormContext<ApplicationFormValues>()
  const note = useWatch({ control, name: 'application.coverNote' })

  return (
    <p className="char-count" aria-live="polite">
      {note.length} / {COVER_NOTE_MAX_LENGTH} characters
    </p>
  )
}

export default function ApplicationStep() {
  return (
    <>
      <FormSelect
        name="application.position"
        label="Position applied for"
        options={POSITIONS}
      />
      <FormInput
        name="application.expectedJoiningDate"
        label="Expected joining date"
        type="date"
      />
      <FormInput
        name="application.portfolioUrl"
        label="Portfolio link"
        type="url"
        required={false}
        inputMode="url"
        placeholder="https://"
      />
      <FormTextarea
        name="application.coverNote"
        label="Cover note"
        hint="Tell us briefly why you are a good fit."
      />
      <CoverNoteCounter />
      <FormCheckbox
        name="application.acceptTerms"
        label="I confirm the information is correct and accept the terms and conditions."
      />
    </>
  )
}