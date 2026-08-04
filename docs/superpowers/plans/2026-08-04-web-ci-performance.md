# Web CI Performance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Centralize Bun setup and make optional browser/security work selectable without duplicating dependency installation.

**Architecture:** Add a repository-local Bun composite action with deterministic dependency caching. Keep ordinary quality as one job because its steps share one install and workspace; gate only expensive optional steps with manual boolean inputs.

**Tech Stack:** GitHub Actions, Bun 1.3.14, TypeScript, Vitest, Playwright, npm-compatible lockfile hashing.

## Global Constraints

- Keep bun install --frozen-lockfile as the only dependency installation command.
- Do not run Chromium installation unless a browser test is selected.
- Keep real full-stack E2E manual-only and ref-pinned.
- Keep mock E2E available in the default quality path.
- Do not weaken typecheck, lint, unit, coverage, build, i18n, or formatting gates.
- Cache only immutable Bun package data keyed by all workspace lockfiles.

---

## Task 1: Add the reusable Bun setup action

**Files:**

- Create: .github/actions/setup-bun/action.yml
- Create: scripts/validate-ci-workflows.mjs

**Interfaces:**

- Provides Bun 1.3.14.
- Restores/saves ~/.bun/install/cache using bun.lock hashes.
- Runs bun install --frozen-lockfile in the caller's working directory.

- [x] Step 1: Write the failing setup contract.

Create scripts/validate-ci-workflows.mjs with this assertion:

    import { readFile } from 'node:fs/promises';

    const action = await readFile('.github/actions/setup-bun/action.yml', 'utf8');
    for (const fragment of [
      "bun-version: '1.3.14'",
      'actions/cache@v4',
      '~/.bun/install/cache',
      'bun install --frozen-lockfile',
    ]) {
      if (!action.includes(fragment)) {
        throw new Error(\`Missing setup fragment: \${fragment}\`);
      }
    }
    console.log('Bun setup contract passed.');

- [x] Step 2: Run the contract and verify it fails.

    bun run scripts/validate-ci-workflows.mjs

Expected: failure because the composite action does not exist.

- [x] Step 3: Implement the composite action.

Use this action shape:

    name: Set up Emme Bun workspace
    description: Install the pinned Bun runtime, restore package cache, and install locked dependencies.
    inputs:
      working-directory:
        description: Workspace directory used for dependency installation.
        required: false
        default: .
    runs:
      using: composite
      steps:
        - name: Set up Bun
          uses: oven-sh/setup-bun@v2
          with:
            bun-version: '1.3.14'
        - name: Cache Bun packages
          uses: actions/cache@v4
          with:
            path: ~/.bun/install/cache
            key: \${{ runner.os }}-bun-\${{ hashFiles('**/bun.lock') }}
            restore-keys: |
              \${{ runner.os }}-bun-
        - name: Install dependencies
          shell: bash
          working-directory: \${{ inputs.working-directory }}
          run: bun install --frozen-lockfile

- [x] Step 4: Run the contract and local install.

    bun run scripts/validate-ci-workflows.mjs
    bun install --frozen-lockfile

Expected: both commands pass.

- [x] Step 5: Commit.

    git add .github/actions/setup-bun/action.yml scripts/validate-ci-workflows.mjs
    git commit -m "ci(web): centralize Bun workspace setup"

## Task 2: Use the Bun action and add selectable frontend steps

**Files:**

- Modify: .github/workflows/ci-frontend.yml
- Modify: scripts/validate-ci-workflows.mjs

**Interfaces:**

- Manual boolean inputs run_mock_e2e and run_security default to true.
- Pull requests and main always run both steps.
- Manual runs may skip either optional family without skipping core quality gates.

- [x] Step 1: Extend the workflow assertions.

Require these fragments:

    run_mock_e2e:
    run_security:
    ./.github/actions/setup-bun
    github.event_name != 'workflow_dispatch' || inputs.run_mock_e2e == true
    github.event_name != 'workflow_dispatch' || inputs.run_security == true

- [x] Step 2: Run the validator and verify it fails.

    bun run scripts/validate-ci-workflows.mjs

Expected: failure because the workflow has no dispatch inputs and directly installs Bun.

- [x] Step 3: Implement the workflow changes.

Add:

    workflow_dispatch:
      inputs:
        run_mock_e2e:
          description: Run mock browser flows
          required: true
          default: true
          type: boolean
        run_security:
          description: Run the dependency vulnerability audit
          required: true
          default: true
          type: boolean

Replace direct Bun setup/install with:

    - name: Set up web workspace
      uses: ./.github/actions/setup-bun

Gate Chromium installation and mock E2E together:

    if: github.event_name != 'workflow_dispatch' || inputs.run_mock_e2e == true

Gate the audit with:

    if: github.event_name != 'workflow_dispatch' || inputs.run_security == true

- [x] Step 4: Run web quality and workflow validation.

    bun run scripts/validate-ci-workflows.mjs
    bun run quality

Expected: all commands pass.

- [x] Step 5: Commit.

    git add .github/workflows/ci-frontend.yml scripts/validate-ci-workflows.mjs
    git commit -m "ci(web): make frontend optional checks selectable"

## Task 3: Reuse setup in recording workflows

**Files:**

- Modify: .github/workflows/demo-recordings.yml
- Modify: .github/workflows/real-e2e-recordings.yml

**Interfaces:**

- Demo recordings use the local Bun setup action.
- Real E2E uses the local Bun setup action from emme-web and retains service Gradle setup only where the service build runs.
- Playwright installation remains limited to recording workflows.

- [x] Step 1: Replace duplicated Bun setup.

Replace the setup-bun plus install pair in both workflows with:

    - name: Set up web workspace
      uses: ./.github/actions/setup-bun

For real E2E, invoke the action with an input after both repositories are checked out:

    - name: Set up web workspace
      uses: ./.github/actions/setup-bun
      with:
        working-directory: emme-web

- [x] Step 2: Validate recording workflow contracts.

    bun run scripts/validate-ci-workflows.mjs
    bun run docs:check

Expected: all commands pass and both recording workflows still install Chromium only in recording jobs.

- [x] Step 3: Commit.

    git add .github/workflows/demo-recordings.yml .github/workflows/real-e2e-recordings.yml
    git commit -m "ci(web): reuse workspace setup in recording workflows"

## Task 4: Verify web CI locally and remotely

**Files:**

- Modify: tasks/todo.md

- [x] Step 1: Run local gates.

    bun run scripts/validate-ci-workflows.mjs
    bun run quality

Expected: documentation, i18n, formatting, typecheck, lint, tests, coverage, build, and dependency audit pass.

- [x] Step 2: Inspect changed-file scope.

    git diff --check
    git status --short

Expected: no whitespace errors and only planned files changed.

- [ ] Step 3: Push and verify Frontend CI.

    git push origin feat/api-version-contract
    gh run list -R migangdel/emme-web --branch feat/api-version-contract --limit 3

Verify the default event path executes the optional steps successfully.

- [ ] Step 4: Commit verification evidence.

    git add tasks/todo.md
    git commit -m "docs(ci): record web pipeline verification"
    git push origin feat/api-version-contract
