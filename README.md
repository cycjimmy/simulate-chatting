# Simulate Chatting

![][workflows-badge-image]
[![libraries dependency status][libraries-status-image]][libraries-status-url]
[![libraries sourcerank][libraries-sourcerank-image]][libraries-sourcerank-url]
[![Release date][release-date-image]][release-url]
[![vite][vite-image]][vite-url]
[![semantic-release][semantic-image]][semantic-url]
[![vitest][vitest-image]][vitest-url]
[![npm license][license-image]][download-url]

* Simulate Chatting based on swiper 4+. ([Demo][github-pages-url])

> Since v3 the package is ESM-only, ships TypeScript declarations and is built
> with Vite. See [Migrating from v2 to v3](#migrating-from-v2-to-v3).

## Install
[![NPM version][npm-image]][npm-url]
[![NPM bundle size][npm-bundle-size-image]][npm-url]
[![npm download][download-image]][download-url]

```shell
# via npm
$ npm install @cycjimmy/simulate-chatting --save

# or via yarn
$ yarn add @cycjimmy/simulate-chatting
```

## Use

**Simulate chatting based on [Swiper 4+](https://github.com/nolimits4web/Swiper). Swiper is not bundled: load it yourself and either pass it in through `SwiperModule` or expose it as the global `Swiper`.**

```javascript
import Swiper from 'swiper/bundle'
import 'swiper/css/bundle'

import SimulateChat from '@cycjimmy/simulate-chatting'

const simulateChat = new SimulateChat(wrapper, {
  sound: 'msg.mp3',
  chartList: [],
  SwiperModule: Swiper,
})
```

```javascript
const simulateChat = new SimulateChat(wrapper, options)
```

* `wrapper`: [Element|String] Context Wrapper Element. [Required]
* `options`: looks like: { sound: 'source', chartList: [] }
  * `footer`: [Object]. Default `null`.
    * `height`: [Number|String] Height of footer input. If you want to add the unit, can use the string form. E.g: `'20vw'`.
    * `img`: [String] Image source.
  * `sound`: [String] Audio source. Default `''`.
  * `chartList`: [Array] Array of chartList patterns. Default `[]`. The array and its items are not modified.
    * A pattern looks like: `{ pos: 'left', w: 100, h: 30, img: '', delay: 2000 [, ...] }`
      * `pos`: [String] Position of the pattern. Use one of the three options:
        * `'left'` (default when omitted)
        * `'center'`
        * `'right'`
      * `w`: [Number|String] Width of pattern. If you want to add the unit, can use the string form. E.g: `'20vw'`.
      * `h`: [Number|String] Height of pattern. If you want to add the unit, can use the string form. E.g: `'20vw'`.
      * `top`: [Number|String] Custom set the margin from the previous. If you want to add the unit, can use the string form. E.g: `'20vw'`.
      * `img`: [String] Image source.
      * `delay`: [Number] Delay from the previous pattern display. Default `1500`.
      * `custom`: [Boolean] Whether to enable custom mode.
      * `html`: [String] Custom html structure of pattern when custom is `true`.
      * `pause`: [Boolean] Whether to pause the running of patterns after this pattern display.
      * `muted`: [Boolean] Whether not to play the sound when this pattern show.
      * `callback`: [Function] if set, run callback function after this pattern show.
  * `SwiperModule`: [Function] The Swiper constructor to use. Note the version to 4+. Defaults to the global `window.Swiper`.

* Functions:
  * `start()`: Start to display patterns. Returns the instance while it is busy
    or already finished, and a promise otherwise.
  * `pause()`: Pause the running of patterns.
  * `reset()`: Reset patterns.

The package injects its own stylesheet when it is imported, so no extra CSS file
is published. Swiper's stylesheet still has to be loaded by the application.

### Use in browser
```html
<div id="wrapper"></div>

<script src="swiper-bundle.min.js"></script>
<script src="simulate-chatting.umd.min.js"></script>
<script>
  const simulateChat = new SimulateChat('#wrapper', {
    sound: 'msg.mp3',
    footer: {
      height: 40,
      img: 'footerInput.jpg'
    },
    chartList: [...]
  });

  simulateChat.start();
</script>
```

The UMD build exposes the constructor as `window.SimulateChat`.

## TypeScript

The published entry point carries its own declarations, so no `@types` package
is needed:

```ts
import type { ChartItem, SimulateChatOptions } from '@cycjimmy/simulate-chatting'
```

`SwiperModule` is declared structurally and never references the `swiper`
package's types, so the declarations resolve even when Swiper is loaded from a
script tag.

## CDN
[![jsdelivr][jsdelivr-image]][jsdelivr-url]

To use via a CDN include this in your HTML:
```text
<script src="https://cdn.jsdelivr.net/npm/@cycjimmy/simulate-chatting@3/dist/simulate-chatting.umd.min.js"></script>
```

## Migrating from v2 to v3

v3 is a breaking release. In order of likelihood to affect an existing
application:

* **CommonJS output is gone.** `main`, `module` and `exports` all resolve to
  `dist/simulate-chatting.esm.js`, and the `require` condition plus the
  `dist/simulate-chatting.cjs` bundle were removed. On Node ≥ 22.12 a
  `require()` still loads the ESM entry, but it returns the module namespace:
  use `import SimulateChat from '@cycjimmy/simulate-chatting'`, or read
  `.default` from a dynamic import.
* **TypeScript declarations are published** from `dist/index.d.ts`.
* **Old browsers are no longer targeted.** The output is ES2015 and the CSS is
  generated for the `defaults` browserslist; the previous IE10 targets (and
  their prefixes) are gone.
* **The `chartList` you pass in is not mutated any more.** The resolved index
  and the pixel-converted `w`/`h`/`top` values live on an internal copy instead
  of being written back onto your objects.
* **An omitted `delay` now waits the documented 1500 ms.** It used to be
  written to the markup as the string `undefined`, which the browser turned
  into a ~0 ms timeout.
* **`start()` without a `sound` option no longer throws.** Every audio call is
  skipped when no source is configured.
* **The toolchain requires a newer Node.** Building, testing and releasing need
  Node `^22.22.2 || ^24.15.0 || >=26.0.0`; the published bundle has no Node
  dependency and carries no `engines` field.
* `destroy()` is still not provided: to stop a running instance, stop calling
  into it and remove the wrapper element.

## Development

```shell
$ npm install
$ npm run dev            # Vite dev server, opens index.html
$ npm run type-check     # tsc --noEmit
$ npm run lint           # ESLint (flat config, @antfu/eslint-config)
$ npm run lint:style     # Stylelint for src/**/*.{css,scss}
$ npm test               # Vitest
$ npm run package        # build dist/ and assemble .release/
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full workflow.

<!-- Links: -->
[npm-image]: https://img.shields.io/npm/v/@cycjimmy/simulate-chatting
[npm-url]: https://npmjs.org/package/@cycjimmy/simulate-chatting
[npm-bundle-size-image]: https://img.shields.io/bundlephobia/min/@cycjimmy/simulate-chatting

[download-image]: https://img.shields.io/npm/dt/@cycjimmy/simulate-chatting
[download-url]: https://npmjs.org/package/@cycjimmy/simulate-chatting

[jsdelivr-image]: https://img.shields.io/jsdelivr/npm/hy/@cycjimmy/simulate-chatting
[jsdelivr-url]: https://www.jsdelivr.com/package/npm/@cycjimmy/simulate-chatting

[workflows-badge-image]: https://github.com/cycjimmy/simulate-chatting/workflows/Test%20CI/badge.svg

[libraries-status-image]: https://img.shields.io/librariesio/release/npm/@cycjimmy/simulate-chatting
[libraries-sourcerank-image]: https://img.shields.io/librariesio/sourcerank/npm/@cycjimmy/simulate-chatting
[libraries-status-url]: https://libraries.io/github/cycjimmy/simulate-chatting
[libraries-sourcerank-url]: https://libraries.io/npm/@cycjimmy%2Fsimulate-chatting

[release-date-image]: https://img.shields.io/github/release-date/cycjimmy/simulate-chatting
[release-url]: https://github.com/cycjimmy/simulate-chatting/releases

[vite-image]: https://img.shields.io/github/package-json/dependency-version/cycjimmy/simulate-chatting/dev/vite
[vite-url]: https://github.com/vitejs/vite

[semantic-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-url]: https://github.com/semantic-release/semantic-release

[vitest-image]: https://img.shields.io/badge/tested_with-vitest-6da13f.svg
[vitest-url]: https://github.com/vitest-dev/vitest

[license-image]: https://img.shields.io/npm/l/@cycjimmy/simulate-chatting

[github-pages-url]: https://cycjimmy.github.io/simulate-chatting/
