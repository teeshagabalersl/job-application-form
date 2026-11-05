import { z } from 'zod'
import {
  COVER_NOTE_MAX_LENGTH,
  DEGREES,
  NOTICE_PERIODS,
  POSITIONS,
} from './options'
import {
  addDaysISO,
  ageOn,
  isHttpUrl,
  isValidISODate,
  todayISO,
  yearsBetween,
} from './helpers'

/* -------------------------------------------------------------------------- */
/* Reusable building blocks                                                   */
/* -------------------------------------------------------------------------- */

const text = (label: string, min = 2, max = 100) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .min(min, `${label} must be at least ${min} characters`)
    .max(max, `${label} must be at most ${max} characters`)

const isoDate = (label: string) =>
  z
    .string()
    .min(1, `${label} is required`)
    .refine(isValidISODate, `Enter a valid ${label.toLowerCase()}`)

const oneOf = (options: readonly string[], requiredMessage: string) =>
  z
    .string()
    .min(1, requiredMessage)
    .refine((v) => v === '' || options.includes(v), 'Choose a valid option')

// A date rule must stay silent when the value is not a real date yet, so the
// user sees one message at a time ("required" / "invalid" first).
const whenValidDate = (check: (value: string) => boolean) => (value: string) =>
  !isValidISODate(value) || check(value)

/* -------------------------------------------------------------------------- */
/* Step 1 - Personal details                                                  */
/* -------------------------------------------------------------------------- */

export const personalSchema = z.object({
  fullName: text('Full name', 2, 80).regex(
    /^\p{L}[\p{L} .'-]*$/u,
    'Use letters, spaces, hyphens and apostrophes only',
  ),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .max(254, 'Email is too long')
    .pipe(z.email('Enter a valid email address')),
  phone: z
    .string()
    .trim()
    .min(1, 'Phone number is required')
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  dateOfBirth: isoDate('Date of birth')
    // Depends on two things: the date of birth and today's date.
    .refine(
      whenValidDate((v) => ageOn(v, todayISO()) >= 18),
      'You must be at least 18 years old to apply',
    )
    .refine(
      whenValidDate((v) => ageOn(v, todayISO()) <= 70),
      'Please check your date of birth',
    ),
  city: text('Current city', 2, 60),
})

/* -------------------------------------------------------------------------- */
/* Step 2 - Education (repeating list)                                        */
/* -------------------------------------------------------------------------- */

const MIN_PASSING_YEAR = 1970
const MAX_PASSING_YEAR = new Date().getFullYear() + 4

export const qualificationSchema = z.object({
  degree: oneOf(DEGREES, 'Select a degree'),
  institution: text('Institution', 2, 120),
  yearOfPassing: z
    .string()
    .trim()
    .min(1, 'Year of passing is required')
    .regex(/^\d{4}$/, 'Enter a 4-digit year')
    .refine(
      (v) => Number(v) >= MIN_PASSING_YEAR && Number(v) <= MAX_PASSING_YEAR,
      `Year must be between ${MIN_PASSING_YEAR} and ${MAX_PASSING_YEAR}`,
    ),
  percentage: z
    .string()
    .trim()
    .min(1, 'Percentage is required')
    .regex(/^\d{1,3}(\.\d{1,2})?$/, 'Enter a number like 78 or 78.5')
    .refine((v) => Number(v) <= 100, 'Percentage cannot exceed 100'),
})

export const educationSchema = z.object({
  qualifications: z
    .array(qualificationSchema)
    .min(1, 'Add at least one qualification')
    .max(10, 'You can add up to 10 qualifications')
    // Multi-field rule: the same degree at the same institution twice.
    // The issue is attached to the duplicate row so the error shows there.
    .superRefine((rows, ctx) => {
      const seen = new Set<string>()
      rows.forEach((row, index) => {
        const key = `${row.degree}|${row.institution.trim().toLowerCase()}`
        if (seen.has(key)) {
          ctx.addIssue({
            code: 'custom',
            path: [index, 'institution'],
            message: 'This degree at this institution is already listed',
          })
        }
        seen.add(key)
      })
    }),
})

/* -------------------------------------------------------------------------- */
/* Step 3 - Experience (discriminated union)                                  */
/* -------------------------------------------------------------------------- */

export const companySchema = z
  .object({
    companyName: text('Company name', 2, 100),
    role: text('Role', 2, 80),
    from: isoDate('Start date').refine(
      whenValidDate((v) => v <= todayISO()),
      'Start date cannot be in the future',
    ),
    to: isoDate('End date').refine(
      whenValidDate((v) => v <= todayISO()),
      'End date cannot be in the future',
    ),
  })
  // Multi-field rule: "to" must be after "from".
  .refine(
    (c) => !isValidISODate(c.from) || !isValidISODate(c.to) || c.to > c.from,
    { path: ['to'], message: 'End date must be after the start date' },
  )

const fresherSchema = z.object({
  candidateType: z.literal('fresher'),
  availability: isoDate('Availability date').refine(
    whenValidDate((v) => v >= todayISO()),
    'Availability date cannot be in the past',
  ),
})

const experiencedSchema = z.object({
  candidateType: z.literal('experienced'),
  totalExperience: z
    .string()
    .trim()
    .min(1, 'Total experience is required')
    .regex(/^\d{1,2}(\.\d)?$/, 'Enter years like 3 or 3.5')
    .refine(
      (v) => Number(v) > 0 && Number(v) <= 45,
      'Total experience must be between 0.1 and 45 years',
    ),
  noticePeriod: oneOf(NOTICE_PERIODS, 'Select a notice period'),
  companies: z
    .array(companySchema)
    .min(1, 'Add at least one previous company')
    .max(10, 'You can add up to 10 companies'),
})

export const experienceSchema = z
  .discriminatedUnion('candidateType', [fresherSchema, experiencedSchema])
  // Multi-field rule: total experience cannot be shorter than the longest
  // single stint the candidate listed.
  .superRefine((value, ctx) => {
    if (value.candidateType !== 'experienced') return
    const longest = Math.max(
      ...value.companies.map((c) => yearsBetween(c.from, c.to)),
    )
    if (Number(value.totalExperience) + 0.5 < longest) {
      ctx.addIssue({
        code: 'custom',
        path: ['totalExperience'],
        message: `Total experience cannot be less than your longest stay (about ${longest.toFixed(1)} years)`,
      })
    }
  })

/* -------------------------------------------------------------------------- */
/* Step 4 - Application details                                               */
/* -------------------------------------------------------------------------- */

export const applicationDetailsSchema = z.object({
  position: oneOf(POSITIONS, 'Select the position you are applying for'),
  expectedJoiningDate: isoDate('Expected joining date')
    .refine(
      whenValidDate((v) => v > todayISO()),
      'Expected joining date must be in the future',
    )
    .refine(
      whenValidDate((v) => v <= addDaysISO(todayISO(), 365)),
      'Expected joining date must be within the next 12 months',
    ),
  portfolioUrl: z
    .string()
    .trim()
    .max(200, 'Portfolio link is too long')
    .refine(
      (v) => v === '' || isHttpUrl(v),
      'Enter a valid link starting with http:// or https://',
    ),
  coverNote: z
    .string()
    .trim()
    .max(
      COVER_NOTE_MAX_LENGTH,
      `Cover note must be ${COVER_NOTE_MAX_LENGTH} characters or fewer`,
    ),
  acceptTerms: z
    .boolean()
    .refine((v) => v, 'You must accept the terms to continue'),
})

/* -------------------------------------------------------------------------- */
/* The whole form                                                             */
/* -------------------------------------------------------------------------- */

// Each step is its own key. Rules that belong to a step live on that step's
// schema, so they run for that step even while later steps are still empty.
export const applicationSchema = z.object({
  personal: personalSchema,
  education: educationSchema,
  experience: experienceSchema,
  application: applicationDetailsSchema,
})

export const STEP_KEYS = [
  'personal',
  'education',
  'experience',
  'application',
] as const

/* All TypeScript types are inferred from the schemas. */
export type ApplicationFormValues = z.infer<typeof applicationSchema>
export type PersonalValues = z.infer<typeof personalSchema>
export type Qualification = z.infer<typeof qualificationSchema>
export type Company = z.infer<typeof companySchema>
export type ExperienceValues = z.infer<typeof experienceSchema>
export type CandidateType = ExperienceValues['candidateType']