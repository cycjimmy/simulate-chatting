# Contributing

The repository is released under the MIT license, and follows a standard Github development process, using Github tracker for issues and merging pull requests into main.

## Requirements

* Node.js `^22.22.2 || ^24.15.0 || >=26.0.0`, the same range as `engines` in
  `package.json` (CI runs the test matrix on 22 and 24). The devDependency floor
  is what drives this range: Stylelint and jsdom require the newer patches.
* npm 10+

## Development

```shell
$ npm install
$ npm run dev          # Vite dev server, opens index.html
$ npm run type-check   # tsc --noEmit over src, __test__, demo, tasks and the configs
$ npm run lint         # ESLint (flat config, @antfu/eslint-config)
$ npm run lint:style   # Stylelint for src/**/*.{css,scss}
$ npm test             # Vitest
$ npm run package      # build dist/ and assemble .release/
```

`index.html` is the only page: it loads `demo/main.ts`, which imports `src/`
directly, so the dev server and the GitHub Pages demo share one page. The demo
assets (`chart1.jpg`, `chart2.jpg`, `footerInput.jpg`, `msg.mp3`, `favicon.ico`)
live in `public/`, which Vite serves at the root and copies into `.publish` for
`build:deployment`.

## TypeScript specifics

* `tsconfig.json` type-checks everything (`noEmit`) and is the config the CI
  `type-check` step uses. `tsconfig.build.json` is the declaration-only config
  that writes `dist/*.d.ts` during the build.
* `tasks/*.ts` are executed by Node's built-in type stripping, so they may only
  use syntax that can be erased: no `enum`, `namespace` or constructor parameter
  properties. `erasableSyntaxOnly` enforces this during `type-check`.
* `release.config.js` stays JavaScript on purpose: semantic-release loads it
  through cosmiconfig, whose TypeScript loader resolves `typescript` from
  semantic-release's own install tree (inside the action) rather than from this
  project.
* `src/types/*.d.ts` holds the ambient declarations for CSS Modules, for the two
  `@cycjimmy/awesome-js-funcs` entry points (the package ships no types) and for
  Swiper's stylesheet, which only the demo imports.
* `index.d.ts` is deliberately self-contained: the shared item types live in
  `src/index.ts` so the published entry point does not import `containerTemplate`.

## Build outputs

`npm run build` writes these files into `dist/`:

| File | Format | Purpose |
| --- | --- | --- |
| `simulate-chatting.esm.js` | ESM | `main`, `module` and `exports` entry (bundlers, `import`) |
| `simulate-chatting.umd.js` | UMD | unminified browser build for `<script>` tags |
| `simulate-chatting.umd.min.js` | UMD | minified browser/CDN build, attached to the GitHub release |
| `index.d.ts` | Types | declarations for `types` and the `exports` `types` condition |

There is no CommonJS bundle: the package is ESM-only. `npm run build` runs
`build:types` (`tsc -p tsconfig.build.json`) before the three Vite builds, and
Vite runs with `emptyOutDir: false` so the declarations survive the JS builds.

The stylesheet is inlined into each entry chunk at build time and injected into
`document.head` at runtime, which is what the old `rollup-plugin-postcss`
pipeline did. Vite is configured with `publicDir: false` for the library builds
so the demo assets never end up in `.release`.

`npm run build:deployment` builds `index.html` as a regular Vite app into
`.publish/` (`base: './'` so it works under the repository subpath). The
`Deploy To GitHub Pages` workflow uploads `.publish` as a Pages artifact and
publishes it with `actions/deploy-pages`; no `ACCESS_TOKEN` and no `gh-pages`
branch are involved.

## Repository settings required by the deployment

1. **Settings → Pages → Build and deployment → Source**: select **GitHub
   Actions**. With *Deploy from a branch* selected, `actions/deploy-pages`
   refuses to run.

   ```shell
   $ gh api -X PUT repos/cycjimmy/simulate-chatting/pages -f build_type=workflow
   ```

2. The `gh-pages` branch can be deleted once the first deployment from `main`
   has succeeded.

## Repository settings required by the bots

`.github/workflows/dependabotAutoMerge.yml` merges non-major Dependabot pull
requests automatically. Three settings cannot be expressed in code:

1. **Settings → Actions → General → Workflow permissions**: *Read and write
   permissions*. Dependabot opens its pull requests from branches inside this
   repository, which is why the `pull_request` event can hand `GITHUB_TOKEN` a
   write token there. Pull requests from forks stay read-only, and the workflow
   skips them through the `head.repo.full_name` guard.
2. **Settings → General**: enable *Allow auto-merge*.
3. **Branch protection on `main`**: block force pushes and deletions, but leave
   *Require status checks to pass before merging* **off**. `semantic-release`
   pushes `chore(release): … [skip ci]` straight to `main`, and GitHub rejects
   that push while a required check is configured. A repository owned by a
   personal account cannot add the GitHub Actions app to a ruleset bypass list
   either, so there is no way to have both.

The CI gate for Dependabot lives in `dependabotAutoMerge.yml` instead: it polls
`gh pr checks` for `Test CI Summary`, squash merges only after it passes, and
confirms the pull request reached `MERGED` before it asks for the Pages
deployment. `Test CI` reports one check per matrix cell, so the `test-status` job
aggregates them into a single check with a stable name.

## Labels

The triage bot and the issue forms reference labels that have to exist in the
repository. `issues.addLabels` fails with `422` for unknown labels, so keep this
list in sync when a rule changes:

| Label | Used by |
| --- | --- |
| `bug` | `bug_report.yml` form |
| `enhancement` | `feature_request.yml` form |
| `needs-info` | triage rule 4, plus the 7-day lifecycle in `stale.yml` |
| `publish-auth` | triage rule 1 (npm / GPR publishing failures) |
| `usage` | triage rules 2 and 3 (Swiper wiring and general questions) |
| `triaged` | manual exemption from the half-year staleness in `stale.yml` |
| `stale` | applied and removed by the triage/stale workflows |
| `ci` | `dependabot.yml` github-actions group |
| `dependencies` | `dependabot.yml` both ecosystems |

```shell
$ gh label create needs-info   --color FBCA04 --description "Waiting for information from the reporter"
$ gh label create triaged      --color 0E8A16 --description "Reviewed by a maintainer; exempt from the short staleness lifecycle"
$ gh label create stale        --color EEEEEE --description "Automatically marked as stale"
$ gh label create ci           --color 1D76DB --description "GitHub Actions and repository automation"
$ gh label create dependencies --color 0366D6 --description "Dependency updates"
$ gh label create usage        --color D876E3 --description "Question about how to use the package"
$ gh label create publish-auth --color B60205 --description "npm or GitHub Package Registry publishing failures"
```

## Release

`release.yml` publishes through four channels, all driven by
`release.config.js`:

* **npm** with Trusted Publishing (OIDC). No `NPM_TOKEN` secret is involved, and
  a matching Trusted Publisher entry has to exist on npmjs.com for this
  repository and the `release.yml` workflow filename.
* **GitHub Package Registry** with `GITHUB_TOKEN` and `packages: write`.
* A **GitHub release** carrying `dist/simulate-chatting.umd.min.js`.
* The **`v<major>` branch**, which is reset to each new major release.

## Commits

[Conventional Commits](https://www.conventionalcommits.org/) are required:
`semantic-release` derives the version and the changelog from them. A breaking
change must be marked with `!` and a `BREAKING CHANGE:` footer. Commit subjects
and bodies, pull request titles and descriptions, and every automated comment
are written in English.
