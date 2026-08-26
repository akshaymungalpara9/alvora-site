# Public production-brief honeypot validation

On 26 August 2026, the rendered French public form was inspected without submitting data. The honeypot input existed in the form but was `1px × 1px`, `position: absolute`, clipped with `clip-path: inset(50%)`, overflow-hidden, marked `aria-hidden="true"`, and assigned `tabIndex=-1`.

The server workflow test verifies the more important guard: a filled honeypot is rejected before the database helper, alert sender, or alert-status helper is called. No lead record or outbound alert was created during validation.
