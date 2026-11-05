import { useEffect, useRef, useState, type FormEvent } from 'react'
import {
  FormProvider,
  useForm,
  type FieldErrors,
  type FieldPath,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  STEP_KEYS,
  applicationSchema,
  type ApplicationFormValues,
} from './schemas/applicationSchema'
import { defaultValues } from './schemas/defaultValues'
import {
  ServerValidationError,
  submitApplication,
} from './api/submitApplication'
import PersonalStep from './steps/PersonalStep'
import EducationStep from './steps/EducationStep'
import ExperienceStep from './steps/ExperienceStep'
import ApplicationStep from './steps/ApplicatonStep'
import ReviewStep from './steps/ReviewStep'
import './App.css'

const STEPS = [
  { title: 'Personal Details', Component: PersonalStep },
  { title: 'Education', Component: EducationStep },
  { title: 'Experience', Component: ExperienceStep },
  { title: 'Application Details', Component: ApplicationStep },
  { title: 'Review & Submit', Component: ReviewStep },
] as const

const LAST_STEP = STEPS.length - 1

type SubmitState =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'validation'; count: number }
  | { kind: 'error'; message: string }
  | { kind: 'success'; referenceId: string }

const stepOfPath = (path: string) =>
  Math.max(0, STEP_KEYS.indexOf(path.split('.')[0] as (typeof STEP_KEYS)[number]))

export default function App() {
  // ONE form instance for the whole wizard. Steps share it through
  // FormProvider; values are never copied anywhere else.
  const methods = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues,
    mode: 'onTouched', // first check on blur, then live once touched
    reValidateMode: 'onChange',
  })
  const { handleSubmit, trigger, setError, setFocus, reset } = methods

  const [stepIndex, setStepIndex] = useState(0)
  const [status, setStatus] = useState<SubmitState>({ kind: 'idle' })

  const headingRef = useRef<HTMLHeadingElement>(null)
  const pendingFocus = useRef<FieldPath<ApplicationFormValues> | null>(null)
  const isFirstRender = useRef(true)

  // After a step change, move focus: to a field the server rejected, or
  // otherwise to the step heading so keyboard / screen reader users land
  // at the top of the new content.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (pendingFocus.current) {
      setFocus(pendingFocus.current)
      pendingFocus.current = null
    } else {
      headingRef.current?.focus()
    }
  }, [stepIndex, setFocus])

  const goNext = async () => {
    if (stepIndex >= LAST_STEP) return
    // Validates only this step's slice of the schema and focuses the first
    // invalid field.
    const valid = await trigger(STEP_KEYS[stepIndex], { shouldFocus: true })
    if (valid) setStepIndex((i) => i + 1)
  }

  const goBack = () => {
    setStatus({ kind: 'idle' })
    setStepIndex((i) => Math.max(0, i - 1))
  }

  const onValid = async (data: ApplicationFormValues) => {
    setStatus({ kind: 'submitting' })
    try {
      const { referenceId } = await submitApplication(data)
      setStatus({ kind: 'success', referenceId })
    } catch (error) {
      if (error instanceof ServerValidationError) {
        // 1. Field-level failure: put each message on its field, jump to the
        //    step that owns the first one and focus it.
        error.fieldErrors.forEach(({ path, message }) =>
          setError(path, { type: 'server', message }),
        )
        const first = error.fieldErrors[0]
        pendingFocus.current = first.path
        setStatus({ kind: 'validation', count: error.fieldErrors.length })
        setStepIndex(stepOfPath(first.path))
      } else {
        // 2. Server failure: nothing is wrong with the data. Keep everything
        //    and let the user retry.
        setStatus({
          kind: 'error',
          message:
            error instanceof Error
              ? error.message
              : 'Something went wrong. Please try again.',
        })
      }
    }
  }

  // Safety net: if the final validation finds a problem in an earlier step,
  // take the user there.
  const onInvalid = (errors: FieldErrors<ApplicationFormValues>) => {
    const firstBad = STEP_KEYS.findIndex((key) => errors[key])
    if (firstBad >= 0) setStepIndex(firstBad)
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (stepIndex < LAST_STEP) {
      void goNext() // Enter on a field behaves like "Next"
    } else {
      void handleSubmit(onValid, onInvalid)(event)
    }
  }

  const startOver = () => {
    reset(defaultValues)
    setStatus({ kind: 'idle' })
    setStepIndex(0)
  }

  if (status.kind === 'success') {
    return (
      <main className="page">
        <div className="card success" role="status">
          <h1>Application submitted</h1>
          <p>
            Thank you. Your reference number is{' '}
            <strong>{status.referenceId}</strong>.
          </p>
          <button type="button" className="btn btn-primary" onClick={startOver}>
            Start a new application
          </button>
        </div>
      </main>
    )
  }

  const { title, Component } = STEPS[stepIndex]
  const submitting = status.kind === 'submitting'

  return (
    <main className="page">
      <div className="card">
        <header className="card-header">
          <p className="eyebrow">Careers · Job application</p>
          <h1>Apply for a position</h1>
        </header>

        <nav aria-label="Application progress">
          <ol className="stepper">
            {STEPS.map((step, index) => (
              <li
                key={step.title}
                className={
                  index === stepIndex
                    ? 'is-current'
                    : index < stepIndex
                      ? 'is-done'
                      : undefined
                }
                aria-current={index === stepIndex ? 'step' : undefined}
              >
                <span className="stepper-dot" aria-hidden="true">
                  {index < stepIndex ? '✓' : index + 1}
                </span>
                <span className="stepper-label">{step.title}</span>
              </li>
            ))}
          </ol>
        </nav>

        {status.kind === 'validation' && (
          <div role="alert" className="banner banner-warning">
            The server could not accept {status.count} field
            {status.count === 1 ? '' : 's'}. Please correct{' '}
            {status.count === 1 ? 'it' : 'them'} and submit again.
          </div>
        )}
        {status.kind === 'error' && (
          <div role="alert" className="banner banner-error">
            <strong>We could not submit your application.</strong>{' '}
            {status.message} Your answers are saved - please try again.
          </div>
        )}

        <FormProvider {...methods}>
          <form onSubmit={onSubmit} noValidate>
            <h2 ref={headingRef} tabIndex={-1} className="step-title">
              Step {stepIndex + 1} of {STEPS.length}: {title}
            </h2>

            <Component />

            <div className="actions">
              {stepIndex > 0 && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={goBack}
                  disabled={submitting}
                >
                  Back
                </button>
              )}
              {stepIndex < LAST_STEP ? (
                <button key="next" type="submit" className="btn btn-primary">
                  Next
                </button>
              ) : (
                <button
                  key="submit"
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                  aria-busy={submitting}
                >
                  {submitting
                    ? 'Submitting...'
                    : status.kind === 'error'
                      ? 'Try again'
                      : 'Submit application'}
                </button>
              )}
            </div>
          </form>
        </FormProvider>
      </div>
    </main>
  )
}