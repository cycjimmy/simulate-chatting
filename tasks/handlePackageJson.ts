/* eslint no-console: 0 */
import path from 'node:path'

import fs from 'fs-extra'

const { readJsonSync, outputJsonSync } = fs

interface ReleasePackageJson {
  scripts?: unknown
  dependencies?: unknown
  devDependencies?: unknown
  config?: unknown
  overrides?: unknown
  engines?: unknown
  publishConfig?: { access?: string }
  [key: string]: unknown
}

const jsonData = readJsonSync(
  path.resolve('package.json'),
) as ReleasePackageJson

if (jsonData.scripts) {
  delete jsonData.scripts
}

if (jsonData.dependencies) {
  delete jsonData.dependencies
}

if (jsonData.devDependencies) {
  delete jsonData.devDependencies
}

// `overrides` only patches the local dev tree; it means nothing to a consumer.
if (jsonData.overrides) {
  delete jsonData.overrides
}

// The `engines` range comes from the build toolchain (Stylelint, jsdom) and
// would only produce install warnings for consumers: the shipped bundle targets
// ES2015 and has no Node runtime requirement, as the README states.
if (jsonData.engines) {
  delete jsonData.engines
}

// A scoped package without `publishConfig.access` is published as `restricted`.
// Keep the access level only: the registry and tag are decided by the release
// tooling, not by the source package.json.
jsonData.publishConfig = {
  access: jsonData.publishConfig?.access ?? 'public',
}

if (jsonData.config) {
  delete jsonData.config
}

outputJsonSync(
  path.resolve('.release', 'package.json'),
  jsonData,
  {
    spaces: 2,
  },
)

console.log('handlePackageJson success!')
