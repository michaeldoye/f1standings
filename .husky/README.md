# Git Hooks with Husky

This directory contains git hooks managed by [Husky](https://typicode.github.io/husky/).

## Pre-commit Hook

The pre-commit hook automatically runs Prettier formatting on all staged files before committing.

### What it does:
- Runs `lint-staged` which formats all staged `.ts`, `.html`, `.scss`, `.css`, and `.json` files
- Only formats files that are staged for commit
- Automatically adds the formatted files back to the staging area

### Configuration

The lint-staged configuration is in `package.json`:

```json
"lint-staged": {
  "src/**/*.{ts,html,scss,css,json}": [
    "prettier --write"
  ]
}
```

### Manual Formatting

To manually format all files in the project:
```bash
npm run format
```

To check formatting without making changes:
```bash
npm run format:check
```

### Bypassing the Hook

If you need to bypass the pre-commit hook (not recommended):
```bash
git commit --no-verify -m "your message"
```
