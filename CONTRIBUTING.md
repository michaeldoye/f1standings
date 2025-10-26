# Contributing to F1 Standings

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Commit Message Convention

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification. All commit messages are automatically validated using commitlint.

### Commit Message Format

Each commit message consists of a **header**, an optional **body**, and an optional **footer**:

```
<type>(<scope>): <subject>

<body>

<footer>
```

The **header** is mandatory and must conform to the format below.

#### Type

Must be one of the following:

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes that affect the build system or external dependencies (example scopes: npm, angular, firebase)
- **ci**: Changes to our CI configuration files and scripts (example scopes: GitHub Actions, karma)
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverts a previous commit

#### Scope (Optional)

The scope should be the name of the component or module affected:

- `standings`
- `chart`
- `api`
- `service-worker`
- `theme`
- etc.

#### Subject

The subject contains a succinct description of the change:

- Use the imperative, present tense: "change" not "changed" nor "changes"
- Don't capitalize the first letter
- No period (.) at the end

#### Body (Optional)

The body should include the motivation for the change and contrast this with previous behavior.

#### Footer (Optional)

The footer should contain any information about **Breaking Changes** and is also the place to reference GitHub issues that this commit closes.

**Breaking Changes** should start with the word `BREAKING CHANGE:` with a space or two newlines.

### Examples

#### Feat

```
feat(standings): add points progression chart

- Implements line chart showing driver points over season
- Includes projections for upcoming races
- Supports multi-driver comparison
```

#### Fix

```
fix(chart): correct race name labels on x-axis

Previously showing round numbers instead of race names.
Now displays full race names for better readability.
```

#### Docs

```
docs: update README with offline functionality

Add section explaining PWA capabilities and offline support.
```

#### Style

```
style: format code with prettier

Run prettier on all TypeScript and HTML files.
```

#### Refactor

```
refactor: move constants to global constants file

- Create app.constants.ts
- Move API URLs, F1 points, and other constants
- Update imports across components
```

#### Perf

```
perf(api): add caching for race data

Implement service worker caching with freshness strategy.
Reduces API calls and improves offline experience.
```

#### Test

```
test(standings): add tests for championship probability calculation

Add unit tests covering edge cases:
- No remaining races
- Equal points scenarios
- Sprint race calculations
```

#### Build

```
build(deps): update angular to v20.3.6

Update Angular and related packages to latest version.
```

#### CI

```
ci: add SonarCloud quality gate

Configure SonarCloud integration in GitHub Actions workflow.
```

#### Chore

```
chore(git): add pre-commit hook for prettier

Configure husky and lint-staged to format code before commits.
```

#### Revert

```
revert: feat(chart): add animations

This reverts commit abc123def456.
Animations causing performance issues on mobile devices.
```

### Breaking Changes

```
feat(api)!: change API response format

BREAKING CHANGE: The API now returns driver standings in a new format.
All components consuming the API must be updated.

Migration guide:
- Old: `response.data.standings`
- New: `response.standings`
```

## Commit Validation

Commits are validated using the `commit-msg` hook powered by commitlint. If your commit message doesn't follow the convention, the commit will be rejected with an error message explaining what's wrong.

### Testing Your Commit Message

You can test your commit message before committing:

```bash
echo "feat: add new feature" | npx commitlint
```

### Common Errors

#### ❌ Invalid type
```
added new feature
```
**Error**: `type must be one of [feat, fix, docs, ...]`

**Fix**: Add a valid type prefix:
```
feat: add new feature
```

#### ❌ Missing subject
```
feat:
```
**Error**: `subject may not be empty`

**Fix**: Add a subject after the colon:
```
feat: add new feature
```

#### ❌ Subject starts with uppercase
```
feat: Add new feature
```
**Error**: `subject must not be sentence-case`

**Fix**: Use lowercase:
```
feat: add new feature
```

#### ❌ Subject ends with period
```
feat: add new feature.
```
**Error**: `subject may not end with full stop`

**Fix**: Remove the period:
```
feat: add new feature
```

## Bypassing the Hook (Not Recommended)

If you absolutely need to bypass the commit-msg hook:

```bash
git commit --no-verify -m "your message"
```

**Note**: This is strongly discouraged as it breaks the project's commit convention.

## Pull Request Guidelines

When creating a pull request:

1. Ensure all commits follow the conventional commit format
2. Run tests: `npm test`
3. Run formatting: `npm run format`
4. Update documentation if needed
5. Add a clear description of what the PR does

## Development Workflow

1. Create a feature branch from `main`
2. Make your changes following the commit convention
3. Run tests and ensure they pass
4. Push your branch and create a pull request
5. Wait for CI checks to pass
6. Request review from maintainers

## Questions?

If you have questions about contributing, please open an issue or reach out to the maintainers.

Thank you for contributing to F1 Standings! 🏎️
