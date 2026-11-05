// Option lists shared by the schema (what is allowed) and the field
// components (what is rendered). One list, two consumers, no drift.

export const DEGREES = [
  'B.Tech / B.E.',
  'B.Sc',
  'BCA',
  'B.Com',
  'Diploma',
  'M.Tech / M.E.',
  'M.Sc',
  'MCA',
  'MBA',
  'Other',
] as const

export const NOTICE_PERIODS = [
  'Immediate',
  '15 days',
  '30 days',
  '60 days',
  '90 days',
] as const

export const POSITIONS = [
  'Frontend Engineer',
  'Backend Engineer',
  'Full-Stack Engineer',
  'QA Engineer',
  'DevOps Engineer',
  'Data Engineer',
] as const

export const CANDIDATE_TYPES = [
  { value: 'fresher', label: 'Fresher' },
  { value: 'experienced', label: 'Experienced' },
] as const

export const COVER_NOTE_MAX_LENGTH = 1000