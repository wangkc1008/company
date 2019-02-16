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

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	exports.locationMap = locationMap;

	var _ajaxLoadParse = __webpack_require__(2);

	var _modal = __webpack_require__(3);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function locationMap() {

	    $(' .navbar').css('marginBottom', 0);

	    $('#map').css({
	        'height': $(window).height() - $(' .navbar').height()
	    });

	    if (!window.tmap) {
	        try {
	            mapCtrl._mapEvent = false;
	            mapCtrl.initMap('map');
	        } catch (e) {
	            $('#map').html('地图加载失败;');
	        }
	    }

	    new YisaTree('#locationTree', {
	        selectTip: '#region',
	        style: 'checkbox',
	        ajaxUrl: ajaxURL.getLocationTree,
	        parentCheck: false
	    });

	    $('#region').on('focus', function () {
	        $('#locationTree').show();
	    }).on('click', function () {
	        return false;
	    });

	    $('#save').on('click', function () {
	        var re = mapCtrl.getAllMarkers();
	        var arr = [],
	            obj = {};
	        $.each(re, function (id, item) {
	            obj = { id: id, item: item };
	            arr.push(obj);
	        });
	        re = JSON.stringify(arr);
	        (0, _ajaxLoadParse.ajaxLoad)({
	            url: ajaxURL.save,
	            method: 'post',
	            data: { point: re },
	            dataType: 'json',
	            cache: false
	        }, function (e) {
	            (0, _ajaxLoadParse.ajaxLoadParse)(e, function (e) {
	                (0, _modal.showTipModal)({
	                    title: '保存成功',
	                    content: '<p class="text-success">点位保存成功。</p>'
	                });
	            });
	        });
	    });
	}

	var YisaTree = function () {
	    function YisaTree(elem, options) {
	        _classCallCheck(this, YisaTree);

	        this.defaults = {
	            selectTip: '#poisNum',
	            style: 'checkbox',
	            ajaxUrl: '',
	            parentCheck: true //设置非叶子节点是否可被选择，默认可
	        };
	        this.options = $.extend({}, this.defaults, options);
	        this.content = $(elem);
	        this.tips = $(this.options.selectTip);
	        this.filter = null;
	        this.list = null;
	        this.search = null;
	        this.clear = null;
	        this.treeObj = null;
	        this.sto = null;
	        this.count = 0;
	        this._init();
	    }

	    _createClass(YisaTree, [{
	        key: '_init',
	        value: function _init() {
	            var searchID = 's' + new Date().getTime(),
	                clearID = 'c' + new Date().getTime();
	            var listID = 'l' + new Date().getTime(),
	                filterID = 'f' + new Date().getTime();
	            var t = '<div class="panel-heading">\n                     <input type="text" class="form-control input-sm" id="' + searchID + '" placeholder="\u8BF7\u8F93\u5165\u5173\u952E\u5B57\u7B5B\u9009">\n                     <span class="glyphicon glyphicon-remove" id="' + clearID + '" style="cursor: default;display: none;position: absolute;right: 23px;top: 19px;"></span>\n                 </div>\n                 <div class="location-tree-list">\n                     <ul class="ztree" id="' + listID + '"></ul>\n                     <ul class="ztree" id="' + filterID + '" style="display: none;"></ul>\n                 </div>';
	            this.content.html(t);
	            this.filter = $('#' + filterID);
	            this.list = $('#' + listID);
	            this.search = $('#' + searchID);
	            this.clear = $('#' + clearID);

	            if (window.localStorage && window.JSON) {
	                var locations = localStorage.getItem('locations_pbd_' + staticDataCache);
	                // console.log(locations)

	                if (locations && locations != 'undefined') {
	                    this._creat(JSON.parse(locations), this.options.style);
	                } else {
	                    locations = this._getLocation();
	                    this._creat(locations, this.options.style);
	                    var keys = Object.keys(localStorage);
	                    keys.forEach(function (v) {
	                        if (v.indexOf('locations_pbd_') > -1) localStorage.removeItem(v);
	                    });
	                    localStorage.setItem('locations_pbd_' + staticDataCache, JSON.stringify(locations));
	                }
	            } else {
	                this._creat(this._getLocation(), this.options.style);
	            }

	            var self = this;

	            $(document).on('click', function () {
	                self.content.hide();
	            });
	            this.content.on('click', function (e) {
	                e.stopPropagation();
	            });

	            this.filter.on('change', 'input', function () {
	                var $this = $(this);
	                self.checkOne($this.data('id'), $this.is(':checked'));
	            });

	            this.search.on('input', function () {
	                self.searchInput();
	            });

	            this.clear.on('click', function () {
	                self.search.val('');
	                self.searchInput();
	                return false;
	            });
	        }
	    }, {
	        key: '_getLocation',
	        value: function _getLocation() {
	            var locations = void 0;
	            $.ajax({
	                async: false,
	                url: this.options.ajaxUrl,
	                dataType: 'json'
	            }).done(function (e) {
	                locations = e.data;
	            });
	            return locations;
	        }
	    }, {
	        key: '_creat',
	        value: function _creat(data) {
	            var _this = this;

	            var style = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'checkbox';

	            if (!this.options.parentCheck) {
	                data = this._parentCheckEnable(data);
	            }
	            $.fn.zTree.init(this.list, {
	                check: {
	                    enable: true,
	                    chkStyle: style,
	                    radioType: 'all'
	                    //chkboxType: {"Y": "s", "N": "s"}
	                },
	                simpleData: {
	                    enable: true
	                },
	                data: {
	                    key: {
	                        children: 'nodes',
	                        name: 'text'
	                    }
	                },
	                callback: {
	                    onCheck: function onCheck(event, treeId, treeNode) {
	                        var currentNode = treeNode.id;
	                        var lens = _this.treeObj.getCheckedNodes();
	                        /*this.count = 0;
	                        let arr = [];*/
	                        if (lens.length) {
	                            _this.tips.val(lens[0].text);
	                            /*lens.forEach((item, i)=> {
	                                if (item.scale) {
	                                    this.count++;
	                                    arr.unshift(item);
	                                }
	                            });
	                            if (this.count > 1) {
	                                alert("最多选择一个区");
	                                if (arr.length > 1) {
	                                    let item;
	                                    $.each(arr, (i, v)=> {
	                                        if (v.id == currentNode) {
	                                            item=v;
	                                        }
	                                    })
	                                    if (item.nodes) {
	                                        for (var i = 0, l = item.nodes.length; i < l; i++) {
	                                            this.treeObj.checkNode(item.nodes[i], false, true);
	                                        }
	                                    }
	                                    this.treeObj.checkNode(item, false, true);
	                                }
	                            }*/
	                            mapCtrl.clearAll();
	                            //lens=this.treeObj.getCheckedNodes();
	                            for (var i = 0; i < lens.length; i++) {
	                                if (lens[i].lng) {
	                                    var a = lens[i];
	                                    mapCtrl.addMarkerOne(a.lng, a.lat, a.id, '', a.type, 1, a.text);
	                                }
	                            }
	                        } else {
	                            mapCtrl.clearAll();
	                            $(" .location-area").val("");
	                        }
	                    }
	                }
	            }, data);
	            this.treeObj = $.fn.zTree.getZTreeObj(this.list[0].id);
	        }

	        /**
	         * 找出包含关键词的叶子节点
	         * @param node
	         * @returns {boolean}
	         * @private
	         */

	    }, {
	        key: '_filter1',
	        value: function _filter1(node, a) {
	            if (node.text) {
	                return !node.scale && node.text.indexOf(a) !== -1;
	            }
	        }
	    }, {
	        key: 'searchInput',
	        value: function searchInput() {
	            var _this2 = this;

	            if (this.search.val() === '') {
	                this.clear.hide();
	            } else {
	                this.clear.show();
	            }

	            clearTimeout(this.sto);
	            this.sto = setTimeout(function () {
	                _this2.filterByKeyword(_this2.search.val());
	            }, 300);
	        }
	    }, {
	        key: '_parentCheckEnable',
	        value: function _parentCheckEnable(data) {
	            for (var i in data) {
	                if (data[i].scale === undefined) continue;
	                if (data[i].scale > 2) continue;
	                data[i].nocheck = true;
	                if (data[i].nodes) {
	                    this._parentCheckEnable(data[i].nodes);
	                }
	            }
	            return data;
	        }

	        /**
	         * 选中或取消选中1个节点
	         * @param id 节点ID
	         * @param checked 选中为true，取消为false
	         */

	    }, {
	        key: 'checkOne',
	        value: function checkOne(id, checked) {
	            var node = this.treeObj.getNodeByParam("id", id, null);
	            this.treeObj.checkNode(node, checked, false, false);
	            this.tips.val(node.text);

	            mapCtrl.clearAll();

	            mapCtrl.addMarkerOne(node.lng, node.lat, node.id, '', node.type, 1, node.text);
	        }

	        /**
	         * 根据关键词过滤树
	         * @param k 关键词
	         */

	    }, {
	        key: 'filterByKeyword',
	        value: function filterByKeyword(k) {
	            if (!k) {
	                this.filter.empty().hide();
	                this.list.show();
	                return false;
	            } else {
	                this.list.hide();
	                this.filter.show();
	            }
	            var kNodes = this.treeObj.getNodesByFilter(this._filter1, false, null, k);
	            var t = '';
	            for (var i = 0; i < kNodes.length; i++) {
	                var c = '';
	                if (kNodes[i].checked) {
	                    c = 'checked';
	                }
	                // t += `<li><label><input type="checkbox" data-id="${kNodes[i].id}" ${c}>${kNodes[i].text}</label></li>`
	                if (this.options.style === 'checkbox') {
	                    t += '<li><label><input type="checkbox" data-id="' + kNodes[i].id + '" ' + c + '>' + kNodes[i].text + '</label></li>';
	                } else if (this.options.style === 'radio') {
	                    t += '<li><label><input type="radio" name="filter_radio" data-id="' + kNodes[i].id + '" ' + c + '>' + kNodes[i].text + '</label></li>';
	                }
	            }
	            this.filter.html(t);
	        }
	    }]);

	    return YisaTree;
	}();

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.ajaxLoadParse = exports.ajaxLoad = undefined;

	var _modal = __webpack_require__(3);

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
/* 3 */
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

/***/ })
/******/ ]);