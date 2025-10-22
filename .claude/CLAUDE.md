# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

F1 Standings is an Angular 20 application for displaying Formula 1 standings. The application uses:
- Angular 20.3 with standalone components (no NgModules)
- Angular Material for UI components
- Angular Service Worker for PWA functionality
- SCSS for styling
- Karma + Jasmine for testing

## Development Commands

### Development server
```bash
npm start
# or
ng serve
```
Runs on `http://localhost:4200/` with automatic reload.

### Build
```bash
npm run build
```
Production build outputs to `dist/` directory. Production builds include service worker for PWA functionality.

Development build with watch mode:
```bash
npm run watch
```

### Testing
```bash
npm test
# or
ng test
```
Runs unit tests with Karma + Jasmine test runner.

To run a single test file, use the `--include` flag:
```bash
ng test --include='**/component-name.spec.ts'
```

### Code generation
Generate components:
```bash
ng generate component component-name
```

Other schematics:
```bash
ng generate --help
```

## Project Structure

```
src/
├── app/
│   ├── features/           # Feature modules organized by domain
│   │   └── components/     # Feature-specific components
│   │       └── standings/  # Standings feature
│   ├── app.ts             # Root component
│   ├── app.config.ts      # Application configuration
│   └── app.routes.ts      # Route definitions
├── index.html
├── main.ts                # Application bootstrap
└── styles.scss            # Global styles
```

### Architectural Patterns

- **Component organization**: Components are organized under `src/app/features/components/` by feature area
- **Routing**: All routes defined in `src/app/app.routes.ts`
- **App configuration**: Centralized in `src/app/app.config.ts` with providers for routing, zone change detection, and service worker
- **PWA**: Configured with Angular Service Worker (ngsw-config.json)

## Angular Best Practices (Project-Specific)

### Components
- Always use standalone components (default in this project, DO NOT set `standalone: true`)
- Use `input()` and `output()` functions instead of decorators
- Use signals for state management with `signal()`, `computed()`
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in component decorator
- Prefer inline templates for small components
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- DO NOT use `ngClass` or `ngStyle`, use `class` and `style` bindings instead

### Services
- Use `providedIn: 'root'` for singleton services
- Use the `inject()` function instead of constructor injection

### Host Bindings
- DO NOT use `@HostBinding` and `@HostListener` decorators
- Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator

### TypeScript
- Use strict type checking (enabled in tsconfig.json)
- Avoid `any` type; use `unknown` when type is uncertain
- Prefer type inference when obvious

### Prettier Configuration
This project uses Prettier with:
- Print width: 100
- Single quotes: true
- Angular parser for HTML files

## Build Configuration

- **Production budgets**: Initial bundle max 1MB (warning at 500kB), component styles max 8kB (warning at 4kB)
- **Service Worker**: Enabled in production builds only
- **Style language**: SCSS (inline style language)
- **Component prefix**: `app`