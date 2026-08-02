A circular tap target for a single icon (bookmark, flag/report, exit, bell) — always meets the 48px minimum touch target regardless of visible icon size.

```jsx
<IconButton onClick={toggleBookmark}><BookmarkIcon /></IconButton>
```

`active` renders a soft blue-tinted background (e.g. a toggled bookmark); `variant="filled"` gives a solid Navy circle for a prominent icon-only action.
