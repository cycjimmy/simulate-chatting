// style
import isString from '@cycjimmy/awesome-js-funcs/esm/judgeBasic/isString';
import isAudioPlaying from '@cycjimmy/awesome-js-funcs/esm/media/isAudioPlaying';
import style from './style.scss';
import containerTemplate from './containerTemplate';

// private
const _formattingCustomValue = (inputValue) => {
  if (isString(inputValue)) {
    return inputValue;
  }
  return `${inputValue}px`;
};

const _chartListHandle = (chartList) => chartList.map((config, index) => {
  const insideConfig = config;
  insideConfig.index = index;

  if (insideConfig.w) {
    insideConfig.w = _formattingCustomValue(insideConfig.w);
  }

  if (insideConfig.h) {
    insideConfig.h = _formattingCustomValue(insideConfig.h);
  }

  if (insideConfig.top) {
    insideConfig.top = _formattingCustomValue(insideConfig.top);
  }

  return insideConfig;
});

export default class SimulateChat {
  /**
   * @param context
   * @param footer
   * @param chartList
   * @param sound
   * @param SwiperModule
   */
  constructor(context, {
    footer = null,
    chartList = [],
    sound = '',
    SwiperModule = null,
  }) {
    this.el = {};

    this.el.context = isString(context)
      ? document.querySelector(context)
      : context;

    this.el.context.style.position = 'relative';

    // handle chartList
    _chartListHandle(chartList);

    this.config = {
      width: this.el.context.getBoundingClientRect().width,
      chartList,
      footer: null,
      sound: null,
      SwiperModule: SwiperModule || window.Swiper,
    };

    this.state = {
      next: null,
      isPausing: true,
      done: false,
      busy: false,
      soundUnlock: false,
      soundMuted: true,
    };

    // footer Input
    if (footer) {
      this.config.footer = {};
      this.config.footer.height = _formattingCustomValue(footer.height);
      this.config.footer.img = footer.img;
    }

    // sound
    if (sound) {
      this.config.sound = new Audio(sound);
      this._soundInit();
    }

    this.swiper = null;
    this._initUI();
  }

  /**
   * Start to display patterns.
   * @returns {Promise<unknown>|SimulateChat}
   */
  start() {
    if (this.state.busy) {
      return this;
    }

    if (this.state.done) {
      return this;
    }

    this._soundUnlock();

    this.state.isPausing = false;

    return this._showOne();
  }

  /**
   * Pause the running of patterns.
   * @return {SimulateChat}
   */
  pause() {
    this.state.isPausing = true;
    return this;
  }

  /**
   * Reset patterns.
   * @return {SimulateChat}
   */
  reset() {
    // set state
    this.state.isPausing = true;
    this.state.done = false;
    this.state.busy = false;
    this.state.next = null;

    // reset ui
    this.el.chartListChds.forEach((el) => {
      el.classList.remove(style.show);
    });

    this.swiper.updateSlides();
    this._scrollToTop(0);

    return this;
  }

  /**
   * Show a pattern
   * @private
   */
  _showOne() {
    // stage 1
    if (!this.state.next) {
      this.state.next = this.el.chartList.firstElementChild;
    }

    return new Promise((resolve, reject) => {
      this.state.busy = true;
      const delay = this.state.next.dataset.delay || 1500;

      setTimeout(() => {
        if (this.state.isPausing) {
          this.state.busy = false;
          reject();
        } else {
          resolve();
        }
      }, delay);
    })
      .then(() => new Promise((resolve) => {
        // stage 2
        const needPause = Boolean(this.state.next.dataset.pause);
        const needSound = !this.state.next.dataset.muted;
        const hasCallback = Boolean(this.state.next.dataset.callback);
        if (needSound) {
          this._soundPlay();
        }
        this.state.next.classList.add(style.show);
        this.swiper.updateSlides();
        this._scrollToBottom();

        // run callback
        if (hasCallback) {
          this.config.chartList[this.state.next.dataset.index].callback();
        }

        // set next
        this.state.next = this.state.next.nextElementSibling;

        setTimeout(() => resolve(needPause), 0);
      }))
      .then((needPause) => {
        if (!this.state.next) {
          // done
          this.state.done = true;
          this.state.isPausing = true;
          this.state.busy = false;
          return Promise.resolve();
        }

        if (!needPause) {
          return this._showOne();
        }
        this.state.busy = false;
        return Promise.resolve();
      })
      .catch(() => {
        this.state.busy = false;
      });
  }

  /**
   * Initialization UI
   * @private
   */
  _initUI() {
    this.el.container = document.createElement('div');
    this.el.container.classList.add(style.container);

    this.el.container.innerHTML = containerTemplate({
      style,
      config: this.config,
    });

    this.el.context.appendChild(this.el.container);

    this.el.swiperContainer = this.el.container.querySelector(`.${style.main}`);
    this.el.swiperWrapper = this.el.container.querySelector(`.${style.swiperWrapper}`);
    this.el.chartList = this.el.swiperWrapper.querySelector(`.${style.chartList}`);
    this.el.chartListChds = Array.prototype.slice.call(this.el.chartList.children);

    this.config.swiperContainer = {
      height: this.el.swiperContainer.getBoundingClientRect().height,
    };

    this.swiper = new this.config.SwiperModule(this.el.swiperContainer, {
      nested: true,
      direction: 'vertical',
      slidesPerView: 'auto',
      freeMode: true,
      mousewheel: true,
    });
  }

  /**
   * Initialization sound
   * @private
   */
  _soundInit() {
    const _soundLoad = () => {
      if (!this.config.sound.load) {
        this.config.sound.load();
      }

      this._soundUnlock();
      document.body.removeEventListener('touchstart', _soundLoad);
    };

    document.body.addEventListener('touchstart', _soundLoad, false);
  }

  /**
   * Scroll To Bottom
   * @param speed
   * @private
   */
  _scrollToBottom(speed = 200) {
    const chartListHeight = this.el.chartList.getBoundingClientRect().height;
    const distance = this.config.swiperContainer.height - chartListHeight;
    if (distance > 0) {
      return;
    }

    this.el.swiperWrapper.style.cssText = `transition-duration: ${
      speed
    }ms; transform: translate3d(0px, ${
      distance
    }px, 0px);`;
  }

  /**
   * Scroll To Top
   * @param speed
   * @private
   */
  _scrollToTop(speed = 200) {
    this.el.swiperWrapper.style.cssText = `transition-duration: ${
      speed
    }ms; transform: translate3d(0px, 0px, 0px);`;
  }

  /**
   * play sound
   * @private
   */
  _soundPlay() {
    if (!this.config.sound) {
      return;
    }

    if (this.state.soundMuted) {
      this.config.sound.muted = false;
    }
    this.config.sound.play();
  }

  /**
   * sound unlock
   * @private
   */
  _soundUnlock() {
    if (this.state.soundUnlock) {
      return;
    }
    this.config.sound.muted = true;
    this.config.sound.play();
    setTimeout(() => {
      if (isAudioPlaying(this.config.sound)) {
        this.state.soundUnlock = true;
        this.config.sound.pause();
        if (!this.state.soundMuted) {
          this.config.sound.muted = false;
        }
      }
    }, 0);
  }
}
