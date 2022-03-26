# Simulate Chatting

![][workflows-badge-image]
[![libraries dependency status][libraries-status-image]][libraries-status-url]
[![libraries sourcerank][libraries-sourcerank-image]][libraries-sourcerank-url]
[![Release date][release-date-image]][release-url]
[![rollup][rollup-image]][rollup-url]
[![semantic-release][semantic-image]][semantic-url]
[![jest][jest-image]][jest-url]
[![npm license][license-image]][download-url]

* Simulate Chatting based on swiper4+. ([Demo][github-pages-url])

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
**Simulate chatting based on [Swiper 4+](https://github.com/nolimits4web/Swiper). Add Script of swiper in your project first**

```javascript
import SimulateChat from '@cycjimmy/simulate-chatting';

# OR
const SimulateChat = require('@cycjimmy/simulate-chatting');
```

```javascript
const simulateChat = new SimulateChat(wrapper, options);
```

* `wrapper`: [Element|String] Context Wrapper Element. [Required]
* `options`: looks like: { sound: 'source', chartList: [] }
  * `footer`: [Object]. Default `null`.
    * `height`: [Number|String] Height of footer input. If you want to add the unit, can use the string form. E.g: `'20vw'`.
    * `img`: [String] Image source.
  * `sound`: [String] Audio source. Default `''`.
  * `chartList`: [Array] Array of chartList patterns. Default `[]`.
    * A pattern looks like: `{ pos: 'left', w: 100, h: 30, img: '', delay: 2000 [, ...] }`
      * `pos`: [String] Position of the pattern. Use one of the three options:
        * `'left'`
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
  * `SwiperModule`: [Object] Can use custom Swiper. Note the version to 4+. Default `null`.


* Functions:
  * `start()`: Start to display patterns.
  * `pause()`: Pause the running of patterns.
  * `reset()`: Reset patterns.

### Use in browser
```html
<div id="wrapper"></div>

<script src="swiper.min.js"></script>
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

## CDN
[![jsdelivr][jsdelivr-image]][jsdelivr-url]

To use via a CDN include this in your HTML:
```text
<script src="https://cdn.jsdelivr.net/npm/@cycjimmy/simulate-chatting@2/dist/simulate-chatting.umd.min.js"></script>
```

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

[rollup-image]: https://img.shields.io/github/package-json/dependency-version/cycjimmy/simulate-chatting/dev/rollup
[rollup-url]: https://github.com/rollup/rollup

[semantic-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-url]: https://github.com/semantic-release/semantic-release

[jest-image]: https://img.shields.io/badge/tested_with-jest-99424f.svg
[jest-url]: https://github.com/facebook/jest

[license-image]: https://img.shields.io/npm/l/@cycjimmy/simulate-chatting

[github-pages-url]: https://cycjimmy.github.io/simulate-chatting/
