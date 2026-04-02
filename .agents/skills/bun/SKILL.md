---
name: Bun
description: Use when building, running, testing, or bundling JavaScript/TypeScript applications. Reach for Bun when you need to execute scripts, manage packages, run tests, or bundle code for production. Bun is a drop-in replacement for Node.js with integrated package manager, test runner, and bundler.
metadata:
    mintlify-proj: bun
    version: "1.0"
---

# Bun Skill Reference

## Product summary

Bun is an all-in-one JavaScript/TypeScript toolkit that ships as a single binary. It includes a fast runtime (drop-in Node.js replacement), package manager, test runner, and bundler. The runtime uses JavaScriptCore (Apple's engine) and is written in Zig, delivering 4x faster startup than Node.js. Key files: `bunfig.toml` (configuration), `package.json` (scripts and dependencies), `bun.lock` (lockfile). Primary CLI commands: `bun run`, `bun install`, `bun test`, `bun build`. See https://bun.com/docs for complete documentation.

## When to use

- **Running scripts**: Execute `.ts`, `.tsx`, `.js`, `.jsx` files directly without compilation step
- **Package management**: Install, add, remove, or update npm packages faster than npm/yarn
- **Testing**: Write and run Jest-compatible tests with TypeScript support, snapshots, and watch mode
- **Bundling**: Bundle JavaScript/TypeScript for browsers or servers with code splitting and plugins
- **HTTP servers**: Build servers with `Bun.serve()` for fast request handling
- **File operations**: Read/write files with optimized APIs (`Bun.file()`, `Bun.write()`)
- **Monorepos**: Manage workspaces with shared dependencies and workspace linking
- **Migrating from Node.js**: Drop-in replacement for existing Node.js projects with minimal changes

## Quick reference

### Core commands

| Command | Purpose |
|---------|---------|
| `bun run <file>` | Execute a TypeScript/JavaScript file |
| `bun run <script>` | Run a package.json script |
| `bun install` | Install dependencies (30x faster than npm) |
| `bun add <pkg>` | Add a package to dependencies |
| `bun remove <pkg>` | Remove a package |
| `bun test` | Run tests matching `*.test.ts`, `*_test.ts`, `*.spec.ts`, `*_spec.ts` |
| `bun build <entry>` | Bundle code for production |
| `bunx <pkg>` | Execute a package without installing |

### Configuration file (bunfig.toml)

```toml
# Runtime settings
preload = ["./setup.ts"]
jsx = "react"
logLevel = "debug"

# Package manager
[install]
optional = true
dev = true
peer = true
linker = "hoisted"  # or "isolated"

# Test runner
[test]
root = "."
coverage = false
coverageThreshold = 0.9

# Script runner
[run]
shell = "system"  # or "bun"
bun = true        # alias node to bun
silent = false
```

### File I/O essentials

```ts
// Read file
const file = Bun.file("path/to/file.txt");
const text = await file.text();
const bytes = await file.bytes();

// Write file
await Bun.write("path/to/file.txt", "content");

// Incremental write
const writer = Bun.file("output.txt").writer();
writer.write("chunk 1\n");
writer.write("chunk 2\n");
writer.end();
```

### HTTP server basics

```ts
Bun.serve({
  port: 3000,
  routes: {
    "/": () => new Response("Home"),
    "/api": () => Response.json({ data: [] }),
    "/users/:id": (req) => new Response(`User ${req.params.id}`),
  },
  fetch(req) {
    return new Response("Not found", { status: 404 });
  },
});
```

### Package manager flags

| Flag | Purpose |
|------|---------|
| `--save-dev` / `-d` | Add as dev dependency |
| `--optional` | Add as optional dependency |
| `--exact` | Use exact version (not caret range) |
| `--production` | Skip dev dependencies on install |
| `--frozen-lockfile` | Fail if lockfile needs updating |
| `--global` | Install globally |

### Test runner flags

| Flag | Purpose |
|------|---------|
| `--watch` | Re-run on file changes |
| `--concurrent` | Run tests in parallel |
| `--timeout <ms>` | Per-test timeout (default 5000) |
| `--bail` | Stop after first failure |
| `--retry <n>` | Retry failed tests |
| `--coverage` | Generate coverage report |
| `--update-snapshots` | Update snapshot files |

### Bundler options

```ts
await Bun.build({
  entrypoints: ["./index.tsx"],
  outdir: "./dist",
  target: "browser",        // "browser" | "bun" | "node"
  format: "esm",            // "esm" | "cjs" | "iife"
  splitting: true,          // Enable code splitting
  minify: true,             // Minify output
  sourcemap: "linked",      // "none" | "linked" | "inline" | "external"
  external: ["react"],      // Don't bundle these
  define: { VERSION: '"1.0"' },
});
```

## Decision guidance

### When to use `bun run` vs `bun`

| Scenario | Use |
|----------|-----|
| Running a package.json script | `bun run <script>` |
| Running a file directly | `bun <file>` or `bun run <file>` |
| Ambiguous name (file or script) | `bun run` (prioritizes scripts) |
| Running system commands | `bun run` (in scripts) |

### When to use `hoisted` vs `isolated` linker

| Scenario | Use |
|----------|-----|
| Single-package project | `hoisted` (default) |
| Monorepo with workspaces | `isolated` (default for new workspaces) |
| Need flat node_modules | `hoisted` |
| Strict dependency isolation | `isolated` |

### When to bundle vs run directly

| Scenario | Use |
|----------|-----|
| Development/testing | Run directly with `bun run` |
| Production server | Bundle with `bun build --target bun` |
| Browser/client code | Bundle with `bun build --target browser` |
| Single executable | Bundle with `bun build --compile` |
| Reduce startup time | Bundle with `--bytecode` |

### When to use test.serial vs test.concurrent

| Scenario | Use |
|----------|-----|
| Tests share state | `test.serial()` |
| Independent async tests | `test.concurrent()` |
| Database operations | `test.serial()` |
| API calls | `test.concurrent()` |

## Workflow

### 1. Initialize a new project
```bash
bun init my-app
cd my-app
```

### 2. Install dependencies
```bash
bun install
# or add specific packages
bun add react react-dom
bun add -d typescript @types/react
```

### 3. Create and run scripts
Edit `package.json`:
```json
{
  "scripts": {
    "dev": "bun run src/index.ts",
    "build": "bun build src/index.ts --outdir dist",
    "test": "bun test"
  }
}
```

Run with:
```bash
bun run dev
bun run build
bun test
```

### 4. Build for production
```bash
# Browser bundle
bun build src/index.tsx --outdir dist --target browser

# Server bundle
bun build src/server.ts --outdir dist --target bun

# Single executable
bun build src/cli.ts --outfile mycli --compile
```

### 5. Write and run tests
Create `math.test.ts`:
```ts
import { test, expect } from "bun:test";

test("addition", () => {
  expect(2 + 2).toBe(4);
});
```

Run tests:
```bash
bun test
bun test --watch
bun test --coverage
```

### 6. Configure with bunfig.toml
Create `bunfig.toml` in project root:
```toml
[install]
linker = "hoisted"

[test]
coverage = true
coverageThreshold = 0.8

[run]
bun = true
```

## Common gotchas

- **Shebang handling**: Scripts with `#!/usr/bin/env node` run with Node.js by default. Use `bun run --bun <script>` to force Bun execution.
- **TypeScript config**: Add `@types/bun` to dev dependencies and configure `tsconfig.json` with `"lib": ["ESNext"]` and `"module": "Preserve"` for proper type support.
- **Auto-install disabled in CI**: Set `[install] auto = "disable"` in bunfig.toml for CI environments to avoid unexpected package installations.
- **Lockfile format**: Bun generates binary `bun.lockb` by default (faster). Use `[install] saveTextLockfile = true` for text-based lockfile.
- **Module resolution**: Bun defaults to ESM. CommonJS modules work but ESM is recommended. Use `"type": "module"` in package.json.
- **Environment variables**: Bun auto-loads `.env`, `.env.local`, and `.env.[NODE_ENV]` files. Disable with `[env] file = false` in bunfig.toml.
- **Test file discovery**: Only files matching `*.test.ts`, `*_test.ts`, `*.spec.ts`, `*_spec.ts` are discovered. Nested test files in subdirectories are found.
- **Workspace linking**: Use `"workspace:*"` in dependencies to link workspace packages. Run `bun install` from root to link all workspaces.
- **Bundler not for type-checking**: `bun build` does not generate `.d.ts` files. Use `tsc` separately for type declarations.
- **External imports in bundles**: Mark packages as external with `external: ["pkg"]` to avoid bundling them. They must be available at runtime.

## Verification checklist

Before submitting work with Bun:

- [ ] All tests pass: `bun test`
- [ ] No TypeScript errors: Check editor or run `tsc --noEmit`
- [ ] Dependencies installed: `bun install` completes without errors
- [ ] Scripts run correctly: Test each script in `package.json` with `bun run <script>`
- [ ] Build succeeds: `bun build` completes without errors
- [ ] No console errors: Check runtime output for warnings or errors
- [ ] Lockfile committed: `bun.lock` or `bun.lockb` is in version control
- [ ] bunfig.toml valid: TOML syntax is correct (use online validator if unsure)
- [ ] Environment variables set: Required `.env` files exist or CI/CD provides them
- [ ] Coverage threshold met: If configured, `bun test --coverage` meets threshold

## Resources

- **Comprehensive navigation**: https://bun.com/docs/llms.txt — Full page-by-page listing for agent navigation
- **Runtime API**: https://bun.com/docs/runtime — Execute files, manage environment, file I/O, HTTP servers
- **Package Manager**: https://bun.com/docs/pm/cli/install — Install, add, remove, audit packages
- **Test Runner**: https://bun.com/docs/test — Write tests, configure, run with coverage
- **Bundler**: https://bun.com/docs/bundler — Bundle code, configure targets, plugins, optimization

---

> For additional documentation and navigation, see: https://bun.com/docs/llms.txt