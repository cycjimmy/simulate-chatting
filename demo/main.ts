import type { ChartItem } from '../src/index'

import Swiper from 'swiper/bundle'
import SimulateChat from '../src/index'

import 'swiper/css/bundle'

// The demo mirrors the sizes of the sample stickers (1080px wide, 320px stage).
const LEFT_WIDTH = 665 / 1080 * 320
const RIGHT_WIDTH = 567 / 1080 * 320
const STICKER_HEIGHT = 121 / 1080 * 320

const leftItem: ChartItem = {
  pos: 'left',
  w: LEFT_WIDTH,
  h: STICKER_HEIGHT,
  img: 'chart1.jpg',
  delay: 2000,
}

const rightItem: ChartItem = {
  pos: 'right',
  w: RIGHT_WIDTH,
  h: STICKER_HEIGHT,
  img: 'chart2.jpg',
  delay: 2000,
}

const chartList: ChartItem[] = [
  leftItem,
  {
    ...rightItem,
    // eslint-disable-next-line no-console -- the demo logs to show the callback fires
    callback: () => console.log('test callback'),
  },
  {
    ...leftItem,
    custom: true,
    html: '<img class="full" width="100%" height="100%" src="chart1.jpg" alt="">',
    delay: 1500,
    pause: false,
  },
  // The rest alternates right/left from index 3 onwards.
  ...Array.from({ length: 29 }, (_, index) => (index % 2 === 0
    ? rightItem
    : leftItem)),
]

const simulateChat = new SimulateChat('#wrapper', {
  sound: 'msg.mp3',
  footer: {
    height: 320 / 640 * 80,
    img: 'footerInput.jpg',
  },
  chartList,
  SwiperModule: Swiper,
})

document.getElementById('start')?.addEventListener('click', () => {
  simulateChat.start()
})

document.getElementById('pause')?.addEventListener('click', () => {
  simulateChat.pause()
})

document.getElementById('reset')?.addEventListener('click', () => {
  simulateChat.reset()
})
