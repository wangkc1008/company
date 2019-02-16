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
	exports.locationList = locationList;

	var _ajaxLoadParse = __webpack_require__(2);

	var _paginator = __webpack_require__(4);

	var _tools = __webpack_require__(5);

	var _pccTree = __webpack_require__(6);

	function locationList() {
	    var temp = {};
	    var form = $('#editLocationForm');
	    var oid = (0, _tools.getQueryString)('region_id');

	    var pn = (0, _tools.getQueryString)('pn') ? (0, _tools.getQueryString)('pn') : 1;
	    var paginator = new _paginator.YisaPaginator($('#pagination'), {
	        type: 'href',
	        href: ajaxURL.select,
	        current: pn,
	        totalPage: totalPages,
	        skip: false
	    });

	    var tree = new _pccTree.PCCTree('#crossingTree', {
	        ajaxLoadUrl: ajaxURL.PCCUrl
	    });
	    var tree1 = new _pccTree.PCCTree('#crossingTree1', {
	        ajaxLoadUrl: ajaxURL.PCCUrl
	    });

	    if (oid) {
	        $('#searchForm').find("input[name='region_id']").val(oid);
	        tree.check(oid);
	    }

	    /**
	     * 批量导入
	     * */
	    var uploader = window.uploader = new plupload.Uploader({ //实例化一个plupload上传对象
	        browse_button: 'browse',
	        runtime: 'html5,flash',
	        url: ajaxURL.upload,
	        flash_swf_url: 'js/Moxie.swf',
	        filters: [{ title: "Excel文件", extensions: "xls,xlsx" }]
	    });
	    uploader.init();
	    uploader.bind('FilesAdded', function (uploader, files) {
	        uploader.start();
	    });
	    uploader.bind('Error', function (uploader, err) {
	        alert("文件上传失败,错误信息: " + err.message);
	    });
	    uploader.bind('FileUploaded', function (uploader, file, responseObject) {
	        var res = JSON.parse(responseObject.response);
	        (0, _ajaxLoadParse.ajaxLoadParse)(res, function () {
	            alertify.success('上传成功');
	        });
	    });

	    //厂商卡口编号失去焦点，ajax查询以萨卡口编号
	    $("input[name=loc_id]").on('blur', function () {
	        var loc_id = $(this).val();
	        if (loc_id != "") {
	            $.ajax({
	                url: ajaxURL.getManuId,
	                data: { 'id': loc_id },
	                dataType: 'json',
	                async: false
	            }).done(function (e) {
	                var _e$status = e.status,
	                    status = _e$status === undefined ? 1 : _e$status,
	                    message = e.message,
	                    data = e.data;

	                if (!status) {
	                    if (data.length) {
	                        $("input[name=location_id]").val(data[0].id);
	                    } else {
	                        alert('请填写已存在的厂商卡口编号');
	                        $("input[name=location_id]").val("");
	                    }
	                } else {
	                    alert(message);
	                    $("input[name=location_id]").val("");
	                }
	            }).fail(function () {
	                alert("数据请求失败");
	                $("input[name=location_id]").val("");
	            });
	        }
	    });
	    $("input[name=location_id]").css({ "background": "#eee", "cursor": "not-allowed", "pointer-events": "none" });
	    $(' .js-edit').on('click', function () {
	        $("input[name=loc_id]").css({ "background": "#eee", "cursor": "not-allowed", "pointer-events": "none" });
	        $("input[name=loc_id]").prop("readonly", "readonly");
	        var tr = $(this).parents('tr');
	        temp.location = tr.data('location');
	        temp.id = tr.data('id');
	        temp.type = tr.data('type');
	        temp.stitch = tr.data('stitch');
	        temp.feature = tr.data('feature');
	        temp.text = tr.data('text');
	        temp.pcc = tr.data('pcc');
	        temp.lng = tr.data('lng');
	        temp.lat = tr.data('lat');
	        temp.regionID = tr.data('regionid');
	        temp.regionName = tr.data('regionname');
	        temp.loc_id = tr.data('loc');

	        $('#rest').val('update');

	        $('#editModal').modal('show');
	        return false;
	    });

	    $('#addLocation').on('click', function () {
	        $("input[name=loc_id]").css({ "background": "transparent", "cursor": "default", "pointer-events": "auto" });
	        $("input[name=loc_id]").removeAttr("readonly");
	        temp = {};
	        var treeNode = tree1.treeObj.getCheckedNodes(true);
	        if (treeNode.length) {
	            tree1.treeObj.checkNode(treeNode[0], false, true, false);
	        }
	        $('#rest').val('add');
	    });

	    $('#searchForm').on('submit', function () {
	        //debugger;
	        var name = $(this).find("input[name='location']").val();
	        var id = $(this).find("input[name='region_id']").val();

	        // if (name == '' && id == "") {
	        //     alert('请选择查询区域或输入卡口名称');
	        //     return false;
	        // }
	    });

	    $(' .js-del').on('click', function () {
	        var tr = $(this).parents('tr');
	        if (confirm('确认删除该条数据？')) {
	            (0, _ajaxLoadParse.ajaxLoad)({
	                url: ajaxURL.del,
	                data: { 'id': tr.data('id') },
	                dataType: 'json'
	            }, function (e) {
	                (0, _ajaxLoadParse.ajaxLoadParse)(e, function () {
	                    location.reload();
	                });
	            });
	        } else {}
	    });

	    $('#save').on('click', function () {
	        var url = '';
	        var type = form.find("input[name='location_type']:checked").val();
	        var join = form.find("input[name='join_type']:checked").val();
	        var source = form.find("input[name=source_id]:checked").val();
	        var lid = form.find("input[name=location_id]").val();
	        var lname = form.find('input[name=location_name]').val();
	        var region = form.find("input[name='region_id']").val();
	        var lng = form.find('input[name=lng]').val();
	        var lat = form.find('input[name=lat]').val();
	        var mid = form.find("input[name=loc_id]").val();
	        if (type === undefined || type === '') {
	            alert('请选择卡口类型');
	            return false;
	        }
	        if (join === undefined || join === '') {
	            alert('请选择卡口图片拼接类型');
	            return false;
	        }
	        if (source === undefined || source === '') {
	            alert('请选择卡口拍车方向');
	            return false;
	        }
	        if (mid === undefined || mid === '') {
	            alert('请填写厂商卡口编号');
	            return false;
	        }
	        if (lid === undefined || lid === '') {
	            alert('请填写已存在的厂商卡口编号');
	            return false;
	        }
	        if (lname === undefined || lname === '') {
	            alert('请填写卡口名称');
	            return false;
	        }
	        if (region === undefined || region === '') {
	            alert('请选择所属区域');
	            return false;
	        }
	        if (lng === undefined || lng === '' || lat === undefined || lat === '') {
	            alert('请填写经纬度或在地图上标注');
	            return false;
	        }

	        if ($('#rest').val() == 'add') {
	            url = ajaxURL.add;
	        } else {
	            url = ajaxURL.update;
	        }

	        (0, _ajaxLoadParse.ajaxLoad)({
	            url: url,
	            method: 'post',
	            data: $('#editLocationForm').serialize(),
	            dataType: 'json'
	        }, function (e) {
	            (0, _ajaxLoadParse.ajaxLoadParse)(e, function () {
	                alert("保存成功");
	                location.reload();
	            });
	        });
	    });

	    $('#editModal').on('shown.bs.modal', function () {
	        var fw = $('#editLocationForm').width(),
	            fh = $('#editLocationForm').height();
	        $(' .map-parent').css({ height: fh, width: fw });

	        var marker = null;

	        if (!window.tmap) {
	            try {
	                mapCtrl._mapEvent = false;
	                mapCtrl.initMap('map');
	                if (mapConfig.type == 'tumeng') {
	                    tmap.setZoom(13);
	                }
	            } catch (e) {
	                $('#map').html('地图加载失败;');
	            }
	        }

	        mapCtrl.clearAll();

	        $("input[name=location_type]").removeAttr("checked");
	        $("input[name=join_type]").removeAttr("checked");
	        $("input[name=source_id]").removeAttr("checked");

	        if (temp.location) {
	            $("input[name=location_type][value=" + temp.type + "]").prop("checked", true);
	            $("input[name=join_type][value=" + temp.stitch + "]").prop("checked", true);
	            $("input[name=source_id][value=" + temp.feature + "]").prop("checked", true);
	            $("input[name=location_id]").val(temp.location);
	            $("input[name=old_id]").val(temp.location);
	            $("input[name=id]").val(temp.id);
	            $('input[name=location_name]').val(temp.text);
	            form.find("input[name=region_id]").val(temp.regionID);
	            form.find("#regionName").val(temp.regionName);
	            $('input[name=lng]').val(temp.lng);
	            $('input[name=lat]').val(temp.lat);
	            $('input[name=loc_id]').val(temp.loc_id);
	            if (mapConfig.type == 'tumeng') {
	                var lnglat = new IMAP.LngLat(temp.lng, temp.lat);
	                tmap.setCenter(lnglat);
	            } else if (mapConfig.type == 'pgis') {
	                var _lnglat = new Point(temp.lng, temp.lat);
	                pmap.centerAndZoom(_lnglat, 13);
	            } else if (mapConfig.type == 'baidu') {
	                var _lnglat2 = new BMap.Point(temp.lng, temp.lat);
	                tmap.centerAndZoom(_lnglat2, 13);
	            }
	            marker = mapCtrl.addMarkerOne(temp.lng, temp.lat, '', '', 'stop-marker', 1);
	            tree1.check(temp.regionID);
	        } else {
	            marker = mapCtrl.addMarkerOne(mapConfig.center[0], mapConfig.center[1], '', '', 'stop-marker', 1);
	            $("input[name=location_id]").val('');
	            $('input[name=location_name]').val('');
	            form.find("input[name=region_id]").val('');
	            form.find("#regionName").val('');
	            $('input[name=lng]').val('');
	            $('input[name=lat]').val('');
	            $('input[name=loc_id]').val('');
	        }
	        if (mapConfig.type == 'tumeng') {
	            marker.addEventListener(IMAP.Constants.DRAG_END, function (e) {
	                $('#editLocationForm').find('input[name="lng"]').val(e.lnglat.lng);
	                $('#editLocationForm').find('input[name="lat"]').val(e.lnglat.lat);
	            }, marker);
	        } else if (mapConfig.type == 'pgis') {
	            marker.startMove(function () {
	                var lnglat = marker.getPoint();
	                $('#editLocationForm').find('input[name="lng"]').val(lnglat.x);
	                $('#editLocationForm').find('input[name="lat"]').val(lnglat.y);
	            });
	        } else if (mapConfig.type == 'baidu') {
	            marker.addEventListener('dragend', function (e) {
	                $('#editLocationForm').find('input[name="lng"]').val(e.point.lng);
	                $('#editLocationForm').find('input[name="lat"]').val(e.point.lat);
	            }, marker);
	        }
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

/***/ }),
/* 4 */
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
/* 5 */
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
/* 6 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var PCCTree = exports.PCCTree = function () {
	  /**
	   * PCCTree构造函数
	   * @param id  "#idstring"
	   * @param options {}
	   */
	  function PCCTree(id, options) {
	    _classCallCheck(this, PCCTree);

	    this.id = id;
	    this.elem = $(id);
	    this.parentMenu = this.elem.parents('.tree-content');
	    this.focusInput = this.elem.parents('.tree-content').prev('.location-area');
	    this['default'] = { // PCCTree的默认参数选项
	      top: this.focusInput.outerHeight() - 3, // tree容器距离父容器顶部高度
	      left: 0, // tree容器距离父容器左边距离
	      height: 250, // tree容器默认高度
	      cInptName: 'region_id', // hidden input name 市
	      style: 'radio'
	    };
	    this.options = $.extend({}, this['default'], options);
	    this.hiddenInpts = {}; // 包含所有hidden input的对象
	    this.treeObj = null;
	    this._init();
	    this._initEvent();

	    return this;
	  }

	  // 初始化PCCTree


	  _createClass(PCCTree, [{
	    key: '_init',
	    value: function _init() {
	      var self = this;
	      if (!this.options.ajaxLoadUrl) {
	        alert('请给出一个合适的数据请求地址');
	      } else {
	        self._ajaxFun();
	      }
	      this.hiddenInpt = this._createHiddenInput();
	    }

	    // 初始化PCCTree显示隐藏的事件

	  }, {
	    key: '_initEvent',
	    value: function _initEvent() {
	      var self = this;
	      this.focusInput.on('click', function () {
	        self.showMenu();
	      }).on('blur', function () {
	        self.hideMenu();
	      });
	      this.elem.on('mousedown', function (e) {
	        e.stopPropagation();
	        e.preventDefault();
	      });
	    }

	    // 请求数据ajax

	  }, {
	    key: '_ajaxFun',
	    value: function _ajaxFun() {
	      var self = this;
	      $.ajax({
	        async: false,
	        type: 'GET',
	        url: this.options.ajaxLoadUrl,
	        dataType: 'json'
	      }).done(function (jsonData) {
	        self.initZtree(jsonData.data);
	      }).fail(function () {
	        alert('数据请求失败！');
	      });
	    }

	    /**设置选中或未选中id的节点
	     * @param id nodeid
	     * @param checked node checked status
	     */

	  }, {
	    key: 'check',
	    value: function check(id, checked) {
	      console.log(id, checked);
	      var node = this.treeObj.getNodeByParam('id', id, null);
	      this.treeObj.checkNode(node, checked, true, false);

	      var nodes = this.treeObj.getChangeCheckedNodes();
	      for (var i = 0, l = nodes.length; i < l; i++) {
	        nodes[i].checkedOld = nodes[i].checked;
	      }
	    }

	    /**
	     * 初始化zTree结构
	     * @param ztreeData 省市县数据
	     */

	  }, {
	    key: 'initZtree',
	    value: function initZtree(ztreeData) {
	      var self = this;
	      this.treeObj = $.fn.zTree.init(this.elem, {
	        check: {
	          enable: true,
	          chkStyle: self.options.style,
	          radioType: 'all'
	        },
	        view: {
	          dblClickExpand: false
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
	          onClick: function onClick(e, treeId, treeNode) {
	            self.onClick(e, treeId, treeNode);
	          },
	          onCheck: function onCheck(e, treeId, treeNode) {
	            self.onCheck(e, treeId, treeNode);
	          }
	        }
	      }, ztreeData);
	    }

	    // 创建hidden inputs

	  }, {
	    key: '_createHiddenInput',
	    value: function _createHiddenInput() {
	      var cInpt = $('<input type="hidden" name="' + this.options.cInptName + '" id="' + this._utilInptNameToId(this.options.cInptName) + '" value="">');
	      if (this.elem.parents('form').html()) {
	        this.elem.parents('form').append(cInpt);
	      } else {
	        this.elem.parents('.form').append(cInpt);
	      }
	      return cInpt;
	    }

	    /**
	     *  转换name to id
	     * @param name 类似province_id
	     * @returns {string} provinceId
	     * @private
	     */

	  }, {
	    key: '_utilInptNameToId',
	    value: function _utilInptNameToId(name) {
	      return name.split('_')[0] + name.split('_')[1].slice(0, 1).toUpperCase() + name.split('_')[1].slice(1);
	    }
	  }, {
	    key: 'onClick',
	    value: function onClick(e, treeId, treeNode) {
	      var zTree = $.fn.zTree.getZTreeObj(this.id.slice(1));
	      zTree.checkNode(treeNode, !treeNode.checked, null, true);
	      return false;
	    }
	  }, {
	    key: 'onCheck',
	    value: function onCheck(e, treeId, treeNode) {
	      var self = this;
	      var zTree = $.fn.zTree.getZTreeObj(this.id.slice(1)),
	          nodes = zTree.getCheckedNodes(true),
	          v = '',
	          id = '',
	          areaObj = {};

	      for (var i = 0, l = nodes.length; i < l; i++) {
	        if (self.options.onlyLast && nodes[i].isParent) {
	          return false;
	        }
	        if (self.options.onlyLast) {
	          v += nodes[i].text + ',';
	        } else {
	          v += this._findParentNodeName(nodes[i]) + nodes[i].text + ',';
	        }
	        if (self.options.style == 'checkbox') {
	          id += nodes[i].id + ',';
	        } else {
	          id = nodes[i].id;
	        }
	      }
	      if (v.length > 0) v = v.substring(0, v.length - 1);

	      areaObj = this.focusInput;

	      // 已选省市县名称和id的hidden input赋值
	      areaObj.val(v);
	      if (self.options.onlyLast) {
	        areaObj.attr('data-id', id);
	      } else {
	        this.hiddenInpt.val(id);
	      }
	      // console.log(this.hiddenInpt.val(), areaObj.val());
	    }
	  }, {
	    key: 'showMenu',
	    value: function showMenu() {
	      var self = this;
	      self.parentMenu.css({
	        left: this.options.left + 'px',
	        top: this.options.top + 'px',
	        height: this.options.height + 'px'
	      }).slideDown('fast');
	      $('body').bind('mousedown', function () {
	        self.onBodyDown();
	      });
	    }
	  }, {
	    key: 'hideMenu',
	    value: function hideMenu() {
	      var self = this;
	      self.parentMenu.fadeOut('fast');
	      $('body').unbind('mousedown', function () {
	        self.onBodyDown();
	      });
	    }
	  }, {
	    key: 'onBodyDown',
	    value: function onBodyDown() {
	      this.hideMenu();
	    }

	    /**
	     * 查找地区上级及上上级name and id
	     * @param node 当前选中的（省、市、县）
	     * @returns nodeName: string
	     */

	  }, {
	    key: '_findParentNodeName',
	    value: function _findParentNodeName(node) {
	      var nodeName = '';
	      if (node.getParentNode()) {
	        nodeName = node.getParentNode().text + '-' + nodeName;
	        if (node.getParentNode().getParentNode()) {
	          nodeName = node.getParentNode().getParentNode().text + '-' + nodeName;
	        }
	      }
	      // return {
	      //     nodeId: nodeId,
	      //     nodeName: nodeName
	      // };
	      return nodeName;
	    }
	  }]);

	  return PCCTree;
	}();

/***/ })
/******/ ]);