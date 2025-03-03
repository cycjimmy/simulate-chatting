(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.SimulateChat = factory());
})(this, (function () { 'use strict';

  function _classCallCheck(a, n) {
    if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
  }
  function _defineProperties(e, r) {
    for (var t = 0; t < r.length; t++) {
      var o = r[t];
      o.enumerable = o.enumerable || false, o.configurable = true, "value" in o && (o.writable = true), Object.defineProperty(e, _toPropertyKey(o.key), o);
    }
  }
  function _createClass(e, r, t) {
    return r && _defineProperties(e.prototype, r), Object.defineProperty(e, "prototype", {
      writable: false
    }), e;
  }
  function _toPrimitive(t, r) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r);
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (String )(t);
  }
  function _toPropertyKey(t) {
    var i = _toPrimitive(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }

  /**
   * determine a string type
   * @param str
   * @returns {boolean}
   */
  var isString = str => typeof str === 'string' && str.constructor === String;

  /**
   * isAudioPlaying
   * @param audio
   */
  var isAudioPlaying = audio => !audio.paused;

  function styleInject(css, ref) {
    if (ref === void 0) ref = {};
    var insertAt = ref.insertAt;
    if (typeof document === 'undefined') {
      return;
    }
    var head = document.head || document.getElementsByTagName('head')[0];
    var style = document.createElement('style');
    style.type = 'text/css';
    if (insertAt === 'top') {
      if (head.firstChild) {
        head.insertBefore(style, head.firstChild);
      } else {
        head.appendChild(style);
      }
    } else {
      head.appendChild(style);
    }
    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
  }

  var css_248z = ".style__chartList,.style__container,.style__fullImg,.style__swiperWrapper{position:absolute;z-index:1}.style__chartList .style__listContent,.style__footer{position:relative;z-index:1}.style__container,.style__fullImg,.style__swiperWrapper{height:100%;left:0;top:0;width:100%}.style__footer,.style__main{height:0;width:100%}.style__container{background-color:#ebebeb;display:flex;flex-direction:column;overflow:hidden}.style__main{flex:1;overflow:hidden}.style__chartList{display:flex;flex-direction:column;left:0;list-style:none;top:0;width:100%}.style__chartList.swiper-slide{height:auto}.style__chartList>li{display:none;margin:1.8% 0;width:100%}.style__chartList>li:first-of-type{margin-top:3.6%}.style__chartList>li.style__show{display:flex}.style__chartList .style__listContent{margin:0 2.5%}.style__chartList .style__center{justify-content:center}.style__chartList .style__left{justify-content:flex-start}.style__chartList .style__right{justify-content:flex-end}.style__footer{margin-top:1.8%}";
  var style = {"chartList":"style__chartList","fullImg":"style__fullImg","container":"style__container","swiperWrapper":"style__swiperWrapper","listContent":"style__listContent","footer":"style__footer","main":"style__main","show":"style__show","center":"style__center","left":"style__left","right":"style__right"};
  styleInject(css_248z);

  /**
   * containerTemplate
   * @param style
   * @param config
   * @returns {string}
   */
  var containerTemplate = (function (_ref) {
    var style = _ref.style,
      config = _ref.config;
    var aChartListHtml = config.chartList.map(function (chartObj) {
      var marginTopList = chartObj.top ? 'style=" margin-top: 0;"' : '';
      var indexAttributes = "data-index= \"".concat(chartObj.index, "\"");
      var pauseAttributes = chartObj.pause ? 'data-pause= "true"' : '';
      var mutedAttributes = chartObj.muted ? 'data-muted= "true"' : '';
      var callbackAttributes = chartObj.callback ? 'data-callback= "true"' : '';
      var marginTopListContent = chartObj.top ? "margin-top: ".concat(chartObj.top, ";") : '';
      var listContent = chartObj.custom ? chartObj.html || '' : "\n    <img class=\"".concat(style.fullImg, "\" width=\"100%\" height=\"100%\" src=\"").concat(chartObj.img, "\" alt=\"image\"/>\n    ");
      return "\n<li class=\"".concat(style[chartObj.pos], "\" ").concat(marginTopList, " data-delay=\"").concat(chartObj.delay, "\"\n").concat(indexAttributes, " ").concat(pauseAttributes, " ").concat(mutedAttributes, " ").concat(callbackAttributes, ">\n  <div class=\"").concat(style.listContent, "\"\n  style=\"width: ").concat(chartObj.w, "; height: ").concat(chartObj.h, "; ").concat(marginTopListContent, "\">").concat(listContent, "</div>\n</li>\n    ");
    });
    var chartListHtml = aChartListHtml.reduce(function (previous, current) {
      return previous + current;
    }, '');
    var footerHtml = config.footer ? "\n  <div class=\"".concat(style.footer, "\" style=\"height: ").concat(config.footer.height, ";\">\n    <img class=\"").concat(style.fullImg, "\" width=\"100%\" height=\"100%\" src=\"").concat(config.footer.img, "\" alt=\"image\"/>\n  </div>\n  ") : '';
    return "\n<div class=\"swiper swiper-container ".concat(style.main, "\">\n  <div class=\"swiper-wrapper ").concat(style.swiperWrapper, "\">\n    <ul class=\"swiper-slide ").concat(style.chartList, "\">").concat(chartListHtml, "</ul>\n  </div>\n</div>\n").concat(footerHtml, "\n  ");
  });

  // private
  var _formattingCustomValue = function _formattingCustomValue(inputValue) {
    if (isString(inputValue)) {
      return inputValue;
    }
    return "".concat(inputValue, "px");
  };
  var _chartListHandle = function _chartListHandle(chartList) {
    return chartList.map(function (config, index) {
      var insideConfig = config;
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
  };
  var SimulateChat = /*#__PURE__*/function () {
    /**
     * @param context
     * @param footer
     * @param chartList
     * @param sound
     * @param SwiperModule
     */
    function SimulateChat(context, _ref) {
      var _ref$footer = _ref.footer,
        footer = _ref$footer === void 0 ? null : _ref$footer,
        _ref$chartList = _ref.chartList,
        chartList = _ref$chartList === void 0 ? [] : _ref$chartList,
        _ref$sound = _ref.sound,
        sound = _ref$sound === void 0 ? '' : _ref$sound,
        _ref$SwiperModule = _ref.SwiperModule,
        SwiperModule = _ref$SwiperModule === void 0 ? null : _ref$SwiperModule;
      _classCallCheck(this, SimulateChat);
      this.el = {};
      this.el.context = isString(context) ? document.querySelector(context) : context;
      this.el.context.style.position = 'relative';

      // handle chartList
      _chartListHandle(chartList);
      this.config = {
        width: this.el.context.getBoundingClientRect().width,
        chartList: chartList,
        footer: null,
        sound: null,
        SwiperModule: SwiperModule || window.Swiper
      };
      this.state = {
        next: null,
        isPausing: true,
        done: false,
        busy: false,
        soundUnlock: false,
        soundMuted: true
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
    return _createClass(SimulateChat, [{
      key: "start",
      value: function start() {
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
    }, {
      key: "pause",
      value: function pause() {
        this.state.isPausing = true;
        return this;
      }

      /**
       * Reset patterns.
       * @return {SimulateChat}
       */
    }, {
      key: "reset",
      value: function reset() {
        // set state
        this.state.isPausing = true;
        this.state.done = false;
        this.state.busy = false;
        this.state.next = null;

        // reset ui
        this.el.chartListChds.forEach(function (el) {
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
    }, {
      key: "_showOne",
      value: function _showOne() {
        var _this = this;
        // stage 1
        if (!this.state.next) {
          this.state.next = this.el.chartList.firstElementChild;
        }
        return new Promise(function (resolve, reject) {
          _this.state.busy = true;
          var delay = _this.state.next.dataset.delay || 1500;
          setTimeout(function () {
            if (_this.state.isPausing) {
              _this.state.busy = false;
              reject();
            } else {
              resolve();
            }
          }, delay);
        }).then(function () {
          return new Promise(function (resolve) {
            // stage 2
            var needPause = Boolean(_this.state.next.dataset.pause);
            var needSound = !_this.state.next.dataset.muted;
            var hasCallback = Boolean(_this.state.next.dataset.callback);
            if (needSound) {
              _this._soundPlay();
            }
            _this.state.next.classList.add(style.show);
            _this.swiper.updateSlides();
            _this._scrollToBottom();

            // run callback
            if (hasCallback) {
              _this.config.chartList[_this.state.next.dataset.index].callback();
            }

            // set next
            _this.state.next = _this.state.next.nextElementSibling;
            setTimeout(function () {
              return resolve(needPause);
            }, 0);
          });
        }).then(function (needPause) {
          if (!_this.state.next) {
            // done
            _this.state.done = true;
            _this.state.isPausing = true;
            _this.state.busy = false;
            return Promise.resolve();
          }
          if (!needPause) {
            return _this._showOne();
          }
          _this.state.busy = false;
          return Promise.resolve();
        })["catch"](function () {
          _this.state.busy = false;
        });
      }

      /**
       * Initialization UI
       * @private
       */
    }, {
      key: "_initUI",
      value: function _initUI() {
        this.el.container = document.createElement('div');
        this.el.container.classList.add(style.container);
        this.el.container.innerHTML = containerTemplate({
          style: style,
          config: this.config
        });
        this.el.context.appendChild(this.el.container);
        this.el.swiperContainer = this.el.container.querySelector(".".concat(style.main));
        this.el.swiperWrapper = this.el.container.querySelector(".".concat(style.swiperWrapper));
        this.el.chartList = this.el.swiperWrapper.querySelector(".".concat(style.chartList));
        this.el.chartListChds = Array.prototype.slice.call(this.el.chartList.children);
        this.config.swiperContainer = {
          height: this.el.swiperContainer.getBoundingClientRect().height
        };
        this.swiper = new this.config.SwiperModule(this.el.swiperContainer, {
          nested: true,
          direction: 'vertical',
          slidesPerView: 'auto',
          freeMode: true,
          mousewheel: true
        });
      }

      /**
       * Initialization sound
       * @private
       */
    }, {
      key: "_soundInit",
      value: function _soundInit() {
        var _this2 = this;
        var _soundLoad2 = function _soundLoad() {
          if (!_this2.config.sound.load) {
            _this2.config.sound.load();
          }
          _this2._soundUnlock();
          document.body.removeEventListener('touchstart', _soundLoad2);
        };
        document.body.addEventListener('touchstart', _soundLoad2, false);
      }

      /**
       * Scroll To Bottom
       * @param speed
       * @private
       */
    }, {
      key: "_scrollToBottom",
      value: function _scrollToBottom() {
        var speed = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 200;
        var chartListHeight = this.el.chartList.getBoundingClientRect().height;
        var distance = this.config.swiperContainer.height - chartListHeight;
        if (distance > 0) {
          return;
        }
        this.el.swiperWrapper.style.cssText = "transition-duration: ".concat(speed, "ms; transform: translate3d(0px, ").concat(distance, "px, 0px);");
      }

      /**
       * Scroll To Top
       * @param speed
       * @private
       */
    }, {
      key: "_scrollToTop",
      value: function _scrollToTop() {
        var speed = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 200;
        this.el.swiperWrapper.style.cssText = "transition-duration: ".concat(speed, "ms; transform: translate3d(0px, 0px, 0px);");
      }

      /**
       * play sound
       * @private
       */
    }, {
      key: "_soundPlay",
      value: function _soundPlay() {
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
    }, {
      key: "_soundUnlock",
      value: function _soundUnlock() {
        var _this3 = this;
        if (this.state.soundUnlock) {
          return;
        }
        this.config.sound.muted = true;
        this.config.sound.play();
        setTimeout(function () {
          if (isAudioPlaying(_this3.config.sound)) {
            _this3.state.soundUnlock = true;
            _this3.config.sound.pause();
            if (!_this3.state.soundMuted) {
              _this3.config.sound.muted = false;
            }
          }
        }, 0);
      }
    }]);
  }();

  return SimulateChat;

}));
