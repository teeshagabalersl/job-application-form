import FormInput from '../components/fields/FormInput'

export default function PersonalStep() {
  return (
    <>
      <FormInput
        name="personal.fullName"
        label="Full name"
        autoComplete="name"
      />
      <FormInput
        name="personal.email"
        label="Email"
        type="email"
        autoComplete="email"
      />
      <FormInput
        name="personal.phone"
        label="Phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        hint="10-digit mobile number"
      />
      <FormInput
        name="personal.dateOfBirth"
        label="Date of birth"
        type="date"
        autoComplete="bday"
      />
      <FormInput
        name="personal.city"
        label="Current city"
        autoComplete="address-level2"
      />
    </>
  )
}