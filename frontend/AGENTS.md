# Frontend

React SPA built with Vite. UI is provided by [Mantine](https://mantine.dev).

## Commands

- `pnpm run dev` — start the Vite dev server
- `pnpm run build` — typecheck (`tsc -b`) then production build
- `pnpm run preview` — preview the production build
- `pnpm run lint` — run oxlint

Always run `pnpm run lint` and `pnpm run build` (which includes the typecheck)
before finishing a change. Use `pnpm` as package manager.

## Conventions

### Components must be functions, never classes

Write React components as **function components only**. Do not use class
components (`class X extends Component` / `React.Component`).

Use the function declaration form:

```tsx
// Good
function Button(props: ButtonProps) {
  return <button {...props} />;
}
```

Arrow-function form is also acceptable for small components:

```tsx
const Button = (props: ButtonProps) => <button {...props} />;
```

State and lifecycle behavior are handled with Hooks (`useState`, `useEffect`,
etc.) — never with class lifecycle methods.

### Other

- TypeScript everywhere; no `any` without justification.
- Use Mantine components and tokens instead of hand-rolled styling where a
  suitable component exists.
