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
	exports.warningSetting = warningSetting;

	var _ajaxLoadParse = __webpack_require__(2);

	function warningSetting() {
	  var postData = {},
	      flag = true,
	      sFlag = true,
	      data = [];
	  $('.edit-status').on('click', '.color-icon', function (e) {
	    $(e.currentTarget).addClass('on').siblings().removeClass('on');
	  });

	  $('#modifyBtn').on('click', function () {
	    $('.main').addClass('edit');
	  });

	  $('.js-shortname').on('input', function () {
	    console.log($(this).val().length);
	    if ($.trim($(this).val()) && $.trim($(this).val()).length > 1) {
	      sFlag = false;
	    } else {
	      sFlag = true;
	    }
	  });
	  $('#saveBtn').on('click', function () {
	    // 校验
	    if (isNaN(parseInt($.trim($('#carScore').val()))) || parseInt($.trim($('#carScore').val())) < 0) {
	      alertify.error('请输入一个正整数');
	      return false;
	    }

	    $('.js-score').each(function (i, item) {
	      if (isNaN(parseInt($.trim($(item).val())))) {
	        flag = false;
	      }
	      if (parseInt($.trim($(item).val())) < 0) {
	        flag = false;
	      }
	    });
	    if (!flag) {
	      alertify.error('请输入一个正整数');
	      return;
	    }
	    if (!sFlag) {
	      alertify.error('预警简称只能是一个字符');
	      return;
	    }
	    if (!$.trim($('.js-shortname').val())) {
	      alertify.error('请输入一个字符的预警简称');
	      return;
	    }

	    postData.carScore = $('#carScore').val();

	    $.each($('#tableList tbody tr'), function (i, item) {
	      var obj = {};
	      obj.id = $(item).find('.js-id').data('id');
	      obj.name = $(item).find('.js-name').text();
	      obj.score = $.trim($(item).find('.js-score').val());
	      obj.isDirec = $(item).find('.radio-btn:checked').data('checked');
	      obj.short = $.trim($(item).find('.js-shortname').val());
	      obj.color = $(item).find('.edit-status .color-icon.on').data('color');
	      data.push(obj);
	    });
	    postData.data = data;
	    (0, _ajaxLoadParse.ajaxLoad)({
	      type: 'POST',
	      url: ajaxURL.ajaxLoadUrl,
	      data: postData,
	      dataType: 'json'
	    }, function (e) {
	      (0, _ajaxLoadParse.ajaxLoadParse)(e, function () {
	        alertify.success('修改高危智能预警参数设置');
	        window.location.reload();
	      });
	    });
	  });

	  // 取消重载页面
	  $('#cancelBtn').on('click', function () {
	    window.location.reload();
	  });
	}

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