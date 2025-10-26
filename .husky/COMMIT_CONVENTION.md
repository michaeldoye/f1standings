# Conventional Commits Quick Reference

## Format

```
<type>(<scope>): <subject>
```

## Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(chart): add multi-driver comparison` |
| `fix` | Bug fix | `fix(api): correct caching timeout` |
| `docs` | Documentation | `docs: update README with examples` |
| `style` | Formatting | `style: run prettier on all files` |
| `refactor` | Code refactor | `refactor: extract constants to separate file` |
| `perf` | Performance | `perf(chart): optimize rendering` |
| `test` | Tests | `test(standings): add probability tests` |
| `build` | Build system | `build(deps): update angular to v20` |
| `ci` | CI/CD | `ci: add code coverage reporting` |
| `chore` | Maintenance | `chore: configure git hooks` |
| `revert` | Revert commit | `revert: feat(chart): add animations` |

## Rules

✅ **DO:**
- Use lowercase for type and subject
- Use imperative mood ("add" not "added")
- Keep subject under 72 characters
- Add scope when relevant
- Be descriptive but concise

❌ **DON'T:**
- Start subject with uppercase
- End subject with period
- Use past tense
- Leave subject empty
- Use invalid types

## Examples

### Good
```bash
feat(standings): add championship probability calculation
fix(chart): correct race name labels
docs: add offline functionality guide
style: format TypeScript files with prettier
refactor(api): move constants to global file
perf(sw): implement aggressive caching strategy
test(chart): add unit tests for projections
build: update dependencies to latest versions
ci: add GitHub Actions workflow
chore(git): configure commitlint
```

### Bad
```bash
Added new feature                    # Missing type
feat Add new feature                 # Missing colon
feat: Add new feature                # Uppercase subject
feat: add new feature.               # Period at end
feature: add new feature             # Invalid type
feat:                                # Empty subject
```

## Scopes (Optional)

Common scopes in this project:
- `standings` - Standings component
- `chart` - Chart component
- `api` - API services
- `sw` - Service worker
- `theme` - Theme/styling
- `git` - Git configuration
- `deps` - Dependencies

## Testing

Test your message before committing:
```bash
echo "feat: add new feature" | npx commitlint
```

## Need Help?

See [CONTRIBUTING.md](../CONTRIBUTING.md) for detailed guidelines and more examples.
