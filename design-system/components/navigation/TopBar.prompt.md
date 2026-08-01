The screen header — progress label / exit affordance on question screens, or a simple title bar elsewhere. Left/right slots stay low visual weight (per the Question Experience spec: exit, bookmark, report never compete with the question itself).

```jsx
<TopBar title="Question 4 of 12" left={<IconButton>...</IconButton>} right={<IconButton>...</IconButton>} />
```
