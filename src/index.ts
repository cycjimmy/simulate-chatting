import isString from '@cycjimmy/awesome-js-funcs/judgeBasic/isString'
import isAudioPlaying from '@cycjimmy/awesome-js-funcs/media/isAudioPlaying'

import containerTemplate from './containerTemplate'
import style from './style.module.scss'

export type CustomValue = number | string

export type ChartPosition = 'left' | 'center' | 'right'

/**
 * Item shape the container markup consumes: every length has already been
 * turned into a CSS value and the position is resolved. Kept in this module so
 * the emitted `index.d.ts` never imports another file.
 */
export interface ChartTemplateItem {
  index: number
  pos: ChartPosition
  w?: string
  h?: string
  top?: string
  img?: string
  delay?: number
  custom?: boolean
  html?: string
  pause?: boolean
  muted?: boolean
  callback?: () => void
}

/**
 * One chat bubble. `w`, `h` and `top` accept a number of pixels or a CSS
 * length such as `'20vw'`.
 */
export interface ChartItem {
  pos?: ChartPosition
  w?: CustomValue
  h?: CustomValue
  top?: CustomValue
  img?: string
  delay?: number
  custom?: boolean
  html?: string
  pause?: boolean
  muted?: boolean
  callback?: () => void
}

export interface SimulateChatFooter {
  height?: CustomValue
  img?: string
}

export interface SwiperLike {
  updateSlides: () => void
}

/**
 * Structural constructor type: the declarations stay independent of the
 * `swiper` package, which the library never imports at runtime.
 *
 * `options` is `any` on purpose. With `strictFunctionTypes` a narrower option
 * type would reject `typeof Swiper`, because Swiper's own option type is not
 * assignable from a generic record.
 */
export type SwiperModule = new (element: HTMLElement, options?: any) => SwiperLike

export interface SimulateChatOptions {
  footer?: SimulateChatFooter | null
  chartList?: readonly ChartItem[]
  sound?: string
  SwiperModule?: SwiperModule | null
}

interface SimulateChatElements {
  context: HTMLElement
  container: HTMLDivElement
  swiperContainer: HTMLElement
  swiperWrapper: HTMLElement
  chartList: HTMLUListElement
  chartListChds: HTMLLIElement[]
}

interface SimulateChatConfig {
  width: number
  chartList: ChartTemplateItem[]
  footer: { height?: string, img?: string } | null
  sound: HTMLAudioElement | null
  SwiperModule: SwiperModule | null
  swiperContainer: { height: number }
}

interface SimulateChatState {
  next: HTMLLIElement | null
  isPausing: boolean
  done: boolean
  busy: boolean
  soundUnlock: boolean
  soundMuted: boolean
}

declare global {
  interface Window {
    Swiper?: SwiperModule
  }
}

const DEFAULT_DELAY = 1500

function formatCustomValue(inputValue: CustomValue): string {
  if (isString(inputValue)) {
    return inputValue
  }
  return `${inputValue}px`
}

/**
 * Normalizes the caller's items into the shape the markup consumes. The input
 * array and its items are left untouched: the legacy implementation wrote the
 * index and the resolved lengths back onto the objects it was given.
 */
function normalizeChartList(chartList: readonly ChartItem[]): ChartTemplateItem[] {
  return chartList.map(
    (chartItem, index) => {
      const normalized: ChartTemplateItem = {
        index,
        pos: chartItem.pos ?? 'left',
        img: chartItem.img,
        delay: chartItem.delay,
        custom: chartItem.custom,
        html: chartItem.html,
        pause: chartItem.pause,
        muted: chartItem.muted,
        callback: chartItem.callback,
      }

      // A zero width/height is a valid, meaningful length (`width: 0`), so it
      // is converted like any other value. `top` keeps the legacy truthiness
      // test instead, because a zero margin means "no override" there.
      if (chartItem.w !== undefined) {
        normalized.w = formatCustomValue(chartItem.w)
      }

      if (chartItem.h !== undefined) {
        normalized.h = formatCustomValue(chartItem.h)
      }

      if (chartItem.top) {
        normalized.top = formatCustomValue(chartItem.top)
      }

      return normalized
    },
  )
}

function resolveContext(context: HTMLElement | string): HTMLElement {
  if (!isString(context)) {
    return context
  }

  const element = document.querySelector<HTMLElement>(context)
  if (!element) {
    throw new Error(`SimulateChat: no element matches "${context}".`)
  }
  return element
}

function queryElement<T extends Element>(parent: ParentNode, selector: string): T {
  const element = parent.querySelector<T>(selector)
  if (!element) {
    throw new Error(`SimulateChat: the rendered markup is missing "${selector}".`)
  }
  return element
}

export default class SimulateChat {
  el!: SimulateChatElements

  config: SimulateChatConfig

  state: SimulateChatState

  swiper: SwiperLike | null = null

  // `context` is the wrapper element or a selector for it; `options` carries the
  // footer, the chartList, the sound source and an optional Swiper constructor.
  constructor(context: HTMLElement | string, {
    footer = null,
    chartList = [],
    sound = '',
    SwiperModule = null,
  }: SimulateChatOptions) {
    const contextElement = resolveContext(context)
    contextElement.style.position = 'relative'

    this.config = {
      width: contextElement.getBoundingClientRect().width,
      chartList: normalizeChartList(chartList),
      footer: null,
      sound: null,
      SwiperModule: SwiperModule ?? window.Swiper ?? null,
      swiperContainer: { height: 0 },
    }

    this.state = {
      next: null,
      isPausing: true,
      done: false,
      busy: false,
      soundUnlock: false,
      soundMuted: true,
    }

    // footer Input
    if (footer) {
      this.config.footer = {
        img: footer.img,
        ...(footer.height !== undefined && {
          height: formatCustomValue(footer.height),
        }),
      }
    }

    // sound
    if (sound) {
      this.config.sound = new Audio(sound)
      this._soundInit()
    }

    this._initUI(contextElement)
  }

  /**
   * Start to display patterns.
   */
  start(): SimulateChat | Promise<void> {
    if (this.state.busy) {
      return this
    }

    if (this.state.done) {
      return this
    }

    this._soundUnlock()

    this.state.isPausing = false

    return this._showOne()
  }

  /**
   * Pause the running of patterns.
   */
  pause(): SimulateChat {
    this.state.isPausing = true
    return this
  }

  /**
   * Reset patterns.
   */
  reset(): SimulateChat {
    // set state
    this.state.isPausing = true
    this.state.done = false
    this.state.busy = false
    this.state.next = null

    // reset ui
    this.el.chartListChds.forEach((el) => {
      el.classList.remove(style.show)
    })

    this.swiper?.updateSlides()
    this._scrollToTop(0)

    return this
  }

  /**
   * Show a pattern
   */
  private _showOne(): Promise<void> {
    // stage 1
    if (!this.state.next) {
      this.state.next = this.el.chartList.firstElementChild as HTMLLIElement | null
    }

    const current = this.state.next

    // `busy` is raised before the item is even inspected, exactly like the
    // legacy implementation: a synchronous second `start()` therefore still
    // returns the instance, even when the list rendered nothing.
    this.state.busy = true

    const played = current
      ? this._showItem(current)
      : Promise.reject(new Error('SimulateChat: the chartList rendered no item.'))

    return played.catch(() => {
      this.state.busy = false
    })
  }

  /**
   * Show one pattern and hand the next one to `_showOne`.
   */
  private _showItem(current: HTMLLIElement): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const rawDelay = current.dataset.delay
      const parsedDelay = rawDelay === undefined
        ? DEFAULT_DELAY
        : Number(rawDelay)

      setTimeout(() => {
        if (this.state.isPausing) {
          reject(new Error('SimulateChat: paused'))
        }
        else {
          resolve()
        }
      }, Number.isFinite(parsedDelay)
        ? parsedDelay
        : DEFAULT_DELAY)
    })
      .then(() => new Promise<boolean>((resolve) => {
        // stage 2
        const needPause = Boolean(current.dataset.pause)
        const needSound = !current.dataset.muted
        const hasCallback = Boolean(current.dataset.callback)
        if (needSound) {
          this._soundPlay()
        }
        current.classList.add(style.show)
        this.swiper?.updateSlides()
        this._scrollToBottom()

        // `updateSlides` emits Swiper's events synchronously, so a listener may
        // already have reset the player. The legacy implementation threw on the
        // cleared cursor before the callback ran, so check before running it.
        this._assertCursor(current)

        // run callback
        if (hasCallback) {
          this.config.chartList[Number(current.dataset.index)]?.callback?.()
          // The callback is free to reset the player as well.
          this._assertCursor(current)
        }

        // set next
        this.state.next = current.nextElementSibling as HTMLLIElement | null

        setTimeout(resolve, 0, needPause)
      }))
      .then((needPause) => {
        if (!this.state.next) {
          // done
          this.state.done = true
          this.state.isPausing = true
          this.state.busy = false
          return
        }

        if (!needPause) {
          return this._showOne()
        }
        this.state.busy = false
      })
  }

  /**
   * Stops a chain whose item is no longer the current one, which happens when
   * the player is reset from a Swiper event listener or an item callback.
   */
  private _assertCursor(current: HTMLLIElement): void {
    if (this.state.next !== current) {
      throw new Error('SimulateChat: playback was reset while showing an item.')
    }
  }

  /**
   * Initialization UI
   */
  private _initUI(context: HTMLElement): void {
    const container = document.createElement('div')
    container.classList.add(style.container)

    container.innerHTML = containerTemplate({
      style,
      config: this.config,
    })

    context.appendChild(container)

    const swiperContainer = queryElement<HTMLElement>(container, `.${style.main}`)
    const swiperWrapper = queryElement<HTMLElement>(container, `.${style.swiperWrapper}`)
    const chartList = queryElement<HTMLUListElement>(swiperWrapper, `.${style.chartList}`)

    this.el = {
      context,
      container,
      swiperContainer,
      swiperWrapper,
      chartList,
      chartListChds: Array.from(chartList.children) as HTMLLIElement[],
    }

    this.config.swiperContainer = {
      height: swiperContainer.getBoundingClientRect().height,
    }

    const SwiperConstructor = this.config.SwiperModule
    if (!SwiperConstructor) {
      throw new Error(
        'SimulateChat: no Swiper constructor was provided. Pass `SwiperModule` or load Swiper globally.',
      )
    }

    this.swiper = new SwiperConstructor(swiperContainer, {
      nested: true,
      direction: 'vertical',
      slidesPerView: 'auto',
      freeMode: true,
      mousewheel: true,
    })
  }

  /**
   * Initialization sound
   */
  private _soundInit(): void {
    const soundLoad = (): void => {
      // `HTMLAudioElement#load` is always defined, so the legacy
      // `if (!sound.load) sound.load()` guard never ran. It is dropped rather
      // than carried over as dead code.
      this._soundUnlock()
      document.body.removeEventListener('touchstart', soundLoad)
    }

    document.body.addEventListener('touchstart', soundLoad, false)
  }

  /**
   * Scroll To Bottom
   */
  private _scrollToBottom(speed = 200): void {
    const chartListHeight = this.el.chartList.getBoundingClientRect().height
    const distance = this.config.swiperContainer.height - chartListHeight
    if (distance > 0) {
      return
    }

    this.el.swiperWrapper.style.cssText = `transition-duration: ${
      speed
    }ms; transform: translate3d(0px, ${
      distance
    }px, 0px);`
  }

  /**
   * Scroll To Top
   */
  private _scrollToTop(speed = 200): void {
    this.el.swiperWrapper.style.cssText = `transition-duration: ${
      speed
    }ms; transform: translate3d(0px, 0px, 0px);`
  }

  /**
   * play sound
   */
  private _soundPlay(): void {
    const { sound } = this.config
    if (!sound) {
      return
    }

    if (this.state.soundMuted) {
      sound.muted = false
    }
    void sound.play()
  }

  /**
   * sound unlock
   */
  private _soundUnlock(): void {
    const { sound } = this.config
    if (!sound || this.state.soundUnlock) {
      return
    }

    sound.muted = true
    void sound.play()
    setTimeout(() => {
      if (isAudioPlaying(sound)) {
        this.state.soundUnlock = true
        sound.pause()
        if (!this.state.soundMuted) {
          sound.muted = false
        }
      }
    }, 0)
  }
}
