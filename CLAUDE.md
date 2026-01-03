# Claude Code Rules

## Pre-Deploy Checklist

**ALWAYS run `npm run build` before committing/deploying.** This runs ESLint and TypeScript checks. The Vercel build will fail if there are any ESLint errors.

Common issues to watch for:
- Unused variables/imports (`@typescript-eslint/no-unused-vars`)
- Unescaped entities in JSX (use `&apos;` instead of `'`)
- Missing curly braces after `if` statements (`curly` rule)
- Missing useEffect dependencies (warnings are OK, errors are not)
