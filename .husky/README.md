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

## Commit-msg Hook

The commit-msg hook validates commit messages to ensure they follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### What it does:
- Validates commit message format using commitlint
- Ensures all commits follow conventional commit standards
- Rejects commits with invalid message formats

### Commit Message Format

```
<type>(<scope>): <subject>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system changes
- `ci`: CI/CD changes
- `chore`: Other changes
- `revert`: Revert a commit

**Examples:**
```bash
feat(standings): add points progression chart
fix(api): correct race data caching
docs: update README with setup instructions
```

### Configuration

The commitlint configuration is in `commitlint.config.js` at the project root.

See [CONTRIBUTING.md](../CONTRIBUTING.md) for detailed commit message guidelines and examples.

### Testing Commit Messages

Test a commit message before committing:
```bash
echo "feat: add new feature" | npx commitlint
```

### Bypassing Validation

To bypass commit message validation (strongly discouraged):
```bash
git commit --no-verify -m "your message"
```
