import antfu from '@antfu/eslint-config'

export default antfu({
  type: 'lib',
  typescript: true,
  ignores: [
    '.release/**',
    '.publish/**',
    'temp/**',
    'docs/**',
    // Documentation is written by hand and maintained by semantic-release; the
    // badge markup intentionally has empty image alt text.
    '**/*.md',
  ],
})
