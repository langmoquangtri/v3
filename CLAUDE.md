# CMS Project Context

## Current Goal

Maintain and extend this CMS safely.

Known repository areas include:

- `firecms-admin/`
- `r2-upload-worker/`
- `firestore.rules`

The current direction is to complete the CMS and then build the frontend.

Do not infer architecture from names alone. Inspect actual code, package manifests, entry points, configuration, and data flow before making architectural claims.

## Project Rules

- Preserve existing working behavior.
- Do not modify unrelated functionality.
- Do not refactor unrelated code.
- Do not replace working architecture merely because another approach seems cleaner.
- Prefer minimal, reversible changes.
- Do not add dependencies unless necessary.
- Match the existing code style and project structure.

## Before Non-Trivial Changes

1. Inspect relevant files.
2. Understand current behavior.
3. Identify the exact change surface.
4. State a brief plan.
5. Define a verifiable success condition.
6. Make the smallest necessary change.
7. Verify the result.

## Debugging

For bugs:

1. Reproduce the failure or gather concrete evidence.
2. Trace the relevant execution path.
3. Inspect state flow, async behavior, listeners, requests, responses, and configuration as relevant.
4. Identify root cause before editing.
5. Apply the smallest safe fix.
6. Verify the original failure no longer occurs.

Do not stack speculative fixes.

If a previous fix failed, reassess the diagnosis before making additional changes.

## Sensitive Areas

Treat these as high-risk:

- Firebase Authentication
- Firestore data model
- Firestore security rules
- Cloudflare R2
- Worker configuration
- environment variables
- API credentials
- deployment configuration

Before modifying sensitive areas:

1. inspect current behavior
2. explain the impact
3. make the smallest change
4. verify

## Security

- Never expose or print full secrets.
- Never commit API keys, tokens, passwords, cookies, or credentials.
- Do not hardcode secrets.
- Do not weaken Firestore rules merely to make an error disappear.
- Do not make storage or database access public as a debugging shortcut.

## Commands

Do not invent build, test, or deploy commands.

Discover commands from:

- `package.json`
- workspace configuration
- README files
- existing scripts
- deployment configuration

Use the narrowest relevant verification command.

## Git Discipline

Before meaningful changes:

- inspect `git status`
- preserve unrelated user modifications
- inspect relevant existing diff when necessary

Do not commit, push, merge, or deploy unless explicitly requested.

After changes:

- summarize files changed
- state verification performed
- state remaining uncertainty

## Definition of Done

A task is complete only when:

- requested behavior is implemented
- unrelated behavior is preserved
- relevant verification has been attempted
- failures or uncertainty are reported honestly

Distinguish clearly between:

- verified working
- logically expected
- not yet tested

# Global Engineering Rules
> These rules are stable across tasks and should not be repeated in every task brief.

---

## 1. Operating Mode

Work as a cautious senior engineer.

Before changing code:

1. Read the repository instructions and relevant local skills.
2. Inspect the actual implementation instead of relying on assumptions.
3. Identify the smallest safe change.
4. Preserve existing architecture, conventions, and public behavior unless the task explicitly requires otherwise.
5. State important assumptions and tradeoffs briefly.
6. For multi-step work, provide a short plan and then execute it.

Do not stop for confirmation unless there is a genuine blocker, destructive ambiguity, or a decision that materially changes product behavior.

---

## 2. Anti-Loop / Deadlock Protocol

### Mandatory rule

If you attempt to fix the same bug, compile error, type error, dependency conflict, or runtime failure **3 times** and it still fails:

**STOP IMMEDIATELY.**

Do not continue guessing, cycling through random changes, or repeatedly reinstalling dependencies.

Report:

1. the exact error message
2. the exact command that failed
3. the files changed
4. each attempted fix
5. why each attempt failed
6. the most likely remaining root causes
7. the smallest human decision or missing information needed to continue

Then wait for human intervention.

### Attempt counting

An attempt counts when you make a meaningful code/config/dependency change intended to fix the same underlying failure and then re-run verification.

Do not evade this rule by renaming the same issue or making cosmetic variations of the same fix.

---

## 3. Repository Safety

Do not:

- rewrite the entire project unless explicitly requested
- replace the framework or major architecture without approval
- refactor unrelated code
- format the entire repository
- make speculative abstractions
- create duplicate systems or parallel collections for existing concepts
- delete existing production fields without a verified migration strategy
- edit generated build outputs directly
- change deployment configuration unless required by the task
- modify `.env` files unless genuinely necessary
- print secrets, tokens, keys, cookies, or credentials to terminal output
- commit secrets
- create fake success states or mock data to claim completion
- silently weaken authentication or authorization
- run destructive commands against production resources without explicit approval

Generated directories such as `build/`, `dist/`, coverage output, or cache folders must not be edited directly.

---

## 4. Surgical Change Policy

Prefer the simplest correct solution.

When modifying existing code:

- preserve existing naming and style
- change only files required for the task
- avoid unrelated renames
- avoid broad formatting changes
- avoid dependency additions unless clearly justified
- reuse existing utilities, hooks, adapters, schemas, and components where practical
- remove only dead code introduced by your own change
- maintain backward compatibility unless explicitly told otherwise

Before adding a new abstraction, verify that the repository does not already contain an equivalent one.

---

## 5. Data and Production Safety

Treat Firebase, Firestore, Cloudflare R2, external APIs, and other remote services as potentially production-connected.

### Test-data limit

When testing imports, uploads, writes, migrations, or remote persistence:

- use a maximum of **3 test records/files**
- do not generate large synthetic datasets
- do not run bulk tests that consume excessive Firebase, Firestore, Storage, R2, bandwidth, API, or compute quotas
- do not test with 100, 1,000, or more generated rows unless explicitly authorized
- prefer local parsing/unit validation before remote writes

### Cleanup rule

If you create test records or upload test files:

- clearly mark them as test data where possible
- remove them before reporting completion
- verify cleanup succeeded
- if cleanup cannot be safely performed, report the exact remaining test artifacts

Do not delete pre-existing user data as part of cleanup.

---

## 6. Database and Schema Rules

Before creating a collection, table, field group, or taxonomy:

1. search for an existing equivalent
2. inspect current readers and writers
3. inspect production compatibility
4. prefer extending the existing model

Do not create overlapping structures such as:

```text
categories
productCategories
product_categories
```

unless there is a verified architectural reason.

For schema changes:

- preserve old data
- use normalization/fallback layers when practical
- avoid destructive migrations
- document new fields and relations
- identify index implications
- identify security-rule implications

---

## 7. Firebase / Firestore Security Rules

Never solve a permission problem by broadly opening the database.

Forbidden unless explicitly authorized for an isolated local emulator:

```text
allow read, write: if true;
```

Preserve the current security model.

When changing rules:

- grant the minimum required access
- keep public reads limited to intentionally public data
- keep admin writes aligned with the existing authentication model
- verify affected paths
- do not weaken unrelated collections

---

## 8. External Service and Quota Safety

For Cloudflare R2, Firebase, third-party APIs, AI APIs, or other metered services:

- minimize test calls
- reuse existing test artifacts where safe
- do not repeatedly retry failing remote operations without diagnosis
- respect rate limits and quotas
- do not upload large files for routine verification
- do not create unnecessary duplicate objects
- avoid expensive full-dataset scans where a targeted query is sufficient

---

## 9. Dependency Policy

Before adding or upgrading a dependency:

1. inspect existing dependencies
2. check whether the capability already exists
3. prefer the smallest compatible solution
4. avoid unnecessary major-version upgrades
5. consider bundle size and runtime compatibility

Do not use repeated uninstall/reinstall cycles as a debugging strategy.

If a dependency conflict survives 3 meaningful fix attempts, follow the Anti-Loop Protocol.

---

## 10. Frontend and React Rules

For React/Vite code:

- avoid unnecessary state duplication
- avoid `useEffect` loops
- clean up listeners/subscriptions
- avoid querying on hover or every render
- avoid N+1 reads
- preserve mobile behavior
- preserve accessibility where practical
- do not introduce avoidable layout shift
- lazy-load heavy editors or media tooling when appropriate

Memoization is not a default solution; use it only when justified.

---

## 11. TypeScript Rules

Do not hide type failures with broad escape hatches.

Avoid:

```ts
any
// @ts-ignore
// @ts-nocheck
```

unless there is a documented, narrowly scoped reason.

Prefer:

- correct types
- type guards
- explicit adapters
- safe normalization layers

Do not change strictness settings merely to make errors disappear.

---

## 12. Security Rules for Rich Content and User Input

Treat rich text, HTML, URLs, embeds, CSV content, and uploaded files as untrusted input.

Required principles:

- sanitize HTML before rendering
- validate URLs
- restrict arbitrary iframe embeds
- whitelist trusted video providers where appropriate
- validate MIME types
- mitigate XSS
- account for CSV/spreadsheet formula injection
- do not use `dangerouslySetInnerHTML` without a verified sanitization path

---

## 13. Verification Strategy

Use a fast-to-slow verification order.

### First: targeted checks

Run the narrowest relevant checks first, for example:

- focused tests
- targeted TypeScript check
- package-level checks
- affected-module validation

### Second: standard type-checking

Before a full build, run standard type-checking when supported:

```bash
npx tsc --noEmit
```

or the repository's actual type-check script.

### Third: lint

Run:

```bash
npm run lint
```

only if the script exists.

Do not invent scripts.

### Final: full build

Run the full production build only as the final verification step for the affected package:

```bash
npm run build
```

Do not repeatedly run expensive full builds after every small edit.

If a full build fails, diagnose with lighter checks before retrying.

The Anti-Loop Protocol still applies: after 3 failed attempts on the same underlying issue, stop.

---

## 14. Truthful Completion Reporting

Never claim:

- "fixed"
- "tested"
- "build passed"
- "typecheck passed"
- "production verified"

unless that exact verification actually happened.

Final reports must distinguish between:

- statically verified
- locally built
- browser-tested
- emulator-tested
- remotely tested
- production-tested
- not tested due to missing credentials or environment access

If verification is incomplete, say so explicitly.

---

## 15. Final Change Report

For substantial tasks, report:

1. root cause
2. files changed
3. data-model changes
4. behavior implemented
5. verification commands actually run
6. exact remaining risks or blockers

Keep the report factual. Do not report guesses as confirmed findings.