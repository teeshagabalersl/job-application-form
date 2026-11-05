import type { ReactNode } from 'react'
import { useFormContext } from 'react-hook-form'
import type { ApplicationFormValues } from '../schemas/applicationSchema'

const formatDate = (iso: string) =>
  iso
    ? new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '-'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="review-section">
      <h3>{title}</h3>
      <dl>{children}</dl>
    </section>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="review-row">
      <dt>{label}</dt>
      <dd>{value || '-'}</dd>
    </div>
  )
}

// Read-only. Values are read once from the single form instance; nothing is
// copied into other state.
export default function ReviewStep() {
  const { getValues } = useFormContext<ApplicationFormValues>()
  const { personal, education, experience, application } = getValues()

  return (
    <>
      <Section title="Personal details">
        <Row label="Full name" value={personal.fullName} />
        <Row label="Email" value={personal.email} />
        <Row label="Phone" value={personal.phone} />
        <Row label="Date of birth" value={formatDate(personal.dateOfBirth)} />
        <Row label="Current city" value={personal.city} />
      </Section>

      <Section title="Education">
        {education.qualifications.map((q, i) => (
          <Row
            key={i}
            label={`Qualification ${i + 1}`}
            value={`${q.degree}, ${q.institution} (${q.yearOfPassing}) - ${q.percentage}%`}
          />
        ))}
      </Section>

      <Section title="Experience">
        {experience.candidateType === 'experienced' ? (
          <>
            <Row label="Candidate type" value="Experienced" />
            <Row
              label="Total experience"
              value={`${experience.totalExperience} years`}
            />
            <Row label="Notice period" value={experience.noticePeriod} />
            {experience.companies.map((c, i) => (
              <Row
                key={i}
                label={`Company ${i + 1}`}
                value={`${c.role} at ${c.companyName} (${formatDate(c.from)} to ${formatDate(c.to)})`}
              />
            ))}
          </>
        ) : (
          <>
            <Row label="Candidate type" value="Fresher" />
            <Row
              label="Available from"
              value={formatDate(experience.availability)}
            />
          </>
        )}
      </Section>

      <Section title="Application details">
        <Row label="Position" value={application.position} />
        <Row
          label="Expected joining"
          value={formatDate(application.expectedJoiningDate)}
        />
        <Row label="Portfolio" value={application.portfolioUrl} />
        <Row label="Cover note" value={application.coverNote} />
        <Row
          label="Terms accepted"
          value={application.acceptTerms ? 'Yes' : 'No'}
        />
      </Section>
    </>
  )
}