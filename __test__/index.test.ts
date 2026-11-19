import Swiper from 'swiper'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import SimulateChat from '../src/index'
import style from '../src/style.module.scss'

/**
 * Minimal stand-in for Swiper: the library only calls `updateSlides()`, so the
 * scheduling tests do not need a real instance.
 */
class SwiperStub {
  static instances: SwiperStub[] = []

  element: HTMLElement

  updateSlidesCalls = 0

  constructor(element: HTMLElement) {
    this.element = element
    SwiperStub.instances.push(this)
  }

  updateSlides(): void {
    this.updateSlidesCalls += 1
  }
}

describe('simulateChat', () => {
  let wrapper: HTMLElement

  beforeEach(() => {
    SwiperStub.instances = []
    wrapper = document.createElement('div')
    document.body.appendChild(wrapper)
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('renders the container and builds a real Swiper instance', () => {
    wrapper.style.width = '320px'
    wrapper.style.height = '520px'

    const simulateChat = new SimulateChat(wrapper, {
      sound: 'msg.mp3',
      footer: {
        img: 'footerInput.jpg',
        height: 40,
      },
      chartList: [],
      SwiperModule: Swiper,
    })

    expect(simulateChat.el.context).toBe(wrapper)
    expect(simulateChat.el.container).toBeTruthy()
    expect(simulateChat.el.swiperContainer).toBeTruthy()
    expect(simulateChat.el.swiperWrapper).toBeTruthy()
    expect(simulateChat.el.chartList).toBeTruthy()
    expect(simulateChat.swiper).toBeTruthy()
    expect(wrapper.style.position).toBe('relative')
  })

  it('only writes the data attributes the options ask for', () => {
    const simulateChat = new SimulateChat(wrapper, {
      chartList: [
        {
          pos: 'center',
          w: '20vw',
          h: 30,
          top: 4,
          delay: 500,
          pause: true,
          muted: false,
          callback: () => {},
        },
        { img: 'chart2.jpg' },
      ],
      SwiperModule: SwiperStub,
    })

    const items = simulateChat.el.chartList.querySelectorAll('li')
    expect(items).toHaveLength(2)

    expect(items[0].dataset.delay).toBe('500')
    expect(items[0].dataset.index).toBe('0')
    expect(items[0].dataset.pause).toBe('true')
    expect(items[0].dataset.muted).toBeUndefined()
    expect(items[0].dataset.callback).toBe('true')
    expect(items[0].className).toContain(style.center)

    // An omitted delay falls back to the documented default instead of the
    // string "undefined"; an omitted position falls back to `left`.
    expect(items[1].dataset.delay).toBe('1500')
    expect(items[1].dataset.pause).toBeUndefined()
    expect(items[1].className).toContain(style.left)
  })

  it('does not mutate the chartList it is given', () => {
    const item = {
      pos: 'left' as const,
      w: 100,
      h: 30,
      img: 'chart1.jpg',
      delay: 200,
    }
    const chartList = [item]

    const simulateChat = new SimulateChat(wrapper, {
      chartList,
      SwiperModule: SwiperStub,
    })

    expect(chartList[0]).toBe(item)
    expect(item).toEqual({
      pos: 'left',
      w: 100,
      h: 30,
      img: 'chart1.jpg',
      delay: 200,
    })
    expect(simulateChat.config.chartList[0]?.w).toBe('100px')
  })

  it('starts without a sound option', () => {
    vi.useFakeTimers()

    const simulateChat = new SimulateChat(wrapper, {
      chartList: [
        { w: 10, h: 10 },
      ],
      SwiperModule: SwiperStub,
    })

    expect(() => simulateChat.start()).not.toThrow()
    expect(simulateChat.state.isPausing).toBe(false)
  })

  it('keeps a zero width and height as a valid length', () => {
    const simulateChat = new SimulateChat(wrapper, {
      chartList: [
        { w: 0, h: 0 },
      ],
      SwiperModule: SwiperStub,
    })

    const content = simulateChat.el.chartList.querySelector('div')
    expect(content?.getAttribute('style')).toContain('width: 0px')
    expect(content?.getAttribute('style')).toContain('height: 0px')
  })

  it('settles a start on an empty list without leaving the player busy', async () => {
    vi.useFakeTimers()

    const simulateChat = new SimulateChat(wrapper, {
      chartList: [],
      SwiperModule: SwiperStub,
    })

    const started = simulateChat.start()
    expect(started).toBeInstanceOf(Promise)
    // `busy` is raised before the list is inspected, so a synchronous second
    // call still short-circuits to the instance.
    expect(simulateChat.start()).toBe(simulateChat)

    await started
    expect(simulateChat.state.busy).toBe(false)
    expect(simulateChat.state.done).toBe(false)
  })

  it('stops the chain when a callback resets the player', async () => {
    vi.useFakeTimers()

    let resetFromCallback = (): void => {}
    const simulateChat = new SimulateChat(wrapper, {
      chartList: [
        {
          w: 10,
          h: 10,
          delay: 100,
          callback: () => resetFromCallback(),
        },
        { w: 10, h: 10, delay: 100 },
      ],
      SwiperModule: SwiperStub,
    })
    resetFromCallback = () => simulateChat.reset()

    const started = simulateChat.start()
    await vi.advanceTimersByTimeAsync(100)

    // The reset happened from inside the callback, so the chain must not write
    // the next cursor or mark the list as finished.
    expect(simulateChat.state.next).toBeNull()
    expect(simulateChat.state.done).toBe(false)

    await started
    expect(simulateChat.state.busy).toBe(false)
  })

  it('stops the chain when a Swiper update resets the player', async () => {
    vi.useFakeTimers()

    const holder: { instance?: SimulateChat } = {}
    const callback = vi.fn()
    let armed = true

    // Mirrors a `slidesUpdated` listener that resets the player. `reset()` calls
    // `updateSlides()` itself, so the stub only fires once.
    class ResettingSwiper {
      updateSlides(): void {
        if (!armed) {
          return
        }
        armed = false
        holder.instance?.reset()
      }
    }

    const simulateChat = new SimulateChat(wrapper, {
      chartList: [
        { w: 10, h: 10, delay: 100, callback },
        { w: 10, h: 10, delay: 100 },
      ],
      SwiperModule: ResettingSwiper,
    })
    holder.instance = simulateChat

    const started = simulateChat.start()
    await vi.advanceTimersByTimeAsync(100)

    // The reset landed before the callback, so the callback must not run.
    expect(callback).not.toHaveBeenCalled()
    expect(simulateChat.state.next).toBeNull()
    expect(simulateChat.state.done).toBe(false)

    await started
    expect(simulateChat.state.busy).toBe(false)
  })

  it('advances through the list, runs callbacks and resets', async () => {
    vi.useFakeTimers()

    const callback = vi.fn()
    const simulateChat = new SimulateChat(wrapper, {
      chartList: [
        {
          pos: 'left',
          w: 10,
          h: 10,
          img: 'chart1.jpg',
          delay: 100,
          callback,
        },
        {
          pos: 'right',
          w: 10,
          h: 10,
          img: 'chart2.jpg',
          delay: 100,
        },
      ],
      SwiperModule: SwiperStub,
    })

    const items = simulateChat.el.chartList.querySelectorAll('li')
    const started = simulateChat.start()
    expect(started).toBeInstanceOf(Promise)

    await vi.advanceTimersByTimeAsync(100)
    expect(items[0].classList.contains(style.show)).toBe(true)
    expect(callback).toHaveBeenCalledTimes(1)

    // Each item adds a zero-delay hop between the delay and the next item, so
    // the following window has to cover that hop as well.
    await vi.advanceTimersByTimeAsync(300)
    expect(items[1].classList.contains(style.show)).toBe(true)
    expect(simulateChat.state.done).toBe(true)

    await started

    simulateChat.reset()
    expect(items[0].classList.contains(style.show)).toBe(false)
    expect(items[1].classList.contains(style.show)).toBe(false)
    expect(simulateChat.state.next).toBeNull()
  })
})
