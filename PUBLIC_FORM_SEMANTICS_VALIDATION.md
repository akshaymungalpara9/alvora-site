# Public form semantics validation

On 26 August 2026, the rendered North American production-brief form was inspected without submitting data. The `name`, `email`, `company`, and `country` controls each exposed a non-empty associated label through the browser’s `labels` collection.

The same inspection confirmed `autocomplete="name"`, `autocomplete="email"` with `inputmode="email"`, `autocomplete="organization"`, and `autocomplete="country"` respectively. No lead record or alert was created during this validation.

The rendered English production-brief form was also inspected. Its `name`, `email`, and `company` controls each exposed a non-empty associated label and the same `name`, `email`, and `organization` autocomplete semantics. No submission was made.
