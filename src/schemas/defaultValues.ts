import type { DefaultValues } from 'react-hook-form'
import type {
  ApplicationFormValues,
  Company,
  Qualification,
} from './applicationSchema'

export const emptyQualification: Qualification = {
  degree: '',
  institution: '',
  yearOfPassing: '',
  percentage: '',
}

export const emptyCompany: Company = {
  companyName: '',
  role: '',
  from: '',
  to: '',
}

// Every key of both union branches is present from the start, so switching
// between Fresher and Experienced never leaves an input uncontrolled. The
// schema strips whichever branch's keys are not relevant when it parses.
const experienceDefaults = {
  candidateType: 'fresher' as const,
  availability: '',
  totalExperience: '',
  noticePeriod: '',
  companies: [] as Company[],
}

export const defaultValues: DefaultValues<ApplicationFormValues> = {
  personal: {
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    city: '',
  },
  education: { qualifications: [emptyQualification] },
  experience: experienceDefaults,
  application: {
    position: '',
    expectedJoiningDate: '',
    portfolioUrl: '',
    coverNote: '',
    acceptTerms: false,
  },
}