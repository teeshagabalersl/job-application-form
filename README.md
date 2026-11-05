# Job Application Form

A five-step job application wizard built with React, TypeScript, React Hook Form and Zod.

## How to run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # strict type-check + production build
```

Dependencies added on top of the Vite React-TS template: `react-hook-form`, `zod`, `@hookform/resolvers`.
TypeScript runs with `"strict": true` (see `tsconfig.app.json`).

### Trying the server outcomes

The mock API (`src/api/submitApplication.ts`) waits 1.5 s, then decides from the submitted email:

| Email entered | Outcome |
| --- | --- |
| `taken@example.com` | Field-level validation failure (email and phone rejected by the server) |
| `error@example.com` | Server error (500) |
| anything else | Success, with a reference number |

- **Validation failure** - messages are attached to the exact fields with `setError`, the wizard jumps back to the step that owns the first one, and focus lands on that field. A `role="alert"` banner says how many fields were rejected.
- **Server error** - no field is blamed. A `role="alert"` banner appears on the Review step, all answers stay intact, and the button becomes "Try again".
- **Success** - a confirmation screen with the reference number and a "Start a new application" button that resets the form.

## Schema organization

All validation lives in `src/schemas/`:

| File | Purpose |
| --- | --- |
| `applicationSchema.ts` | Every Zod schema (one per step), combined into `applicationSchema`, plus all inferred types |
| `options.ts` | Option lists (degrees, notice periods, positions, candidate types) shared by the schema and the select / radio components |
| `helpers.ts` | Pure date and URL helpers used by the rules |
| `defaultValues.ts` | Starting values and empty row templates |

How it fits together:

- Each step has its own schema: `personalSchema`, `educationSchema`, `experienceSchema` and `applicationDetailsSchema`.
- `applicationSchema` nests them under `personal`, `education`, `experience` and `application`.
- Rules for a step sit on that step's schema. A Zod refinement is skipped when the object it sits on is already invalid, so a cross-field rule on a top-level schema would go silent whenever a later, still-empty step had errors.
- All types come from `z.infer`, so nothing is typed by hand.
- Fresher vs Experienced is a `z.discriminatedUnion('candidateType', ...)`.

### Validation rules

Single-field: required fields, name characters, email format, 10-digit mobile number, 4-digit year in a sensible range, percentage 0-100, URL must be http(s), cover note length, terms accepted.

Rules that depend on more than one value:

1. Age must be 18+ (date of birth against today), with a sanity upper bound of 70.
2. A previous company's "to" date must be after its "from" date (error shown on that row's "to" field).
3. Expected joining date must be in the future and within 12 months.
4. The same degree at the same institution cannot be listed twice (error shown on the duplicate row).
5. Total experience cannot be shorter than the longest single stay listed.

## Validation mode

`mode: 'onTouched'` with `reValidateMode: 'onChange'`.

- A field is validated the first time the user leaves it, so nobody sees an error while still typing the first character.
- After that it re-validates on every change, so the error clears the moment the value becomes valid.
- "Next" calls `trigger()` for the current step and moves focus to the first invalid field.
- `onChange` mode was rejected as too noisy; `onSubmit` because a multi-step form should not wait until the last page to show a mistake on page one.

## Where form state lives

- One `useForm` in `App.tsx`, shared through `FormProvider`, with the Zod schema attached via `zodResolver`.
- Steps and fields read the form through `useFormContext`. There is no Redux, Zustand or Context copy of the values.
- Only the current step is mounted. Values live in the form instance (`shouldUnregister` stays at its default `false`), so going Back or forward shows exactly what was typed.
- `trigger(stepKey)` validates one step's slice (`'personal'`, `'education'`, ...).
- The only wizard-level `useState` is the step index and submit status; neither holds form data.
- Both union branches' keys exist in the defaults, so switching Fresher / Experienced never loses what was typed on the other side. Zod strips the inactive branch when it parses, so it never reaches the API.

## Avoiding unnecessary re-renders

1. **Narrow watching.** The Fresher / Experienced choice is read with `useWatch` inside one small `ConditionalFields` component. Switching re-renders that component only. `watch()` is not used anywhere.
2. **Isolated counter.** The cover-note character count is its own component using `useWatch` on one field, so typing re-renders the counter, not the step.
3. **Per-field error subscriptions.** Field components read errors with `useFormState({ name })`, so an error on one field does not re-render the others. Field components and repeating rows are wrapped in `memo`, and rows are keyed on `field.id`, so editing or removing one row leaves its siblings alone.
4. **No form state in `App`.** `App` never reads `formState`, so keystrokes do not re-render the wizard shell.

## Accessibility

- Every control has a linked `<label htmlFor>`; radio groups use `fieldset` / `legend`.
- Invalid controls get `aria-invalid="true"`; errors and hints are linked with `aria-describedby`; error text is `role="alert"`.
- On a failed "Next" or submit, focus moves to the first invalid field. On a successful step change, focus moves to the step heading. After a server validation failure, focus goes to the rejected field.
- The stepper is an ordered list with `aria-current="step"`.
- Fully keyboard-operable: Tab / Shift+Tab, Enter acts as "Next" (or Submit on the last step), Space for checkboxes, arrow keys for radios.

## Left incomplete / known limits

- The "taken" and "error" emails are demo triggers for the mock API; a real API would decide this itself.
- Date rules use the browser's local date, not the server's.
- The Review step is read-only; to change something the user goes Back (no per-section "Edit" link).
- No automated tests are included.
