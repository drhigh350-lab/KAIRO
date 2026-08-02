A labelled text field with an optional leading icon (email/lock glyph) — matches the Kairo login screen exactly (rounded field, thin border, Blue focus ring).

```jsx
<Input label="Email Address" placeholder="Enter your email" icon={<MailIcon />} />
```

Pass `error` to render a red border + inline error message beneath the field.
