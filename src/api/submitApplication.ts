import type { FieldPath } from 'react-hook-form'
import type { ApplicationFormValues } from '../schemas/applicationSchema'

export interface ServerFieldError {
  path: FieldPath<ApplicationFormValues>
  message: string
}

/** The server rejected specific fields (HTTP 422). */
export class ServerValidationError extends Error {
  readonly fieldErrors: ServerFieldError[]

  constructor(fieldErrors: ServerFieldError[]) {
    super('The server rejected some of the submitted fields.')
    this.name = 'ServerValidationError'
    this.fieldErrors = fieldErrors
  }
}

/** Something broke on the server (HTTP 500). Nothing is wrong with the data. */
export class ServerError extends Error {
  constructor(message = 'Internal server error') {
    super(message)
    this.name = 'ServerError'
  }
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Mock API. Pauses for 1.5s, then picks an outcome from the submitted data so
 * every case can be reproduced on demand:
 *
 *   email "taken@example.com"  -> field-level validation failure (422)
 *   email "error@example.com"  -> server error (500)
 *   anything else              -> success
 */
export async function submitApplication(
  data: ApplicationFormValues,
): Promise<{ referenceId: string }> {
  await wait(1500)

  const email = data.personal.email.toLowerCase()

  if (email === 'taken@example.com') {
    throw new ServerValidationError([
      {
        path: 'personal.email',
        message: 'An application with this email address already exists.',
      },
      {
        path: 'personal.phone',
        message: 'This phone number is linked to another application.',
      },
    ])
  }

  if (email === 'error@example.com') {
    throw new ServerError('The careers portal is having trouble right now.')
  }

  return { referenceId: `APP-${Date.now().toString(36).toUpperCase()}` }
}