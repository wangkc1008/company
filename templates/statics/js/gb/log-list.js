/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.logList = logList;

	var _tools = __webpack_require__(2);

	var _paginator = __webpack_require__(3);

	var _ajaxLoadParse = __webpack_require__(4);

	__webpack_require__(5);

	var _forms = __webpack_require__(6);

	var Forms = _interopRequireWildcard(_forms);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

	function logList() {
	    //分页
	    var pn = (0, _tools.getQueryString)('pn') ? (0, _tools.getQueryString)('pn') : 1;
	    var paginator = new _paginator.YisaPaginator($('#pagination'), {
	        type: 'href',
	        href: ajaxURL.select,
	        current: pn,
	        totalPage: totalPages,
	        skip: false
	    });

	    $(".btn-search").on("click", function () {
	        if (!Forms.validation.time(30)) return false;

	        $("#searchForm").submit();
	    });

	    $(".carousel-inner .item").each(function (i) {
	        if (i == 0) {
	            $(this).addClass("active");
	        }
	    });

	    $(".view-face").on("click", function () {
	        var faceUrl = $(this).data("json");
	        (0, _ajaxLoadParse.ajaxLoad)({
	            type: "get",
	            url: faceUrl,
	            dataType: "json"
	        }, function (res) {
	            (0, _ajaxLoadParse.ajaxLoadParse)(res, function () {});
	        });
	    });
	}

/***/ }),
/* 2 */
/***/ (function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	/**
	 * 获取地址栏参数
	 * @param name
	 * @returns {null}
	 * @constructor
	 */
	function getQueryString(name) {
	  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
	  var r = window.location.search.substr(1).match(reg);
	  if (r != null) return decodeURI(r[2]);
	  return null;
	}

	exports.getQueryString = getQueryString;

/***/ }),
/* 3 */
/***/ (function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var YisaPaginator = exports.YisaPaginator = function () {
	    function YisaPaginator(elem, options) {
	        _classCallCheck(this, YisaPaginator);

	        this.defaults = {
	            size: '', //默认标准大小，可选pagination-lg 或 pagination-sm
	            type: 'ajax', //默认ajax，可选，href
	            href: 'javascript:void(0)', //默认采用ajax,链接不可点击
	            current: 1, //当前页面，默认第一页
	            totalPage: 0, //总共页数，默认为0，如果同时设置total与per，此参数将不起作用
	            totalNum: 0, //总共数据条数
	            per: 0, //每页数据条数
	            skip: true, //是否可以直接跳转到某页
	            ajaxLoadFirst: false //是否使用ajax加载第一页
	        };
	        this.options = $.extend({}, this.defaults, options);
	        this.pageContainer = $(elem).empty();
	        this.currentPage = parseInt(this.options.current);
	        if (this.options.totalNum && this.options.per) {
	            this.lastPage = Math.ceil(this.options.totalNum / this.options.per);
	        } else {
	            this.lastPage = this.options.totalPage;
	        }
	        this.ajaxStatus = false;
	        this.ul = $('<ul></ul>').addClass('pagination ' + this.options.size);
	        this._render();
	        this._skipTo();
	    }

	    /**
	     * ajax方式时，触发回调
	     * @param cb 回调函数
	     */


	    _createClass(YisaPaginator, [{
	        key: 'triggerCallback',
	        value: function triggerCallback(cb) {
	            if (this.options.type == 'ajax') {
	                this.ul.on('click', 'li:not(.disabled)', cb);
	                if (this.options.ajaxLoadFirst) {
	                    this.ul.find("li:eq(1)").click();
	                }
	            }
	        }

	        /**
	         * 跳转到指定界面
	         * @param n
	         */

	    }, {
	        key: 'goPage',
	        value: function goPage(n) {
	            n = parseInt(n);
	            if (n < 1) return;
	            this.currentPage = n;
	            this._render();
	        }

	        /**
	         * 渲染分页界面
	         * @private
	         */

	    }, {
	        key: '_render',
	        value: function _render() {
	            if (this.lastPage < 1) {
	                this.pageContainer.empty();
	                return;
	            }
	            if (this.currentPage > this.lastPage) this.currentPage = this.lastPage;
	            var cp = this.currentPage,
	                lp = this.lastPage;

	            var prev = cp > 1 ? this._addItem(cp - 1, '上一页') : this._addItem(cp, '上一页', 'disabled');
	            var next = cp < lp ? this._addItem(cp + 1, '下一页') : this._addItem(cp, '下一页', 'disabled');
	            var first = cp == 1 ? this._addItem(1, 1, 'active') : this._addItem(1, 1);
	            var last = cp == lp ? this._addItem(lp, lp, 'active') : this._addItem(lp, lp);
	            if (lp == 1) last = '';
	            var pages = [];
	            if (cp < 5) {
	                for (var i = 2; i < 6 && i < lp; i++) {
	                    var page = i == cp ? this._addItem(cp, cp, 'active') : this._addItem(i, i);
	                    pages.push(page);
	                }
	            } else if (cp + 4 > lp) {
	                for (var _i = lp - 4; _i < lp; _i++) {
	                    if (_i == 1) continue;
	                    var _page = _i == cp ? this._addItem(cp, cp, 'active') : this._addItem(_i, _i);
	                    pages.push(_page);
	                }
	            } else {
	                for (var _i2 = cp - 2; _i2 < cp + 3; _i2++) {
	                    var _page2 = _i2 == cp ? this._addItem(cp, cp, 'active') : this._addItem(_i2, _i2);
	                    pages.push(_page2);
	                }
	            }
	            var ellipsis1 = pages.length && pages[0].data('pn') > 2 ? this._addItem(0, '...', 'disabled') : '';
	            var ellipsis2 = pages.length && pages[pages.length - 1].data('pn') < lp - 1 ? this._addItem(0, '...', 'disabled') : '';
	            var skip = '';
	            if (this.options.skip) skip = '<span class="skip form-inline">\u8DF3\u8F6C\u5230<input type="text" class="js-skip input-sm form-control" data-toggle="tooltip" data-placement="top" data-trigger="focus" title="\u8F93\u5165\u9875\u7801\u540E\u56DE\u8F66\u5373\u53EF\u8DF3\u8F6C">\u9875</span>';
	            this.ul.empty().append(prev, first, ellipsis1, pages, ellipsis2, last, next, skip).appendTo(this.pageContainer);
	            $('.js-skip').tooltip();
	        }

	        /**
	         * 生成分页的单个元素
	         * @param data 每个元素对应的页数
	         * @param name 每个元素要显示的文字
	         * @param status 当前元素状态，'',active,disabled
	         * @returns {jQuery}
	         * @private
	         */

	    }, {
	        key: '_addItem',
	        value: function _addItem(data, name) {
	            var status = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

	            var li = $('<li></li>').addClass(status).data('pn', data);
	            if ('...' == name) {
	                var el = $('<span></span>');
	                el.html(name).addClass('ellipsis').appendTo(li);
	                return li;
	            }
	            if ('href' == this.options.type) {
	                var _el = $('<a></a>');
	                _el.html(name).attr('href', this.options.href + '&pn=' + data).appendTo(li);
	            } else {
	                var _el2 = $('<span></span>');
	                _el2.html(name).appendTo(li);
	            }
	            return li;
	        }
	    }, {
	        key: '_skipTo',
	        value: function _skipTo() {
	            var _this = this;
	            this.ul.on('keyup', '.js-skip', function (e) {
	                if (e.keyCode == 13) {
	                    var v = parseInt(this.value);
	                    if (!v) {
	                        alert('请输入数字');
	                        return false;
	                    }
	                    _this.goPage(this.value);
	                    _this.ul.find('.active').click();
	                }
	            });
	        }
	    }]);

	    return YisaPaginator;
	}();

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.ajaxLoadParse = exports.ajaxLoad = undefined;

	var _modal = __webpack_require__(5);

	/**
	 * 搜索结果页，格式化ajax返回数据
	 * @param e  ajax返回数据
	 * @param cb  解析data的回掉
	 */
	function ajaxLoadParse(e, cb) {
	    var _e$status = e.status,
	        status = _e$status === undefined ? 1 : _e$status,
	        message = e.message;

	    if (status == 3) {
	        (0, _modal.showTipModal)({
	            title: '登录超时',
	            content: '<p class="text-danger">由于长时间没有使用，系统自动退出登录状态，5秒钟后跳转至登录界面</p>',
	            timeout: 5000,
	            refresh: 1
	        });
	        return;
	    }
	    if (!parseInt(status)) {
	        cb(e);
	    } else {
	        alert(message);
	    }
	}

	/**
	 * 搜索结果页，发送ajax请求
	 * @param u ajax请求参数
	 * @param cb1,cb2 回调函数
	 */
	function ajaxLoad(u, cb1, cb2) {
	    var cb = !cb2 ? function () {} : cb2;
	    $.ajax(u).done(cb1).done(cb).fail(function () {
	        alert("服务器连接失败");
	    });
	}

	exports.ajaxLoad = ajaxLoad;
	exports.ajaxLoadParse = ajaxLoadParse;

/***/ }),
/* 5 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	/**
	 * 点击图片，显示大图
	 */
	var branch = void 0;
	if (typeof searchBranch === 'undefined') {
	  branch = 'common';
	} else {
	  branch = searchBranch;
	}
	if (typeof IS_VIDEO_CAR != 'undefined' && IS_VIDEO_CAR) {
	  $(' .search-result').on('click', '.cloud-zoom', function (ev) {
	    showBigPic(this, 1);
	  });
	} else {
	  $(' .search-result').on('click', '.mousetrap', function (ev) {
	    showBigPic(this);
	  });
	}

	$('#alarm-list-body').on('click', '.pic-button', function (ev) {
	  var windowHeight = $(window).height();
	  var windowWidth = $(window).width();
	  var windowPro = (windowWidth - 80) / (windowHeight - 60);

	  var title = $(this).prev().attr('title');
	  $('.carousel').carousel(parseInt(title) - 1);
	  $('#myModal .modal-title').html(title);
	  $('.carousel-inner').find('div').eq(parseInt(title) - 1).addClass('active');

	  var screenImage = $('.carousel-inner').find('div.item.active span.pic').children('img');
	  var theImage = new Image();
	  theImage.src = screenImage.attr('src');
	  // Get accurate measurements from that.
	  var imageWidth = void 0;
	  if ($('.carousel-inner').find('div.item.active').children('span').length > 1) {
	    imageWidth = theImage.width * 2;
	  } else {
	    imageWidth = theImage.width;
	  }
	  var imageHeight = theImage.height;
	  var imgPro = imageWidth / imageHeight;
	  if (windowPro > imgPro) {
	    $('#myModal .modal-dialog').css({
	      'width': imageWidth * (windowHeight - 60) / imageHeight,
	      'height': 'auto'
	    });
	  } else {
	    $('#myModal .modal-dialog').css({
	      'width': 'auto',
	      'height': imageHeight * (windowWidth - 80) / imageWidth
	    });
	  }
	  $('#myModal').modal();
	  $('#message-carousel').on('slid.bs.carousel', function () {
	    var screenImage = $('.carousel-inner').find('div.item.active span.pic').children('img');
	    var theImage = new Image();
	    if (screenImage.attr('src')) {
	      theImage.src = screenImage.attr('src');
	    } else {
	      $('.carousel-inner').find('div.item.active span.pic').children('img').attr('src', '/images/result-error-bg.jpg');
	      theImage.src = screenImage.attr('src');
	    }
	    var imageWidth = void 0;
	    if ($('.carousel-inner').find('div.item.active').children('span').length > 1) {
	      imageWidth = theImage.width * 2;
	    } else {
	      imageWidth = theImage.width;
	    }
	    var imageHeight = theImage.height;
	    var windowHeight = $(window).height();
	    var windowWidth = $(window).width();
	    var imgPro = imageWidth / imageHeight;
	    if (windowPro > imgPro) {
	      $('#myModal .modal-dialog').css({
	        'width': imageWidth * (windowHeight - 60) / imageHeight,
	        'height': 'auto'
	      });
	    } else {
	      $('#myModal .modal-dialog').css({
	        'width': 'auto',
	        'height': imageHeight * (windowWidth - 80) / imageWidth
	      });
	    }

	    var title = $('#message-carousel .active').attr('title');
	    $('#myModal .modal-title').html(title);
	  });
	});

	function showBigPic(obj, is_video) {
	  var windowHeight = $(window).height();
	  var windowWidth = $(window).width();
	  var windowPro = (windowWidth - 80) / (windowHeight - 60);
	  var title = '';
	  if (is_video) {
	    title = $(obj).attr('title');
	  } else {
	    title = $(obj).prev().attr('title');
	  }
	  var featureText = $(obj).attr('data-feature_text'); // 特征字段
	  // console.log(title)
	  $(' .carousel').carousel(parseInt(title) - 1);
	  if (featureText) {
	    $('#myModal .modal-title').html(title + '<br/>\u8F66\u8F86\u7279\u5F81\uFF1A' + featureText);
	  } else {
	    $('#myModal .modal-title').html(title);
	  }
	  $(' .carousel-inner').find('div.item').eq(parseInt(title) - 1).addClass('active');

	  var screenImage = $(' .carousel-inner').find('div.item.active span.pic').children('img');
	  var theImage = new Image();
	  theImage.src = screenImage.attr('src');
	  // Get accurate measurements from that.
	  var imageWidth = void 0;
	  if ($(' .carousel-inner').find('div.item.active').children('span').length > 1) {
	    imageWidth = theImage.width * 2;
	  } else {
	    imageWidth = theImage.width;
	  }
	  var imageHeight = theImage.height;
	  var imgPro = imageWidth / imageHeight;
	  if (windowPro > imgPro) {
	    $('#myModal .modal-dialog').css({
	      'width': imageWidth * (windowHeight - 60) / imageHeight,
	      'height': 'auto'
	    });
	  } else {
	    $('#myModal .modal-dialog').css({
	      'width': 'auto',
	      'height': imageHeight * (windowWidth - 80) / imageWidth
	    });
	  }
	  $('#myModal').modal();

	  //以图搜车画特征图
	  if (branch == 'customPhoto') {
	    $('#myModal').off('shown.bs.modal').on('shown.bs.modal', function () {
	      drawSvg();
	    });
	  }
	  $('#message-carousel').on('slid.bs.carousel', function () {
	    var screenImage = $(' .carousel-inner').find('div.item.active span.pic').children('img');
	    var theImage = new Image();
	    if (screenImage.attr('src')) {
	      theImage.src = screenImage.attr('src');
	    } else {
	      $(' .carousel-inner').find('div.item.active span.pic').children('img').attr('src', '/images/result-error-bg.jpg');
	      theImage.src = screenImage.attr('src');
	    }
	    var imageWidth = void 0;
	    if ($(' .carousel-inner').find('div.item.active').children('span').length > 1) {
	      imageWidth = theImage.width * 2;
	    } else {
	      imageWidth = theImage.width;
	    }
	    var imageHeight = theImage.height;
	    var windowHeight = $(window).height();
	    var windowWidth = $(window).width();
	    var imgPro = imageWidth / imageHeight;
	    if (windowPro > imgPro) {
	      $('#myModal .modal-dialog').css({
	        'width': imageWidth * (windowHeight - 60) / imageHeight,
	        'height': 'auto'
	      });
	    } else {
	      $('#myModal .modal-dialog').css({
	        'width': 'auto',
	        'height': imageHeight * (windowWidth - 80) / imageWidth
	      });
	    }

	    var title = $('#message-carousel .active').attr('title');
	    featureText = $('#message-carousel .active').attr('data-feature_text');
	    if (featureText) {
	      $('#myModal .modal-title').html(title + '<br/>\u8F66\u8F86\u7279\u5F81\uFF1A' + featureText);
	    } else {
	      $('#myModal .modal-title').html(title);
	    }
	    //以图搜车画特征图
	    if (branch == 'customPhoto') {
	      drawSvg();
	    }
	  });
	}
	//以图搜车画特征图
	function drawSvg() {

	  //绘制svg
	  var mubiao = $('.carousel-inner').find('div.item.active span.pic-l');
	  //小图宽高
	  var containerW = mubiao.width();
	  var containerH = mubiao.height();
	  //原大图宽高
	  var bImgW = mubiao.children('img')[1].width;
	  var bImgH = mubiao.children('img')[1].height;
	  //比例
	  var wid = containerW / bImgW;
	  var hid = containerH / bImgH;
	  //特征图
	  var feature = JSON.parse(detection);
	  $('#SvgjsSvg1000 .image').css({
	    'width': '25px',
	    'height': '25px'
	  });
	  $('#myDraw').html('');
	  var draw = new SVG('myDraw').size(containerW, containerH);
	  $('#myDraw').css({
	    'width': '50%',
	    'height': '100%',
	    'position': 'fixed',
	    'top': '51px',
	    'left': 0
	  });
	  var rect = draw.rect(feature.w * wid, feature.h * hid).fill('transparent').stroke({
	    color: '#7bfd6a',
	    width: 2
	  }).move(feature.x * wid + 15, feature.y * hid + 15).attr('display', 'block');
	  var image = draw.image(window.staticsUrl + '/images/pic_target.png').move(feature.x * wid + feature.w * wid - 10, feature.y * hid + 15).attr('display', 'block');
	}
	// 轨迹重现，一车一档点击小图出现大图

	function showBigPicOne(obj) {
	  var windowHeight = $(window).height();
	  var windowWidth = $(window).width();
	  var windowPro = (windowWidth - 80) / (windowHeight - 60);

	  var title = $(obj).data('info'),
	      psrc = $(obj).find('img').attr('src');
	  $('#myModal .modal-title').html(title);
	  var theImage = new Image();
	  theImage.src = psrc;

	  $(' .carousel-inner').html('<span class="pic"><img src="' + psrc + '" style="width:100%;"></span>');
	  // Get accurate measurements from that.
	  var imageWidth = theImage.width;
	  var imageHeight = theImage.height;
	  var imgPro = imageWidth / imageHeight;
	  if (windowPro > imgPro) {
	    $('#myModal .modal-dialog').css({
	      'width': imageWidth * (windowHeight - 60) / imageHeight,
	      'height': 'auto'
	    });
	  } else {
	    $('#myModal .modal-dialog').css({
	      'width': 'auto',
	      'height': imageHeight * (windowWidth - 80) / imageWidth
	    });
	  }
	  $('#myModal').modal();
	}
	/**
	 * 显示模态框
	 * @param e {e.title：模态框标题, e.content: 模态框内容，支持html代码, refresh: 如果需要关闭或定时自动刷新，此处填入自动刷新毫秒数}
	 */
	function showTipModal(e) {
	  var title = e.title,
	      content = e.content,
	      timeout = e.timeout,
	      refresh = e.refresh;

	  var t = $('#tipModal');

	  t.find(' .modal-title').html(title);
	  t.find(' .modal-body').html(content);

	  t.modal('show');

	  if (timeout) setTimeout(function () {
	    t.modal('hide');
	    if (refresh) location.href = location.href;
	  }, timeout);

	  if (refresh) t.off('hide.bs.modal').on('hide.bs.modal', function () {
	    location.href = location.href;
	  });
	}

	exports.showTipModal = showTipModal;
	exports.showBigPic = showBigPic;
	exports.showBigPicOne = showBigPicOne;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.plateFormat = exports.plateNumCity = exports.multiSelect = exports.searchSelect = exports.inputFocus = exports.brandLoad = exports.validation = exports.popoverTime = exports.carPlateFunc = exports.clearPlateNumber = exports.carBrandFun = undefined;

	var _yisaSelect = __webpack_require__(7);

	var _tools = __webpack_require__(2);

	var Store = {
	  topH: $('#navbar').height() + $(' .nav-footer').height()
	};
	var mapHeight = function mapHeight(topH) {
	  var winH = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : $(window).height();

	  $(' .map-parent').css({
	    'height': winH - topH
	  });
	  $(' .left-parent').css({
	    'height': winH - topH - 30
	  });
	  $(' .left-parent').find(' .panel-body').css({
	    'height': winH - topH - 30 - 34 - 53
	  });
	};
	mapHeight(Store.topH);
	$(window).resize(function () {
	  return mapHeight(Store.topH);
	});
	// 设置滚动条样式  使用插件
	if ($(' .left-parent').length > 0) {
	  $(' .left-parent').find(' .panel-body').niceScroll({
	    cursorcolor: '#ddd',
	    autohidemode: false
	  });
	} else if ($(' .main-fuzzy .left-option').length > 0) {
	  getScroll();
	  $(window).resize(function () {
	    return getScroll();
	  });
	}
	function getScroll() {
	  $(' .main-fuzzy .left-option').css({
	    'height': $(window).height() - Store.topH
	  });
	  $(' .main-fuzzy .left-option').niceScroll({
	    cursorcolor: '#fff',
	    autohidemode: false
	  });
	}

	var browser = navigator.appName;
	/*const trim_Version = navigator.appVersion.split(';')[1].replace(/[ ]/g, '')*/
	//品牌加载
	var brandLoad = {
	  tdOffsetArr: [],
	  brandsArr: [],
	  hotBrandsArr: [],
	  car: {
	    brand: {},
	    model: {},
	    year: {}
	  },
	  picked: {
	    brand: '',
	    model: [],
	    year: []
	  },
	  modelFlag: true, // 只选择品牌的时候，可以把这里设置为false
	  yearFlag: true, //  只选择品牌的时候，可以把这里设置为false
	  controlElem: '', // 控制元素id
	  sourceId: 1, // 用于标识是车头还是车尾年款 1 车头 2 车尾
	  sourceYear1: {},
	  sourceYear2: {},
	  _init: function _init() {
	    var _this = this;
	    if (ajaxURL.brandList) {
	      $.ajax({
	        url: ajaxURL.brandList,
	        type: 'get',
	        async: false,
	        dataType: 'json'
	      }).done(function (json) {
	        var brands = json.brands,
	            hotBrands = json.hotBrands;

	        for (var i = 0, l = brands.length; i < l; i++) {
	          _this.brandsArr[i] = {
	            'id': brands[i][4],
	            'char': brands[i][3].trim().charAt(0).toUpperCase(),
	            'name': brands[i][1],
	            'longChar': brands[i][2],
	            'shortChar': brands[i][3]
	          };
	        }
	        _this.brandsArr.sort(function (a, b) {
	          return a.char.charCodeAt(0) - b.char.charCodeAt(0);
	        });
	        for (var _i = 0, _l = hotBrands.length; _i < _l; _i++) {
	          var _index = parseInt(hotBrands[_i]);
	          _this.hotBrandsArr[_i] = {
	            'id': brands[_index - 1][4],
	            'char': '热门',
	            'name': brands[_index - 1][1],
	            'longChar': brands[_index - 1][2],
	            'shortChar': brands[_index - 1][3]
	          };
	        }
	        // 设置位置
	        _this.setPosition();
	        _this._brandTemplate(_this.brandsArr, _this.hotBrandsArr);
	        // 点击字母，跳转到对应的列表
	        _this._charClick();
	        // 加载车型和年款
	        _this._brandModelYear();
	        // 点击车型
	        _this._modelClick();
	        // 点击年款
	        _this._yearClick();
	        // 选择
	        _this._pickClick();
	        // 搜索
	        _this._searchEvt();
	      }).fail(function () {
	        alert('服务器连接失败');
	      });
	    }
	  },
	  _refreshModelYear: function _refreshModelYear(id) {
	    var _this = this;
	    if (_this.sourceId != id) {
	      // debugger
	      _this.sourceId = id;
	      $('.brand-group').find('.car-model').html('');
	      $('.brand-group').find('.car-year').html('');
	      _this.car.year = _this['sourceYear' + _this.sourceId];

	      // 点击车型
	      _this._modelClick();
	      // 点击年款
	      _this._yearClick();
	      // 选择
	      _this._pickClick();
	      // 搜索
	      _this._searchEvt();
	    }
	  },
	  // $('.left-parent').outerWidth()  $('.left-parent').offset().left
	  // 设置位置 相对于某元素的相对位置
	  setPosition: function setPosition() {
	    if ($(' .left-parent').length > 0) {
	      $(' .brand-group').css({ 'left': $(' .left-parent').outerWidth() + $(' .left-parent').offset().left });
	    } else if ($(' .container-right').length > 0) {
	      //自定义搜车和以图搜车
	      $(' .brand-group').css({ 'left': $(window).width() - 545 });
	    } else if ($(' .left-option').length > 0) {
	      //模糊搜车
	      $(' .brand-group').css({ 'left': $(window).width() - 545 });
	    }
	  },
	  _brandTemplate: function _brandTemplate(arr, hotArr) {
	    var num_template = '<li data-target="#char_hot" data-index="0">热门</li>';
	    var template = '<dt id="char_hot">热门</dt>';
	    for (var i = 0, l = hotArr.length; i < l; i++) {
	      template += '<dd data-brandid="' + hotArr[i].id + '">' + hotArr[i].name + '</dd>';
	    }
	    var charNum = 0;
	    var charFlag = '';
	    for (var _i2 = 0, _l2 = arr.length; _i2 < _l2; _i2++) {
	      if (charFlag != arr[_i2].char) {
	        charFlag = arr[_i2].char;
	        num_template += '<li data-target="#char_' + charNum + '" data-index="' + (charNum + 1) + '">' + charFlag + '</li>';
	        template += '<dt id="char_' + charNum + '">' + charFlag + '</dt>';
	        charNum += 1;
	      }
	      template += '<dd data-brandid="' + arr[_i2].id + '" title="' + arr[_i2].name + '">' + arr[_i2].name + '</dd>';
	    }
	    $(' .brand-num').html(num_template);
	    $(' .brand-warp').html(template);
	  },
	  _charClick: function _charClick() {
	    var _this = this;
	    // 让brand-group现实一下再隐藏，是为了获取char的offset()
	    $(' .brand-group').show();
	    $(' .brand-num').find('li').each(function (index, item) {
	      var _index = index,
	          _id = $(item).data('target');
	      _this.tdOffsetArr[_index] = $(_id).offset().top - $('.brand-warp').offset().top;
	    });
	    $(' .brand-group').hide();
	    $(' .brand-num').find('li').off('click').on('click', function () {
	      var $this = $(this);
	      $(' .brand-warp').scrollTop(_this.tdOffsetArr[$this.data('index')]);
	      $(' .car-model').hide();
	      $(' .car-year').hide();
	    });
	  },
	  _brandModelYear: function _brandModelYear() {
	    var _this = this;
	    $.ajax({
	      url: ajaxURL.brandModelYear,
	      type: 'get',
	      async: false,
	      dataType: 'json'
	    }).done(function (json) {
	      // _this.car = json
	      _this.car.brand = json.brand;
	      _this.car.model = json.model;
	      _this.sourceYear1 = json.year;
	      _this.sourceYear2 = json.year2;
	      if (_this.sourceId == 1) {
	        _this.car.year = _this.sourceYear1;
	      } else {
	        _this.car.year = _this.sourceYear2;
	      }
	    }).fail(function () {
	      alert('服务器连接失败');
	    });
	  },
	  _pickClick: function _pickClick() {
	    var _this = this;
	    // 点击品牌
	    $(' .brand-warp').find('dd').off('click');
	    $(' .brand-warp').on('click', 'dd', function () {
	      // debugger;
	      // $('.brand-warp').find('dd').off('click').on('click', function () {
	      var $thisBrand = $(this),
	          thisBrandId = $thisBrand.data('brandid'),
	          thisBrandText = $thisBrand.text();
	      var model_template = void 0;
	      $thisBrand.addClass('current').siblings('.current').removeClass('current');
	      // 如果品牌不是已选品牌或未选品牌
	      if (_this.picked.brand != thisBrandId) {
	        // $thisBrand.addClass('picked').siblings('.picked').removeClass('picked');
	        $(' .car-year').hide(); // 隐藏年款
	        if (_this.picked.model.length > 0) {
	          $(' .car-model').find('.picked').each(function () {
	            $(this).removeClass('picked');
	          });
	        }
	        if (_this.picked.year.length > 0) {
	          $(' .car-year').find('.picked').each(function () {
	            $(this).removeClass('picked');
	          });
	        }
	        _this.picked.brand = thisBrandId;
	        _this.picked.model = [];
	        _this.picked.year = [];
	        // 允许加载车型和年款的时候
	        if (_this.modelFlag) {
	          model_template = _this._modelYearTemplate(thisBrandText, _this.car.model[thisBrandId], 1);
	          $(' .car-model').html(model_template).show();
	        }
	      }
	      // 数据展示
	      _this._show();
	      // // 点击车型
	      // _this._modelClick(thisBrandId);
	    });
	  },
	  /**
	   * 车型和年款html模板函数
	   * brandName: String
	   * arr: [{ },{ }]
	   * */
	  _modelYearTemplate: function _modelYearTemplate(brandName, arr, searchFlag) {
	    var template = '';
	    if (searchFlag) {
	      // ie8隐藏筛选
	      if (navigator.userAgent.indexOf('MSIE 9.0') <= 0 && window.innerWidth) {
	        template = '<dt><input class="search-car" type="text" placeholder="\u641C\u7D22"></dt>';
	      }
	    } else {
	      template = '<dt>' + brandName + '</dt>';
	    }
	    // let template = `<dt>${brandName}<span class="search-model"><input type="text" placeholder="输入车型进行搜索"></span></dt>`;
	    // let template = `<dt><input class="search-car" type="text" placeholder="搜索"></dt>`;
	    for (var i = 0, l = arr.length; i < l; i++) {
	      if (i == 0) {
	        if (searchFlag) {
	          if (navigator.userAgent.indexOf('MSIE 9.0') <= 0 && window.innerWidth) {
	            template += '<dd title="' + arr[i].v + '" class="dd-original dd-first" data-myid="' + arr[i].k + '">' + arr[i].v + '<i class="glyphicon"></i></dd>';
	          }
	        } else {
	          template += '<dd title="' + arr[i].v + '" class="dd-original dd-first" data-myid="' + arr[i].k + '">' + arr[i].v + '<i class="glyphicon"></i></dd>';
	        }
	      } else {
	        template += '<dd title="' + arr[i].v + '" class="dd-original" data-myid="' + arr[i].k + '">' + arr[i].v + '<i class="glyphicon"></i></dd>';
	      }
	    }
	    return template;
	  },
	  /**
	   * 车型点击事件
	   * */
	  _modelClick: function _modelClick() {
	    var _this = this;
	    // let thisBrandId = brandId;
	    // $(' .car-model').find('dd').off('click')
	    $(' .car-model').off('click').on('click', 'dd', function () {
	      // $('.car-model').find('dd').off('click').on('click', function () {
	      //     debugger;
	      var $thisModel = $(this),
	          thisModelId = $thisModel.data('myid'),
	          thisModelText = $thisModel.text();
	      if (thisModelId == '') {
	        return false;
	      }
	      var year_template = void 0;
	      if ($.inArray(thisModelId, _this.picked.model) == -1) {
	        // 加入数组 并 设置显示状态
	        _this.picked.model.push(thisModelId);
	        $thisModel.addClass('picked');
	        if (_this.picked.model.length == 1) {
	          year_template = _this._modelYearTemplate(thisModelText, _this.car.year[thisModelId]);
	          $(' .car-year').html(year_template).show();
	          $(' .car-year').find('dt').outerWidth('198px');
	        } else {
	          $(' .car-year').hide();
	          _this.picked.year = [];
	        }
	      } else {
	        // 从数组中去除 并 设置显示状态
	        _this.picked.model = _this.picked.model.filter(function (f) {
	          return f != thisModelId;
	        });
	        $thisModel.removeClass('picked');
	        if (_this.picked.model.length == 1) {
	          var pickedText = $thisModel.siblings('.picked').text(),
	              pickedId = $thisModel.siblings('.picked').data('myid');
	          year_template = _this._modelYearTemplate(pickedText, _this.car.year[pickedId]);
	          $(' .car-year').html(year_template).show();
	          $(' .car-year').find('dt').outerWidth($(' .car-year').find(' .dd-first').outerWidth());
	        } else if (_this.picked.model.length == 0) {
	          $(' .car-year').hide();
	          _this.picked.year = [];
	        }
	      }
	      // 数据展示
	      _this._show();
	      // // 点击年款
	      // _this._yearClick();
	    });
	  },
	  /**
	   * 年款点击事件
	   * */
	  _yearClick: function _yearClick() {
	    var _this = this;
	    // $(' .car-year').find('dd').off('click')
	    $(' .car-year').off('click').on('click', 'dd', function () {
	      // $('.car-year').find('dd').off('click').on('click', function () {
	      var $thisYear = $(this),
	          thisYearId = $thisYear.data('myid'),
	          thisYearText = $thisYear.text();
	      if ($.inArray(thisYearId, _this.picked.year) == -1) {
	        _this.picked.year.push(thisYearId);
	        $thisYear.addClass('picked');
	      } else {
	        _this.picked.year = _this.picked.year.filter(function (f) {
	          return f != thisYearId;
	        });
	        $thisYear.removeClass('picked');
	      }
	      // 数据展示
	      _this._show();
	    });
	  },
	  /**
	   * 数据展示,并置入隐藏域
	   * 品牌：id='carBrand' name='brand_id'
	   * 车型：id='carModel' name='model_id'
	   * 年款：id='yearModel' name='year_id'
	   * */
	  _show: function _show() {
	    var _this = this;
	    var controlHtmlTemplate = '';
	    if (_this.picked.brand != '') {
	      var controlHtmlTemplate1 = '';
	      for (var i in _this.car.brand) {
	        if (_this.car.brand[i].k == _this.picked.brand) {
	          controlHtmlTemplate1 = _this.car.brand[i].v;
	        }
	      }
	      controlHtmlTemplate += controlHtmlTemplate1;
	    }
	    // 可以选择 车型和年款 的时候
	    if (_this.modelFlag) {
	      if (_this.picked.model.length > 0) {
	        var controlHtmlTemplate2 = ' / ';
	        var arrModelTemp = _this.car.model[_this.picked.brand];
	        for (var _i3 = 0, l = _this.picked.model.length; _i3 < l; _i3++) {
	          if (_i3) {
	            controlHtmlTemplate2 += '，';
	          }
	          for (var j = 0; j < arrModelTemp.length; j++) {
	            if (arrModelTemp[j].k == _this.picked.model[_i3]) {
	              controlHtmlTemplate2 += arrModelTemp[j].v;
	            }
	          }
	        }
	        // 选择多条超出长度时
	        var tempStr2 = controlHtmlTemplate + controlHtmlTemplate2;
	        if (tempStr2.length - 3 > $(_this.controlElem).width() / 14) {
	          controlHtmlTemplate2 = ' / \u5DF2\u9009' + _this.picked.model.length + '\u9879';
	        }
	        controlHtmlTemplate += controlHtmlTemplate2;
	      }
	      if (_this.picked.year.length > 0) {
	        var controlHtmlTemplate3 = ' / ';
	        var arrYearTemp = _this.car.year[_this.picked.model];
	        for (var _i4 = 0, _l3 = _this.picked.year.length; _i4 < _l3; _i4++) {
	          if (_i4) {
	            controlHtmlTemplate3 += '，';
	          }
	          for (var _j = 0; _j < arrYearTemp.length; _j++) {
	            if (arrYearTemp[_j].k == _this.picked.year[_i4]) {
	              controlHtmlTemplate3 += arrYearTemp[_j].v;
	            }
	          }
	        }
	        // 选择多条超出长度时
	        var tempStr3 = controlHtmlTemplate + controlHtmlTemplate3;
	        if (tempStr3.length - 3 > $(_this.controlElem).width() / 14) {
	          controlHtmlTemplate3 = ' / \u5DF2\u9009' + _this.picked.year.length + '\u9879';
	        }
	        controlHtmlTemplate += controlHtmlTemplate3;
	      }
	    }
	    $(_this.controlElem).html(controlHtmlTemplate);
	    $('#carBrand').val(_this.picked.brand == '' ? 0 : _this.picked.brand);
	    $('#carModel').val(_this.picked.model.join(',') == '' ? 0 : _this.picked.model.join(','));
	    $('#yearModel').val(_this.picked.year.join(',') == '' ? 0 : _this.picked.year.join(','));
	    if ($(_this.controlElem).siblings('.operation').hasClass('icon-arrow')) {
	      $(_this.controlElem).siblings('.operation').removeClass('icon-arrow').addClass('icon-del');
	    }
	    // 删除或清空展示数据
	    _this._iconEvt();
	  },
	  /**
	   * 图标操作函数
	   * */
	  _iconEvt: function _iconEvt() {
	    var _this = this;
	    $(_this.controlElem).siblings('.operation').off('click').on('click', function () {
	      // debugger;
	      $(_this.controlElem).html('');
	      $(this).siblings('.bottom-border').removeClass('border-animate').parent('.select-cell').removeClass('open');
	      $(this).removeClass('icon-del').addClass('icon-arrow');
	      // 取消选中状态
	      $('.car-model').find('.picked').each(function () {
	        $(this).removeClass('picked');
	      });
	      $('.car-year').find('.picked').each(function () {
	        $(this).removeClass('picked');
	      });
	      $(' .brand-warp').find('.picked').removeClass('picked');
	      $(' .brand-warp').find('.current').removeClass('current');
	      $(' .brand-num').find('li:first').click();
	      _this.picked.brand = '';
	      _this.picked.model = [];
	      _this.picked.year = [];
	      $('#carBrand').val(0);
	      $('#carModel').val(0);
	      $('#yearModel').val(0);
	    });
	  },
	  /**
	   * 搜索事件
	   * 搜索车型和年款 $('.brand-group')
	   * 搜索车型 $('.car-model')
	   * 搜索年款 $('.car-year')
	   * */
	  _searchEvt: function _searchEvt() {
	    var _this = this;
	    $(' .car-model').on('propertychange input', '.search-car', function () {
	      var $this = $(this);
	      var thisValue = $this.val(),
	          $thisDl = $this.parents('dl');
	      var thisDlClass = $thisDl.attr('class');
	      var search_str = $this.val().toLowerCase();
	      if ($this.val() == '') {
	        $thisDl.find('.dd-search').remove();
	        $thisDl.find('.dd-original').each(function () {
	          var ddMyId = $(this).data('myid');
	          if (thisDlClass == 'car-model' && $.inArray(ddMyId, _this.picked.model) != '-1') {
	            $(this).addClass('picked');
	          } else if (thisDlClass == 'car-year' && $.inArray(ddMyId, _this.picked.year) != '-1') {
	            $(this).addClass('picked');
	          } else {
	            $(this).removeClass('picked');
	          }
	        });
	        $thisDl.find('.dd-original').show();
	        return false;
	      }
	      if (thisDlClass == 'car-model') {
	        $(' .car-year').hide();
	      }
	      $thisDl.find('.dd-original').hide();
	      var searchTemplate = '';
	      $thisDl.find('.dd-search').remove();
	      var isFirst = true;
	      $thisDl.find('dd').each(function () {
	        var ddText = $(this).text(),
	            ddTextLower = ddText.toLowerCase();
	        if (ddTextLower.indexOf(search_str) != '-1') {
	          var ddMyId = $(this).data('myid');
	          if (isFirst) {
	            //  if ($.inArray(thisModelId, _this.picked.model) == -1)
	            if (thisDlClass == 'car-model' && $.inArray(ddMyId, _this.picked.model) != '-1') {
	              searchTemplate += '<dd class="dd-search dd-first picked" data-myid="' + ddMyId + '">' + ddText + '<i class="glyphicon"></i></dd>';
	            } else if (thisDlClass == 'car-year' && $.inArray(ddMyId, _this.picked.year) != '-1') {
	              searchTemplate += '<dd class="dd-search dd-first picked" data-myid="' + ddMyId + '">' + ddText + '<i class="glyphicon"></i></dd>';
	            } else {
	              searchTemplate += '<dd class="dd-search dd-first" data-myid="' + ddMyId + '">' + ddText + '<i class="glyphicon"></i></dd>';
	            }
	            isFirst = false;
	          } else {
	            if (thisDlClass == 'car-model' && $.inArray(ddMyId, _this.picked.model) != '-1') {
	              searchTemplate += '<dd class="dd-search picked" data-myid="' + ddMyId + '">' + ddText + '<i class="glyphicon"></i></dd>';
	            } else if (thisDlClass == 'car-year' && $.inArray(ddMyId, _this.picked.year) != '-1') {
	              searchTemplate += '<dd class="dd-search picked" data-myid="' + ddMyId + '">' + ddText + '<i class="glyphicon"></i></dd>';
	            } else {
	              searchTemplate += '<dd class="dd-search" data-myid="' + ddMyId + '">' + ddText + '<i class="glyphicon"></i></dd>';
	            }
	          }
	        }
	      });
	      if (searchTemplate == '') {
	        searchTemplate = '<dd class="dd-search dd-first" data-myid="">\u65E0\u6B64\u8F66\u578B\u4FE1\u606F</dd>';
	      }
	      $thisDl.append(searchTemplate);
	    });
	  }
	};
	function carBrandFun(elem) {
	  var $elem = $(elem),
	      $controlParent = $elem.parent('.select-cell'),
	      $border = $elem.siblings('.bottom-border'),
	      $icon = $elem.siblings('.operation');
	  $controlParent.hide().show();
	  brandLoad.modelFlag = $elem.data('modelflag') == 'undefined' ? brandLoad.modelFlag : $elem.data('modelflag');
	  brandLoad.controlElem = elem;
	  $elem.on('click', function (e) {
	    //点击select-control-static 隐藏时分秒选择，隐藏tree
	    $(' .t-container').css('display', 'none');
	    $('#locationTree').css('display', 'none');
	    // debugger;
	    // 隐藏其他select-data
	    $(this).parent().siblings('.select-cell').each(function () {
	      // debugger;
	      if ($(this).find('.select-control').length) {
	        // 动态生成的select-cell
	        var _$thisSelectControl = $(this).find('.select-control'),
	            _$thisBorder = _$thisSelectControl.siblings('.bottom-border'),
	            _thisTargetId = _$thisSelectControl.data('targetid'),
	            _$thisTarget = $('#' + _thisTargetId);
	        if (_$thisTarget.css('display') == 'block') {
	          _$thisTarget.hide();
	          if (!_$thisSelectControl.html()) {
	            _$thisBorder.removeClass('border-animate');
	            _$thisSelectControl.parent().removeClass('open');
	          }
	        }
	      } else if ($(this).find('.select-control-static').length) {
	        // 非动态生成的select-cell
	        var _$thisSelectControl2 = $(this).find('.select-control-static'),
	            _$thisBorder2 = _$thisSelectControl2.siblings('.bottom-border');
	        if ($(this).hasClass('open')) {
	          if (!_$thisSelectControl2.html()) {
	            _$thisBorder2.removeClass('border-animate');
	            $(this).removeClass('open');
	            $(' .brand-group').hide();
	            $(' .brand-warp').find('.picked').click();
	          } else {
	            if ($(' .brand-group').css('display') == 'block') {
	              $(' .brand-group').hide();
	              $(' .brand-warp').find('.picked').click();
	            }
	          }
	        }
	      }
	    });
	    if (!$elem.html()) {
	      if ($controlParent.hasClass('open')) {
	        $border.removeClass('border-animate');
	        $controlParent.removeClass('open');
	        $(' .brand-group').hide();
	      } else {
	        $border.addClass('border-animate');
	        $controlParent.addClass('open');
	        $(' .brand-group').show();
	        // brandLoad._charClick();
	        $(' .brand-num').find('li:first').click();
	      }
	    } else {
	      $(' .brand-group').toggle();
	      // $('.brand-warp').find('.picked').click();
	    }
	    // 点击元素外隐藏弹出框
	    e.stopPropagation();
	    $(document).on('click', function () {
	      // debugger
	      if (!$elem.html()) {
	        $border.removeClass('border-animate');
	        $controlParent.removeClass('open');
	      }
	      if ($(' .brand-group').css('display') === 'block') {
	        $(' .brand-group').hide();
	      }
	    });
	    $(' .brand-group').off('click').on('click', function (e) {
	      e.stopPropagation();
	    });
	  });
	}

	//车牌号
	function carPlateFunc(elem) {
	  var timer = void 0;
	  var city = '';
	  if (typeof province != 'undefined') {
	    city = province;
	  }
	  $(elem).each(function () {
	    // 提示
	    $(this).popover();
	    var $controlParent = $(this).parent('.select-cell'),
	        $border = $(this).siblings('.bottom-border');
	    var isAccurate = typeof $(this).data('accurate') === 'undefined' ? false : $(this).data('accurate'),
	        hasRadio = typeof $(this).data('radio') === 'undefined' ? false : $(this).data('radio');
	    $(this).on('focus', function () {
	      var $this = $(this);
	      if (!$this.val()) {
	        setTimeout(function () {
	          $this.val(city);
	        }, 300);
	        $border.addClass('border-animate');
	        $controlParent.addClass('open');
	      }
	    }).on('input', function () {
	      clearTimeout(timer);
	      var $this = $(this);
	      timer = setTimeout(function () {
	        vlaueSet($this, city);
	      }, 400);
	    }).on('blur', function () {
	      var $this = $(this),
	          thisVal = $this.val();
	      if (thisVal == city) {
	        $this.val('');
	      } else {
	        if (!isAccurate) {
	          if (thisVal.length < 7 && thisVal.length > 1) {
	            if (thisVal.indexOf('*') == -1) {
	              $this.val(thisVal + '*');
	            }
	          }
	        }

	        //验证车牌
	        // validation.plate(this,isAccurate);
	      }
	      if (!$this.val()) {
	        $border.removeClass('border-animate');
	        $controlParent.removeClass('open');
	      }
	    });
	    if (hasRadio) {
	      clearPlateNumber(this, '#no-plate');
	    }
	  });
	}
	function plateNumCity(obj, type) {
	  var timer = void 0;
	  var city = '';
	  if (typeof province != 'undefined') {
	    city = province;
	  }
	  $(obj).on('focus', function () {
	    var _this = $(this);
	    _this.val() == '' ? _this.val(city) : _this.val();
	  }).on('input', function () {
	    clearTimeout(timer);
	    var $this = $(this);
	    timer = setTimeout(function () {
	      vlaueSet($this, city);
	    }, 400);
	  }).on('blur', function () {
	    var _this = $(this).val();
	    if (_this == city) {
	      $(this).val('');
	    }
	    if (!type) {
	      if (_this.length < 7 && _this.length > 1) {
	        if (_this.indexOf('*') < 0) {
	          $(this).val(_this + '*');
	        }
	      }
	    }
	  });
	}
	function vlaueSet(obj, city) {
	  var v = obj.val();
	  if (v) {
	    if (v.split(city).length - 1 > 1) {
	      var arr = [];
	      var index = v.split('').map(function (i, v) {
	        if (i == city) {
	          arr.push(v);
	        }
	        if (i == city && v != arr[0]) {
	          return '';
	        } else {
	          return i;
	        }
	      });
	      obj.val(index.join('').trim());
	    }
	  }
	}
	function plateFormat() {

	  plateNumCity('#input-num');
	  plateNumCity('#input-real-num');
	  plateNumCity('#input-excplate-num');
	  plateNumCity('#plateAccurate', 1);

	  //车牌号提示
	  $('#input-num,#input-real-num,#input-excplate-num').on('focus', function () {
	    $(this).popover('show');
	    $('#no-plate').attr('checked', false);
	  });

	  /**
	   * 有无车牌号搜索
	   * @param numObj input[text]
	   * @param radioObj input[radio]
	   * */
	  var clearPlateNumber = function clearPlateNumber(numObj, radioObj) {
	    $(numObj).on('focus', function () {
	      $(radioObj).attr('checked', false).val('');
	    });
	    $(radioObj).on('click', function () {
	      if ($(this).prop('checked')) {
	        $(numObj).val('');
	        $(radioObj).val(1);
	      }
	    });
	  };
	  clearPlateNumber('#input-num', '#no-plate');
	}

	/**
	 * 有无车牌号搜索
	 * @param numObj input[text]
	 * @param radioObj input[radio]
	 * */
	function clearPlateNumber(numObj, radioObj) {
	  $(numObj).on('focus', function () {
	    $(radioObj).attr('checked', false).val('');
	    $(radioObj).removeAttr('name');
	  });
	  $(radioObj).on('click', function () {
	    if ($(this).prop('checked')) {
	      $(radioObj).attr('name', $(radioObj).data('name'));
	      $(radioObj).val(1);
	      $(numObj).val('');
	      $(numObj).siblings('.bottom-border').removeClass('border-animate');
	      $(numObj).parent('.select-cell').removeClass('open');
	    }
	  });
	}

	function inputFocus() {
	  $('.input-focus').each(function () {
	    var $this = $(this);
	    var $controlParent = $this.parent('.select-cell'),
	        $border = $this.siblings('.bottom-border'),
	        thisDefaultValue = $this.attr('data-value');
	    if (thisDefaultValue) {

	      $controlParent.addClass('open');
	      $border.addClass('border-animate');
	      setTimeout(function () {
	        $this.val(thisDefaultValue);
	      }, 1000);
	    }

	    $(this).on('focus', function () {
	      var $this = $(this);
	      if (!$this.val()) {
	        $controlParent.addClass('open');
	        $border.addClass('border-animate');
	      }
	    }).on('blur', function () {
	      var $this = $(this);
	      if (!$this.val()) {
	        $controlParent.removeClass('open');
	        $border.removeClass('border-animate');
	      }
	    });
	  });
	}
	function popoverTime() {
	  var newTime = void 0;
	  var h_template = '';
	  for (var h = 0; h < 24; h++) {
	    h_template += '<li>' + h + '</li>';
	  }
	  $(' .js-popover-time').popover({
	    html: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>',
	    content: '<ul class="js-timeContainer">' + h_template + '</ul>',
	    placement: 'bottom',
	    trigger: 'manual',
	    container: 'body'
	  });
	  $('#date-timeStart').on('click', function (e) {
	    e.stopPropagation();
	    if (typeof $('#date-timeEnd').attr('aria-describedby') !== 'undefined') {
	      $('#date-timeEnd').popover('hide');
	    }
	    $(this).popover('toggle');
	  });
	  $('#date-timeEnd').on('click', function (e) {
	    e.stopPropagation();
	    if (typeof $('#date-timeStart').attr('aria-describedby') !== 'undefined') {
	      $('#date-timeStart').popover('hide');
	    }
	    $(this).popover('toggle');
	  });
	  $(document).click(function () {
	    if (typeof $('#date-timeStart').attr('aria-describedby') !== 'undefined') {
	      $('#date-timeStart').popover('hide');
	    } else if (typeof $('#date-timeEnd').attr('aria-describedby') !== 'undefined') {
	      $('#date-timeEnd').popover('hide');
	    } else {
	      return;
	    }
	  });
	  // shown.bs.popover
	  $(' .js-popover-time').on('shown.bs.popover', function (e) {
	    var $this = $(this);
	    // 获取当前输入框里的值 ,并设置当前时间颜色高亮
	    var current_time = $(this).val(),
	        current_h = parseInt(current_time.split(':')[0]),
	        current_s = parseInt(current_time.split(':')[1]);
	    // console.log(current_h);
	    $(' .js-timeContainer').find('li').eq(current_h).addClass('active');

	    $(' .js-timeContainer').find('li').off('click');
	    $(' .js-timeContainer').find('li').on('click', function (e) {
	      e.stopPropagation();
	      var _$this = $(this),
	          thisHour = void 0,
	          s_template = '';
	      thisHour = _$this.html();
	      thisHour = formatNum(thisHour);
	      for (var s = 0; s < 12; s++) {
	        var temp_s = formatNum(s * 5);
	        s_template += '<li>' + thisHour + ':' + temp_s + '</li>';
	      }
	      $(' .js-timeContainer').html(s_template);
	      current_s = parseInt(current_s / 5);
	      $(' .js-timeContainer').find('li').eq(current_s).addClass('active');
	      $(' .js-timeContainer').find('li').off('click');
	      $(' .js-timeContainer').find('li').on('click', function () {
	        newTime = $(this).html();
	        newTime = newTime + ':00';
	        $this.val(newTime);
	        $(' .js-popover-time').popover('hide');
	      });
	    });
	  });
	}

	//表单验证
	var validation = {
	  time: function time(long) {
	    //时间一
	    var start_time = $('[name=begin_date]').val() + ' ' + $('[name=b_h]').val() + ':' + $('[name=b_m]').val() + ':' + $('[name=b_s]').val();
	    var end_time = $('[name=end_date]').val() + ' ' + $('[name=e_h]').val() + ':' + $('[name=e_m]').val() + ':' + $('[name=e_s]').val();

	    //时间二
	    var start_time1 = $('[name=begin_date2]').val() + ' ' + $('[name=b_h_2]').val() + ':' + $('[name=b_m_2]').val() + ':' + $('[name=b_s_2]').val();
	    var end_time1 = $('[name=end_date2]').val() + ' ' + $('[name=e_h_2]').val() + ':' + $('[name=e_m_2]').val() + ':' + $('[name=e_s_2]').val();

	    //时间一的判断
	    start_time = start_time.replace(/-/g, '/');
	    var s_date = new Date(start_time);
	    var s_time = s_date.getTime() / 1000; //s
	    end_time = end_time.replace(/-/g, '/');
	    var e_date = new Date(end_time);
	    var e_time = e_date.getTime() / 1000; //e
	    if (e_time <= s_time) {
	      alert('结束时间不能等于或早于开始时间！');
	      return false;
	    }

	    //时间二的判断
	    start_time1 = start_time1.replace(/-/g, '/');
	    var s_date1 = new Date(start_time1);
	    var s_time1 = s_date1.getTime() / 1000; //s
	    end_time1 = end_time1.replace(/-/g, '/');
	    var e_date1 = new Date(end_time1);
	    var e_time1 = e_date1.getTime() / 1000; //e

	    var flag = true;
	    $(' .PassTime-2 input').each(function () {
	      if ($(' .zhe-img').is(':hidden') && !$(this).val()) {
	        flag = false;
	      }
	    });
	    if (!flag) {
	      alert('时间未填写');
	      return false;
	    }

	    if ($(' .zhe-img').is(':hidden') && e_time1 < s_time1) {
	      alert('结束时间不能早于开始时间！');
	      return false;
	    }

	    if ($(' .zhe-img').is(':hidden') && s_time <= s_time1 && e_time1 <= e_time || $(' .zhe-img').is(':hidden') && s_time1 <= s_time && e_time <= e_time1) {
	      alert('时间段相互包含！');
	      return false;
	    }

	    if ($(' .zhe-img').is(':hidden')) {
	      if ('' == start_time1 || '' == end_time1) {
	        alert('时间段二无效请设置或删除！');
	        return false;
	      }
	      if (e_time >= s_time + long * 24 * 60 * 60 || e_time1 >= s_time1 + long * 24 * 60 * 60 || (e_time - s_time + (e_time1 - s_time1)) / (24 * 60 * 60) > long) {
	        alert('\u65F6\u95F4\u95F4\u9694\u4E0D\u80FD\u8D85\u8FC7' + long + '\u5929\uFF01');
	        return false;
	      }
	    } else if ($(' .zhe-img').is(':visible')) {
	      if (e_time >= s_time + long * 24 * 60 * 60) {
	        alert('\u65F6\u95F4\u95F4\u9694\u4E0D\u80FD\u8D85\u8FC7' + long + '\u5929\uFF01');
	        return false;
	      }
	    }
	    if ('' == start_time || '' == end_time) {
	      alert('过车时段不能为空！');
	      return false;
	    }
	    //判断只有一组时间
	    if ($(' .zhe-img')) {
	      if (e_time >= s_time + long * 24 * 60 * 60) {
	        alert('\u65F6\u95F4\u95F4\u9694\u4E0D\u80FD\u8D85\u8FC7' + long + '\u5929\uFF01');
	        return false;
	      }
	    }

	    return true;
	  },
	  timeAreaLimit: function timeAreaLimit() {
	    //判断日期
	    var start_date = $('[name=begin_date]').val();
	    var end_date = $('[name=end_date]').val();
	    if (start_date == '' || end_date == '') {
	      alert('日期未填写完整');
	      return false;
	    }
	    start_date = start_date.replace(/-/g, '/');
	    var s_date = new Date(start_date);
	    var s_time = s_date.getTime() / 1000; //s
	    end_date = end_date.replace(/-/g, '/');
	    var e_date = new Date(end_date);
	    var e_time = e_date.getTime() / 1000; //e
	    if (s_time > e_time) {
	      alert('结束日期大于开始日期');
	      return false;
	    }
	    //判断时限
	    var t1_bh = parseInt($('[name=b_h]').val()),
	        t1_bm = parseInt($('[name=b_m]').val()),
	        t1_bs = parseInt($('[name=b_s]').val()),
	        t1_eh = parseInt($('[name=e_h]').val()),
	        t1_em = parseInt($('[name=e_m]').val()),
	        t1_es = parseInt($('[name=e_s]').val());

	    function checkHMS(bh, bm, bs, eh, em, es) {
	      var checkFlag = false;
	      if (isNaN(bh) || isNaN(bm) || isNaN(bs) || isNaN(eh) || isNaN(em) || isNaN(es)) {} else {
	        if (eh > bh) {
	          checkFlag = true;
	        } else if (eh == bh) {
	          if (em > bm) {
	            checkFlag = true;
	          } else if (em == bm) {
	            if (es > bs) {
	              checkFlag = true;
	            }
	          }
	        }
	      }

	      return checkFlag;
	    }

	    if (!checkHMS(t1_bh, t1_bm, t1_bs, t1_eh, t1_em, t1_es)) {
	      alert('时限一结束时限小于开始时限');
	      return false;
	    }

	    if ($(' .zhe-img').is(':hidden')) {
	      //两个时限的处理
	      var t2_bh = parseInt($('[name=b_h_2]').val()),
	          t2_bm = parseInt($('[name=b_m_2]').val()),
	          t2_bs = parseInt($('[name=b_s_2]').val()),
	          t2_eh = parseInt($('[name=e_h_2]').val()),
	          t2_em = parseInt($('[name=e_m_2]').val()),
	          t2_es = parseInt($('[name=e_s_2]').val());
	      //时限二检查
	      if (!checkHMS(t2_bh, t2_bm, t2_bs, t2_eh, t2_em, t2_es)) {
	        alert('时限二结束时限小于开始时限');
	        return false;
	      }
	      //时限一和二相互包含检查
	      var s_time1 = new Date('2017/7/6 ' + t1_bh + ':' + t1_bm + ':' + t1_bs).getTime(),
	          e_time1 = new Date('2017/7/6 ' + t1_eh + ':' + t1_em + ':' + t1_es).getTime(),
	          s_time2 = new Date('2017/7/6 ' + t2_bh + ':' + t2_bm + ':' + t2_bs).getTime(),
	          e_time2 = new Date('2017/7/6 ' + t2_eh + ':' + t2_em + ':' + t2_es).getTime();
	      // if ((( s_time1 <= s_time2) && (e_time2 <= e_time1)) || (( s_time2 <= s_time1) && (e_time1 <= e_time2))) {
	      if (s_time1 >= s_time2 && s_time1 <= e_time2 || s_time2 >= s_time1 && s_time2 <= e_time1) {
	        alert('时间段相互包含！');
	        return false;
	      }
	    } else {
	      //仅存在一个时限,提交清空时限二
	      $('[name=b_h_2]').val('');
	      $('[name=b_m_2]').val('');
	      $('[name=b_s_2]').val('');
	      $('[name=e_h_2]').val('');
	      $('[name=e_m_2]').val('');
	      $('[name=e_s_2]').val('');
	    }

	    return true;
	  },
	  // noAlert参数为true时，不要alert弹框
	  plate: function plate(obj, accurate, noAlert) {
	    //车牌号校验
	    var value = '';
	    if (obj) {
	      value = $(obj).val().toUpperCase().trim().replace(/\s/g, '');
	      $(obj).val($(obj).val().toUpperCase().trim().replace(/\s/g, ''));
	    } else {
	      value = $('#input-num').val().toUpperCase().trim().replace(/\s/g, '');
	      $('#input-num').val($('#input-num').val().toUpperCase().trim().replace(/\s/g, ''));
	    }

	    if (accurate && (!value || value.indexOf('*') !== -1 || value.indexOf('?') !== -1)) {
	      if (!noAlert) {
	        alert('请输入正确的车牌');
	      }
	      return false;
	    }

	    if (value.length > 8) {
	      if (!noAlert) {
	        alert('输入的车牌号格式不正确');
	      }
	      return false;
	    }
	    var containSpecial = RegExp(/[(\ )(\~)(\!)(\@)(\#)(\$)(\%)(\￥)(\^)(\&)(\()(\))(\-)(\_)(\+)(\=)(\[)(\])(\{)(\})(\|)(\\)(\;)(\:)(\')(\")(\,)(\.)(\/)(\<)(\>)(\)]+/);
	    var ft = containSpecial.test(value);
	    if (ft == true) {
	      if (!noAlert) {
	        alert('输入的车牌号格式不正确');
	      }
	      return false;
	    }
	    if (value !== '' && value !== '' && value.indexOf('*') == -1 && value.indexOf('?') == -1) {
	      //let re=/^[\u4e00-\u9fa5]{1}[A-Z]{1}[A-Z_0-9]{5}$/;
	      var re = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[警京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼]{0,1}[A-Z0-9]{4,5}[A-Z0-9挂学警港澳使领]{1}$/;
	      if (value.search(re) == -1) {
	        //$('.place-txtclear.txtnum').val('');
	        if (!noAlert) {
	          alert('输入的车牌号格式不正确');
	        }
	        return false;
	      }
	    } else {
	      if (value !== '' && value.indexOf('*') == -1) {
	        if (value.length != 7) {
	          //$('.place-txtclear.txtnum').val('');
	          if (!noAlert) {
	            alert('输入的车牌号格式不正确');
	          }
	          return false;
	        }
	      }
	    }
	    return true;
	  },

	  //验证必须为非零整数
	  isInteger: function isInteger(num) {
	    var reg = /^\+?[1-9][0-9]*$/;
	    if (!reg.test(num)) {
	      return false;
	    }
	    return true;
	  }
	};

	function searchSelect() {
	  var searchArr = ['#categoryVal', '#parts', '#category', '#color', '#direction', '#sunvisor', '#plateColor', '#deployType', '#xcNum', '#approver_type', '#location_id', '#locationType', '#coat-color', '#coat-color2', '#coatColor', '#pantsColor', '#character', '#carUse', '#goals', '#data-sources', '#truckCover', '#zairen', '#mamu', '#upColorSelect', '#downColorSelect', '#category', '#shadeFace', '#supercargo'];
	  for (var i = 0; i < searchArr.length; i++) {
	    new _yisaSelect.YisaSelect(searchArr[i]);
	  }
	}

	// 地图与form部分高度设置
	function multiSelect() {
	  var formMulti = ['#parts', '#category', '#direction', '#sunvisor', '#plateColor', '#deployType', '#xcNum', '#location_id', '#locationType', '#coat-color', '#coat-color2', '#coatColor', '#pantsColor', '#character', '#carUse', '#truckCover', '#zairen', '#mamu', '#upColorSelect', '#downColorSelect', '#category', '#associate-point', '#warn-type', '#skylight', '#baggageHold', '#sprayWord', '#sunShadeLeft', '#sunShadeRight', '#pendant', '#tissueBox', '#decoration', '#card', '#personLeft', '#seatBeltLeft', '#personRight', '#seatBeltRight', '#phoneRight', '#skylight2', '#baggageHold2', '#sprayWord2', '#backBurnerTail', '#associate-equip'];
	  for (var i = 0; i < formMulti.length; i++) {

	    $(formMulti[i]).multiselect({
	      buttonWidth: '100%',
	      buttonText: function buttonText(options, select) {
	        if (options.length === 0) {
	          return '全部';
	        } else if (options.length >= 2) {
	          return '\u5DF2\u9009\u62E9 ' + options.length + ' \u9879';
	        } else {
	          var labels = [];
	          options.each(function () {
	            if ($(this).attr('label') !== undefined) {
	              labels.push($(this).attr('label'));
	            } else {
	              labels.push($(this).html());
	            }
	          });
	          return labels.join(', ') + '';
	        }
	      }
	    });
	  }

	  $('#select-chexing,#select-niankuan').multiselect({
	    buttonWidth: '100%',
	    enableFiltering: true,
	    includeSelectAllOption: true,
	    selectAllText: '全选',
	    filterPlaceholder: '输入关键字搜索',
	    buttonText: function buttonText(options, select) {
	      if (options.length === 0) {
	        return '全部';
	      } else if (options.length > 3) {
	        return '\u5DF2\u9009\u62E9 ' + options.length + ' \u9879';
	      } else {
	        var labels = [];
	        options.each(function () {
	          if ($(this).attr('label') !== undefined) {
	            labels.push($(this).attr('label'));
	          } else {
	            labels.push($(this).html());
	          }
	        });
	        return labels.join(', ') + '';
	      }
	    }
	  });
	}

	exports.carBrandFun = carBrandFun;
	exports.clearPlateNumber = clearPlateNumber;
	exports.carPlateFunc = carPlateFunc;
	exports.popoverTime = popoverTime;
	exports.validation = validation;
	exports.brandLoad = brandLoad;
	exports.inputFocus = inputFocus;
	exports.searchSelect = searchSelect;
	exports.multiSelect = multiSelect;
	exports.plateNumCity = plateNumCity;
	exports.plateFormat = plateFormat;


	$(function () {

	  $(' .datebarAdd').on('click', function () {
	    $(' .PassTime-2').show();
	    $(' .datebarAdd').hide();
	    $(' .left-parent').find('.panel-body').getNiceScroll().resize();
	  });
	  $(' .datebarDes').on('click', function () {
	    $(' .datebarAdd').show();
	    $(' .PassTime-2').hide();
	    $(' .left-parent').find('.panel-body').getNiceScroll().resize();
	  });

	  //
	  var ds = $('#date-start'),
	      de = $('#date-end');
	  if (ds.length > 0) {
	    ds.Zebra_DatePicker({
	      //pair: de
	    });
	    de.Zebra_DatePicker({
	      //direction: [true, 3]
	    });
	  }

	  var ds2 = $('#date-start-2'),
	      de2 = $('#date-end-2');
	  if (ds2.length > 0) {
	    ds2.Zebra_DatePicker({
	      //pair: de
	    });
	    de2.Zebra_DatePicker({
	      //direction: [true, 3]
	    });
	  }

	  searchSelect();

	  //解决ie8更多研判车牌号乱码问题
	  if ((0, _tools.getQueryString)('plate')) {
	    $('#input-num').val((0, _tools.getQueryString)('plate'));
	    $('#input-num').attr('data-value', (0, _tools.getQueryString)('plate'));
	  }
	  //input 有value 默认展开
	  inputFocus();
	});

	// Node Code
	$(' .brand-group').on('propertychange input', '.search-car', function () {
	  // console.log('input..')
	  // let $this = $(this)
	  // let $thisVal = $this.val()
	  // setTimeout(function () {
	  //   $this.val($thisVal)
	  // }, 1000)
	});
	$(' .brand-group').on('change', '.search-car', function () {
	  console.log('change..');
	  var $this = $(this);
	  var $thisVal = $this.val();
	  setTimeout(function () {
	    $this.val($thisVal);
	  }, 1000);
	});

/***/ }),
/* 7 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var YisaSelect = exports.YisaSelect = function () {
	  function YisaSelect(elem, opts) {
	    _classCallCheck(this, YisaSelect);

	    this._elem = $(elem);
	    this._defaults = Object.assign({
	      'multi': false, // 是否多选 默认单选，false或者''为单选，true为多选
	      'required': false, // 是否必填项 默认非必填项，false或者''为非必填，true为必填项
	      'maxSelect': 1,
	      'defaultValue': '' //不选择的时候提交的默认值
	    }, opts);
	    for (var i = 0, len = this._elem.length; i < len; i++) {
	      this._current = this._elem.eq(i);
	      this._textArr = [];
	      this._valueArr = [];
	      this._data = {
	        'textName': this._current.data('text'),
	        'submitName': this._current.data('submit'),
	        'isMulti': typeof this._current.data('multi') === 'undefined' ? this._defaults.multi : this._current.data('multi'),
	        'isRequired': typeof this._current.data('required') === 'undefined' ? this._defaults.required : this._current.data('required'),
	        'defaultValue': typeof this._current.data('default') === 'undefined' ? this._defaults.defaultValue : this._current.data('default')
	      };
	      this._targetId = '' + elem.substr(1) + i;
	      this._options = this._current.find('option');
	      this._init();
	    }
	  }

	  _createClass(YisaSelect, [{
	    key: '_init',
	    value: function _init() {
	      this._viewTemplate();
	      this._dataTemplate();
	      this._controlEvt();
	    }
	  }, {
	    key: '_viewTemplate',
	    value: function _viewTemplate() {
	      var template = '\n          <label class="select-text">' + this._data.textName + '</label>\n          <input class="select-submit" name="' + this._data.submitName + '" type="hidden" value="">\n          <div class="select-control" data-targetid="' + this._targetId + '"></div>\n          <div class="bottom-border"></div>\n          <span class="operation icon-arrow"><i class="glyphicon operation-glyphicon"></i></span>\n                      ';
	      this._current.parent('.select-cell').prepend(template);
	    }
	  }, {
	    key: '_dataTemplate',
	    value: function _dataTemplate() {
	      var template = '<ul id="' + this._targetId + '" class="select-data">';
	      for (var i = 0, len = this._options.length; i < len; i++) {
	        template += '<li class="select-item" data-value="' + this._options[i].value + '"><p>' + this._options[i].innerText + '</p><span class="glyphicon"></span></li>';
	      }
	      template += '</ul>';
	      // 渲染
	      $('body').append(template);
	    }
	  }, {
	    key: '_ulPartPosition',
	    value: function _ulPartPosition() {
	      var _this = this;
	      var $control = _this._current.siblings(' .select-control');
	      var thisTop = $control.offset().top,
	          thisLeft = $control.offset().left,
	          thisHeight = $control.height(),
	          thisOuterWidth = $control.outerWidth(),
	          topOffset = thisTop + thisHeight + 13;

	      /*if($(".container-fluid").hasClass("search")){
	       //暂时解决神眼搜车中遮挡问题
	       let controlAfter1 = ["categoryVal0"],
	       controlAfter2 = ["color0", "direction0", "plateColor0"];
	       if ($("#input-num").length > 0 || $("#fullBrand").length > 0) {
	       if($.inArray(this._targetId, controlAfter1) != -1) {
	       topOffset = topOffset + 70;
	       } else if($.inArray(this._targetId, controlAfter2) != -1) {
	       topOffset = topOffset + 35;
	       }
	       }
	       }*/

	      $('#' + _this._targetId).css({
	        'top': topOffset,
	        'width': thisOuterWidth,
	        'left': thisLeft,
	        'min-height': '100px',
	        'max-height': $(window).height() - topOffset - 27
	      });

	      var scroll_h = void 0;
	      /* let _this = this;*/
	      if ($(' .form-part').find('.panel-body').length > 0) {
	        var scroll_d = $(' .form-part').find('.panel-body').scrollTop();
	        $(' .form-part').find('.panel-body').scroll(function () {
	          scroll_h = $(this).scrollTop();
	          if (scroll_d > 0) {
	            $('#' + _this._targetId).css({
	              'top': topOffset - (scroll_h - scroll_d)
	            });
	          } else {
	            $('#' + _this._targetId).css({
	              'top': topOffset - scroll_h
	            });
	          }
	          //弹出框超出面板隐藏
	          if ($('#' + _this._targetId).offset().top <= $(' .left-parent .panel-heading').offset().top + 33) {
	            $('#' + _this._targetId).hide();
	            if (!$control.html()) {
	              $control.siblings(' .bottom-border').removeClass('border-animate');
	              $control.parent().removeClass('open');
	            }
	          }
	        });
	      } else if ($(' .left-option').length > 0) {
	        var _scroll_d = $(' .left-option').scrollTop();
	        $(' .left-option').scroll(function () {
	          scroll_h = $(this).scrollTop();
	          if (_scroll_d > 0) {
	            $('#' + _this._targetId).css({
	              'top': topOffset - (scroll_h - _scroll_d)
	            });
	          } else {
	            $('#' + _this._targetId).css({
	              'top': topOffset - scroll_h
	            });
	          }
	        });
	      }

	      $(window).resize(function () {
	        $('#' + _this._targetId).css({
	          'max-height': $(window).height() - topOffset - 27
	        });
	      });
	    }
	  }, {
	    key: '_controlEvt',
	    value: function _controlEvt() {
	      var _this = this;
	      var $control = _this._current.siblings(' .select-control'),
	          $border = _this._current.siblings(' .bottom-border'),
	          $input = _this._current.siblings(' .select-submit'),
	          $icon = _this._current.siblings(' .operation'),
	          $controlParent = _this._current.parent(),
	          $thisTarget = $('#' + _this._targetId);

	      //defaultValue 表单提交
	      $input.val(_this._data.defaultValue);

	      //默认选中
	      _this._current.find('option').each(function () {
	        if ($(this).data('select')) {
	          var $this = $(this);
	          $controlParent.addClass('open');
	          $border.addClass('border-animate');
	          setTimeout(function () {
	            $control.html($this.html());
	          }, 500);
	          $input.val($this.val() || _this._data.defaultValue);
	        }
	      });

	      // let tempTextArr,tempValueArr;
	      $control.on('click', function (e) {
	        _this._ulPartPosition();
	        //点击select-control 隐藏时分秒选择，隐藏tree
	        $(' .t-container').css('display', 'none');
	        $('#locationTree').css('display', 'none');

	        // 隐藏其他select-data  可以通用
	        $(this).parent().siblings('.select-cell').each(function () {
	          // debugger;
	          if ($(this).find('.select-control').length) {
	            var _$thisSelectControl = $(this).find('.select-control'),
	                _$thisBorder = _$thisSelectControl.siblings(' .bottom-border'),
	                _thisTargetId = _$thisSelectControl.data('targetid'),
	                _$thisTarget = $('#' + _thisTargetId);
	            if (_$thisTarget.css('display') == 'block') {
	              _$thisTarget.hide();
	              if (!_$thisSelectControl.html()) {
	                _$thisBorder.removeClass('border-animate');
	                _$thisSelectControl.parent().removeClass('open');
	              }
	            }
	          } else if ($(this).find('.select-control-static').length) {
	            // 非动态生成的select-cell
	            var _$thisSelectControl2 = $(this).find('.select-control-static'),
	                _$thisBorder2 = _$thisSelectControl2.siblings(' .bottom-border');
	            if ($(this).hasClass('open')) {
	              // debugger
	              if (!_$thisSelectControl2.html()) {
	                _$thisBorder2.removeClass('border-animate');
	                $(this).removeClass('open');
	                $(' .brand-group').hide();
	                $(' .brand-warp').find('.picked').click();
	              } else {
	                if ($(' .brand-group').css('display') == 'block') {
	                  $(' .brand-group').hide();
	                  $(' .brand-warp').find('.picked').click();
	                }
	              }
	            }
	          }
	        });

	        // select-data显示隐藏切换
	        if (!$(this).html()) {
	          if ($controlParent.hasClass('open')) {
	            $border.removeClass('border-animate');
	            $controlParent.removeClass('open');
	            $thisTarget.hide();
	          } else {
	            $border.addClass('border-animate');
	            $controlParent.addClass('open');
	            $thisTarget.show();
	          }
	        } else {
	          $thisTarget.toggle();
	        }
	        // 选择
	        // $control.html() == '' ? tempTextArr = [] : tempTextArr = $control.html().split(',');
	        // $input.val() == '' ? tempValueArr = [] : tempValueArr = $input.val().split(',');
	        // select-data选择
	        $thisTarget.find('li').off('click').on('click', function () {
	          var text = $(this).text(),
	              value = $(this).data('value');
	          if (_this._data.isMulti) {
	            if ($.inArray(text, _this._textArr) === -1) {
	              $(this).find('span').addClass('glyphicon-ok');
	              // tempTextArr.push(text);
	              // tempValueArr.push(value);
	              ///  替换
	              _this._textArr.push(text);
	              _this._valueArr.push(value);
	              if (_this._textArr.join('，').length * 14 > $control.width()) {
	                $control.html('\u5DF2\u9009\u62E9' + _this._textArr.length + '\u9879');
	              } else {
	                $control.html(_this._textArr.join('，'));
	              }
	              $input.val(_this._valueArr.join(','));
	            } else {
	              $(this).find('span').removeClass('glyphicon-ok');
	              _this._textArr = _this._textArr.filter(function (f) {
	                return f != text;
	              });
	              _this._valueArr = _this._valueArr.filter(function (f) {
	                return f != value;
	              });
	              if (_this._textArr.join('，').length * 14 > $control.width()) {
	                $control.html('\u5DF2\u9009\u62E9' + _this._textArr.length + '\u9879');
	              } else {
	                $control.html(_this._textArr.join(','));
	              }
	              $input.val(_this._valueArr.join(','));
	            }
	            if (_this._textArr.length == 0) {
	              $icon.removeClass('icon-del').addClass('icon-arrow');
	            } else {
	              $icon.removeClass('icon-arrow').addClass('icon-del');
	            }
	          } else {
	            $control.html(text);
	            $input.val(value);
	            $(this).parent().hide();
	            if ($icon.hasClass('icon-arrow')) {
	              $icon.removeClass('icon-arrow').addClass('icon-del');
	            }
	          }
	          //三轮车检索带篷和载人联动
	          if ($(this).parent().prop('id') == 'mamu0') {
	            var val = $(this).data('value');
	            if (val == '' || val == '0') {
	              //全部或者无篷，是否载人显示
	              $('#zairen').parents('.select-cell').removeClass('st-hide');
	            } else if (val == '1') {
	              //有篷
	              $('#zairen').parents('.select-cell').addClass('st-hide');
	              $('#zairen').siblings('.select-submit').val('');
	              $('#zairen').siblings('.select-control').text('不限');
	            }
	          }
	        });
	        // 点击删除按钮，清空内容 ，应拿出来
	        $icon.off('click').on('click', function () {
	          var obj = $(this).parents('.select-cell');
	          if (obj.find('.select-submit').prop('name') == 'is_mamu' || obj.find('.select-submit').prop('name') == 'tricycle_manned') {
	            obj.next('.select-cell').removeClass('st-hide');
	            obj.removeClass('st-hide').addClass('open');
	            obj.find('.select-submit').val('');
	            obj.find('.select-control').text('不限');
	            return;
	          }
	          $control.html('');
	          $input.val(_this._data.defaultValue);
	          _this._textArr = [];
	          _this._valueArr = [];
	          $(this).removeClass('icon-del').addClass('icon-arrow').siblings('.bottom-border').removeClass('border-animate').parent('.select-cell').removeClass('open');
	          // // 部分事件相当于 在元素之外区域点击 完成的事件，故以上写法应删减为下面的写法。
	          // $(this).removeClass('icon-del').addClass('icon-arrow');
	          if (_this._data.isMulti) {
	            $thisTarget.find('li').each(function () {
	              if ($(this).find('span').hasClass('glyphicon-ok')) {
	                $(this).find('span').removeClass('glyphicon-ok');
	              }
	            });
	          }
	        });
	        // 点击元素外的区域隐藏select-data
	        e.stopPropagation();
	        $(document).on('click', function () {
	          if (!$control.html()) {
	            $border.removeClass('border-animate');
	            $controlParent.removeClass('open');
	          }
	          if ($thisTarget.css('display') === 'block') {
	            $thisTarget.hide();
	          }
	          $(' .t-container').css('display', 'none');
	          $('#locationTree').css('display', 'none');
	        });
	        $thisTarget.off('click').on('click', function (e) {
	          e.stopPropagation();
	        });
	      });
	    }
	  }]);

	  return YisaSelect;
	}();

/***/ })
/******/ ]);