The persistent bottom tab bar — max 5 items (Home, Practice, CBT, Review, Insights per the product's own 5-item ceiling; Challenges/Learn/Profile are reachable from Home instead).

```jsx
<BottomNav items={[{key:'home',label:'Home',icon:<HomeIcon/>}, ...]} active="home" onChange={setTab} />
```
