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
/***/ (function(module, exports) {

	'use strict';

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	// pgis.js
	(function () {
	    if (typeof EzMap !== 'undefined') {
	        var options = {
	            minZoom: mapConfig.minZoom,
	            maxZoom: mapConfig.maxZoom,
	            center: new Point(mapConfig.center[0], mapConfig.center[1]),
	            zoom: mapConfig.zoom
	        };
	        /** ****PGIS地图用到的变量说明：
	         * markerArr - 地图上所有点的marker集合 ， markerIdArr - 地图上所有点的id集合
	         * markerPickedArr -  地图上所有被选中的点的marker集合,markerPickedIdArr - 地图上所有被选中的点的id集合
	         * drawTool - 绘制工具 , vectorArr - 绘制的图形集合
	         * labels - Marker模拟label集合 , boundaryOverlayArr - 行政区域边界线集合，用于形成边界
	         ** ****PGIS 函数说明：
	         * */
	        var map = void 0,
	            marker = void 0,
	            carMarker = void 0,
	            markerArr = [],
	            markerIdArr = [],
	            markerPickedIdArr = [],
	            markerPickedArr = [],
	            drawTool = null,
	            addOverlayEvt = void 0,
	            vectorArr = [],
	            overlayArr = {},
	            infowindow = void 0;
	        var labels = [],
	            label = void 0,
	            boundaryOverlayArr = [];
	        var warningMarkerArr = []; // 实时预警地图点集合
	        var boundaryLoodTime = 0;
	        var pickedLabelArr = [];

	        var mapCtrl = {
	            _mapEvent: true, // 是否启用地图map事件，获取可视区域标注点
	            _markerEvent: true, // 是否启用标注点marker事件
	            _scrollWheel: true, // 是否启用鼠标缩放地图
	            _dragged: true, // 是否启用鼠标拖放地图
	            _markerAll: [],
	            _drivingAll: {}, //所有车牌号行驶路线
	            _onePick: false, // 地图只允许选择一个标注点
	            _markerLoadType: '', // 地图标注点加载的类型  默认加载全部，'picked'只加载被选中的图标
	            _navi: '',
	            _viewFirst: true, // 是否第一次加载可视点，即从城市变成加载可视点
	            /* 初始化地图 */
	            initMap: function initMap(elem) {
	                var _this = this;
	                if (!map) {
	                    window.pmap = map = new EzMap(document.getElementById(elem));
	                    map.initialize();
	                    //map.showSmallMapControl();
	                    map.centerAndZoom(new Point(mapConfig.center[0], mapConfig.center[1]), mapConfig.zoom);
	                    // 隐藏地图右上角服务按钮
	                    map.hideMapServer();
	                } else {
	                    return;
	                }
	                if (options.zoom < 12) {
	                    _this._viewFirst = true;
	                } else {
	                    _this._viewFirst = false;
	                }

	                map.addMapChangeListener(function () {
	                    // api中找不到设置最大和最小缩放级别的方法，曲线救国曲线
	                    if (map.getZoomLevel() > options.maxZoom) {
	                        map.zoomTo(options.maxZoom);
	                    }
	                    if (map.getZoomLevel() < options.minZoom) {
	                        map.zoomTo(options.minZoom);
	                    }
	                    if (_this._mapEvent) {
	                        _this.reLoadViewMarker();
	                    }
	                    // 缩放开始前全部清除,缩放结束后加载
	                    if (map.getZoomLevel() < 12) {
	                        if (vectorArr) {
	                            for (var i in vectorArr) {
	                                map.removeOverlay(vectorArr[i]);
	                            }
	                        }
	                    } else {
	                        if (vectorArr) {
	                            for (var _i in vectorArr) {
	                                map.addOverlay(vectorArr[_i]);
	                            }
	                        }
	                    }
	                });
	            },
	            /**
	             *  显示地图可视区域内的点
	             *  @param String 'all'默认全部显示 'picked'显示选中
	             *  */
	            showViewMarker: function showViewMarker() {
	                var _this = this;
	                var loadType = _this._markerLoadType || 'all';
	                if (typeof yisaTree != 'undefined' && map.getZoomLevel() < 12) {
	                    _this.loadCity();
	                    // 隐藏设备图标说明面板
	                    $('#map-pannel').hide();
	                } else {
	                    // 显示设备图标说明面板
	                    $('#map-pannel').show();
	                    var _bounds = map.getBoundsLatLng(),
	                        _sw = _bounds.minX + ',' + _bounds.minY,
	                        _ne = _bounds.maxX + ',' + _bounds.maxY;
	                    // 清除地图所有点
	                    _this.clearAllMarker();
	                    $.ajax({
	                        async: false,
	                        url: mapConfig.getLocationsUrl,
	                        data: { 'sw': _sw, 'ne': _ne },
	                        dataType: 'json'
	                    }).done(function (e) {
	                        var status = e.status,
	                            message = e.message,
	                            data = e.data;

	                        if (!status) {
	                            if (typeof data !== 'undefined') {
	                                // _this.addMarker(data);
	                                switch (loadType) {
	                                    case 'all':
	                                        _this.addMarker(data);
	                                        break;
	                                    case 'picked':
	                                        _this.addPickedMarker(data);
	                                        break;
	                                    default:
	                                        alert('Error：未知加载类型！');
	                                        return;
	                                }
	                            }
	                        } else {
	                            alert(message);
	                        }
	                    }).fail(function () {
	                        alert('数据请求失败!');
	                    });
	                }
	            },
	            /**
	             * 批量添加标注点
	             * arr : 坐标集合
	             * */
	            addMarker: function addMarker(arr) {
	                var _this = this,
	                    marker = void 0;
	                if (!map) return;
	                for (var a = 0; a < arr.length; a++) {
	                    var mkIcon = new Icon();
	                    mkIcon.image = staticsUrl + '/images/map/' + arr[a].type + '.png';
	                    mkIcon.width = 24;
	                    mkIcon.height = 23;
	                    //mkIcon.leftOffset = 12;
	                    //mkIcon.topOffset = -11.5;
	                    var title = new Title(arr[a].text, 12, 7, '宋体', '#000', '#fff', '#ccc', '1');
	                    var lngLat = new Point(arr[a].lng, arr[a].lat);
	                    if (parseInt(arr[a].lng)) {
	                        marker = new Marker(lngLat, mkIcon, title);
	                        marker.id = arr[a].id;
	                        marker.type = arr[a].type;
	                        marker.text = arr[a].text;
	                        marker.hideTitle();
	                        markerArr.push(marker);
	                        markerIdArr.push(marker.id);
	                        if (_this._markerEvent) {
	                            _this.addMarkerEvt(marker);
	                        }
	                    }
	                    map.addOverlay(marker);
	                    if ($.inArray(arr[a].id, markerPickedIdArr) !== -1) {
	                        _this.iconPicked(marker);
	                    }
	                }
	            },
	            /**
	             * 添加选中标注点
	             * arr : 坐标集合
	             * */
	            addPickedMarker: function addPickedMarker(arr) {
	                var _this = this,
	                    marker = void 0;
	                if (!map) return;
	                for (var a = 0; a < arr.length; a++) {
	                    if ($.inArray(arr[a].id, markerPickedIdArr) !== -1) {
	                        var icon = new Icon();
	                        icon.image = staticsUrl + '/images/map/' + arr[a].type + '.png';
	                        icon.width = 24;
	                        icon.height = 23;
	                        //icon.leftOffset = 12;
	                        //icon.topOffset = -11.5;
	                        var title = new Title(arr[a].text, 12, 7, '宋体', '#000', '#fff', '#ccc', '1');
	                        var lngLat = new Point(arr[a].lng, arr[a].lat);
	                        if (parseInt(arr[a].lng)) {
	                            marker = new Marker(lngLat, icon, title);
	                            marker.id = arr[a].id;
	                            marker.type = arr[a].type;
	                            marker.text = arr[a].text;
	                            markerArr.push(marker);
	                            markerIdArr.push(marker.id);
	                            if (_this._markerEvent) {
	                                _this.addMarkerEvt(marker);
	                            }
	                        }
	                        map.addOverlay(marker);
	                        _this.iconPicked(marker);
	                    }
	                }
	            },
	            /* 添加一个marker,如果传入con，显示infowindow */
	            addMarkerOne: function addMarkerOne(lng, lat, locid, con) {
	                var icon = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : '1';
	                var edit = arguments[5];

	                var _this = this;
	                var mkIcon = new Icon();
	                if (icon == 'stop-icon') {
	                    mkIcon.width = 11;
	                    mkIcon.height = 11;
	                    //mkIcon.leftOffset = 5;
	                    //mkIcon.topOffset = -5;
	                } else {
	                    mkIcon.width = 24;
	                    mkIcon.height = 23;
	                    //mkIcon.leftOffset = 12;
	                    //mkIcon.topOffset = -11;
	                }
	                mkIcon.image = staticsUrl + '/images/map/' + icon + 'h.png';
	                var lnglat = new Point(lng, lat);
	                var marker = new Marker(lnglat, mkIcon);
	                marker.id = locid;
	                marker.type = icon;
	                if (con) {
	                    marker.addListener('click', function (e) {
	                        _this.infoWindow(lng, lat, '', con, 200, 170);
	                    });
	                }
	                map.addOverlay(marker);
	                if (edit) {
	                    marker.enableEdit();
	                }
	                this._markerAll.push(marker);
	                return marker;
	            },
	            /*添加temArr中的marker*/
	            warningAddMakers: function warningAddMakers(tempArr, flag) {
	                var _this = this;
	                var mkIcon = new Icon();
	                mkIcon.image = staticsUrl + '/images/map/1.png';
	                mkIcon.width = 24;
	                mkIcon.height = 23;
	                //mkIcon.leftOffset = 12;
	                //mkIcon.topOffset = -11;
	                // 超过20个点位在数组中移除
	                var len = warningMarkerArr.length;
	                if (len + tempArr.length > 20) {
	                    for (var i = 0; i < len + tempArr.length - 20; i++) {
	                        warningMarkerArr.pop();
	                    }
	                }
	                flag ? warningMarkerArr = tempArr.concat(warningMarkerArr) : warningMarkerArr = warningMarkerArr.concat(tempArr);
	                // 移除所有点
	                map.clearOverlays();
	                warningMarkerArr.forEach(function (item) {
	                    var lnglat = new Point(item.lng, item.lat);
	                    var marker = new Marker(lnglat, mkIcon);
	                    marker.id = item.locationID;
	                    map.addOverlay(marker, true);
	                    if (item.con) {
	                        // 默认显示第一个
	                        if (parseInt(item.lng) != 0 && parseInt(item.lat) != 0) {
	                            var tit = item.title + ('<img class=\'info-close\' src=\'' + staticsUrl + '/images/map/close.gif\'>');
	                            if (item.index === 0) {
	                                _this.infoWindow(item.lng, item.lat, tit, item.con, 500, 230);
	                                _this.setPosition(item.lng, item.lat);
	                            }
	                            (function (marker) {
	                                marker.addListener('click', function (e) {
	                                    _this.infoWindow(item.lng, item.lat, tit, item.con, 500, 230);
	                                    $(" .info-close").on('click', function () {
	                                        _this.closeWindow();
	                                    });
	                                });
	                            })(marker);
	                            $(" .info-close").on('click', function () {
	                                _this.closeWindow();
	                            });
	                        }
	                    }
	                });
	            },
	            /*轨迹重现：添加marker*/
	            addMarkerAll: function addMarkerAll(arr) {
	                var _this = this;
	                if (map) {
	                    for (var a = 0; a < arr.length; a++) {
	                        if (!parseInt(arr[a][0])) continue;
	                        _this.addMarkerOne(arr[a][0], arr[a][1], arr[a][2], '', 'stop-icon');
	                    }
	                }
	            },
	            /*轨迹重现：绘制线路 */
	            drawLine: function drawLine(points, c, id) {
	                if (typeof points[0] == 'string') {
	                    points = points.map(function (item, v) {
	                        return new Point(item.split(',')[0], item.split(',')[1]);
	                    });
	                }
	                if (points.length >= 2) {
	                    var polyline = new Polyline(points, c, 3, 1);
	                    polyline.id = id;
	                    map.addOverlay(polyline);
	                }
	            },
	            /**
	             * 标注点Marker添加事件
	             * mkr : 事件源
	             * */
	            addMarkerEvt: function addMarkerEvt(mkr) {
	                var _this = this;
	                mkr.addListener('click', function () {
	                    var _marker = mkr;
	                    if ($.inArray(_marker.id, markerPickedIdArr) == -1) {
	                        // 只允许地图选这一个标注点的时候
	                        if (_this._onePick) {
	                            for (var m = 0; m < markerArr.length; m++) {
	                                if (markerArr[m].id == markerPickedIdArr[0]) {
	                                    _this.iconRecover(markerArr[m]);
	                                }
	                            }
	                            markerPickedIdArr = [];
	                        }
	                        markerPickedIdArr.push(_marker.id);
	                        _this.iconPicked(_marker);
	                        yisaTree.check(markerPickedIdArr);
	                    } else {
	                        markerPickedIdArr = markerPickedIdArr.filter(function (f) {
	                            return f != _marker.id.split("_")[0];
	                        });
	                        _this.iconRecover(_marker);
	                        // yisaTree.checkOne(_marker.id, false);// 单选选中转非选中
	                        yisaTree.check(markerPickedIdArr);
	                    }
	                });
	                mkr.addListener('mouseover', function () {
	                    mkr.setZIndex(200);
	                    mkr.showTitle();
	                });
	                mkr.addListener('mouseout', function () {
	                    mkr.setZIndex(100);
	                    mkr.hideTitle();
	                });
	            },
	            /**
	             * 标注点Marker取消选中事件绑定
	             * mkr : 事件源
	             * */
	            markerPickedEvt: function markerPickedEvt(marker) {
	                var _this = this;
	                marker.addListener('click', function () {
	                    // e.stopPropagation();
	                    markerPickedIdArr = markerPickedIdArr.filter(function (f) {
	                        return f != marker.id.split("_")[0];
	                    });
	                    _this.iconRecover(marker);
	                    // yisaTree.checkOne(marker.id.split("_")[0], false);// 单选选中转非选中
	                    yisaTree.check(markerPickedIdArr);
	                });
	                marker.addListener('mouseover', function (e) {
	                    e.stopPropagation();
	                    marker.setZIndex(400);
	                    marker.showTitle();
	                });
	                marker.addListener('mouseout', function (e) {
	                    e.stopPropagation();
	                    marker.setZIndex(300);
	                    marker.hideTitle();
	                });
	            },
	            /* 标注点被选中后的样式 */
	            iconPicked: function iconPicked(m) {
	                var _this = this;
	                var icon = new Icon();
	                icon.image = staticsUrl + '/images/map/' + m.type + 'h.png';
	                if (m.type == 'stop-icon') {
	                    icon.width = 14;
	                    icon.height = 14;
	                    //icon.leftOffset = 7;
	                    //icon.topOffset = -14;
	                } else {
	                    icon.width = 24;
	                    icon.height = 23;
	                    //icon.leftOffset = 12;
	                    //icon.topOffset = -11.5;
	                }
	                var title = new Title(m.text, 12, 7, '宋体', '#000', '#fff', '#ccc', '1');
	                var lngLat = m.point;
	                var marker = new Marker(lngLat, icon, title);
	                marker.hideTitle();
	                marker.setZIndex(300);
	                marker.id = m.id + '_picked';
	                marker.type = m.type;
	                marker.text = m.text;
	                markerPickedArr.push(marker);
	                _this.markerPickedEvt(marker);
	                map.addOverlay(marker);
	            },
	            /* 恢复标注点样式 */
	            iconRecover: function iconRecover(m) {
	                for (var i = 0; i < markerPickedArr.length; i++) {
	                    if (markerPickedArr[i].id == m.id) {
	                        markerPickedArr.splice(i, 1);
	                    }
	                }
	                map.removeOverlay(m);
	            },
	            /* 重载可视区域点 */
	            reLoadViewMarker: function reLoadViewMarker() {
	                var _this = this,
	                    _currentZoom = map.getZoomLevel();
	                // 没有树形结构的时候
	                if (typeof yisaTree != 'undefined' && _currentZoom < 12) {
	                    //应该缩放前全部清除，暂时做法，判断zoom级别后再进行是否清除选择
	                    // //删除所有点图标
	                    for (var i = 0; i < markerArr.length; i++) {
	                        map.removeOverlay(markerArr[i]);
	                    }
	                    for (var _i2 = 0; _i2 < markerPickedArr.length; _i2++) {
	                        map.removeOverlay(markerPickedArr[_i2]);
	                    }
	                    markerPickedArr = [];
	                    markerArr = [];
	                    if (labels.length == 0) {
	                        _this.loadCity();
	                        $('#map-pannel').hide();
	                    }
	                } else {
	                    for (var _i3 = 0; _i3 < labels.length; _i3++) {
	                        map.removeOverlay(labels[_i3]);
	                    }
	                    labels = [];
	                    _this.showViewMarker();
	                }
	            },
	            /**
	             * 应用：搜索结果页面
	             * 定位
	             * */
	            fixedPosition: function fixedPosition(lng, lat) {
	                for (var i = 0; i < markerArr.length; i++) {
	                    map.removeOverlay(markerArr[i]);
	                }
	                markerArr = [];
	                var lnglat = new Point(lng, lat);
	                map.centerAndZoom(lnglat, 16);
	                var mkIcon = new Icon();
	                mkIcon.image = staticsUrl + '/images/map/1.png';
	                mkIcon.width = 24;
	                mkIcon.height = 23;
	                // mkIcon.leftOffset = 12;
	                // mkIcon.topOffset = -11;
	                marker = new Marker(lnglat, mkIcon);
	                map.addOverlay(marker);
	                markerArr.push(marker);
	            },
	            /* 列表与地图交互 */
	            listControlMap: function listControlMap(id, str) {
	                var _this = this;
	                if (str == 'del') {
	                    for (var m = 0; m < markerPickedArr.length; m++) {
	                        if (markerPickedArr[m].id.split("_")[0] == id) {
	                            map.removeOverlay(markerPickedArr[m]);
	                            markerPickedArr.splice(m, 1);
	                        }
	                    }
	                    markerPickedIdArr = markerPickedIdArr.filter(function (f) {
	                        return f != id;
	                    });
	                } else if (str == 'add') {
	                    markerPickedIdArr.push(id);
	                    for (var _m = 0; _m < markerArr.length; _m++) {
	                        if (markerArr[_m].id == id) {
	                            _this.iconPicked(markerArr[_m]);
	                        }
	                    }
	                } else {
	                    alert('勾选状态error');
	                }
	            },
	            /*搜索页地图选择*/
	            treePickedMarker: function treePickedMarker(arr) {
	                var _this = this;
	                for (var m = 0; m < markerArr.length; m++) {
	                    if (markerPickedIdArr.indexOf(markerArr[m].id) >= 0) {
	                        _this.iconRecover(markerArr[m]);
	                    }
	                }
	                markerPickedIdArr = arr;
	                for (var _m2 = 0; _m2 < markerArr.length; _m2++) {
	                    if (markerPickedIdArr.indexOf(markerArr[_m2].id) >= 0) {
	                        _this.iconPicked(markerArr[_m2]);
	                    }
	                }
	            },
	            /**
	             * 设置地图中心位置，及缩放级别
	             * 无参数返回初始状态
	             * */
	            setPosition: function setPosition(lng, lat, zoom) {
	                if (!lng && !lat && !zoom) {
	                    map.clearOverlays();
	                }
	                var _lnglat = void 0,
	                    _zoom = void 0;
	                if (lng && lat) {
	                    _lnglat = new Point(lng, lat);
	                } else {
	                    _lnglat = options.center;
	                }
	                if (zoom) {
	                    _zoom = zoom;
	                } else {
	                    _zoom = options.zoom;
	                }
	                map.centerAndZoom(_lnglat, _zoom);
	            },
	            /**
	             * 加载区县级的点，以实现类似点标注的效果，点击后改变地图缩放等级，加载可视区域的点  PGIS地图使用marker模拟
	             * data: Array
	             * {text,lng,lat,count}
	             * */
	            addLabels: function addLabels(data) {
	                var _this = this,
	                    _marker = void 0;
	                var mkIcon = new Icon();
	                mkIcon.width = 62;
	                mkIcon.height = 62;
	                //mkIcon.leftOffset = 31;
	                //mkIcon.topOffset = -31;
	                mkIcon.image = staticsUrl + '/images/map/label-green.png';
	                for (var i = 0; i < data.length; i++) {
	                    var str = '<div class=\'map-label\'><span class=\'name\'>' + data[i].text + '</span><span class=\'num\'>' + data[i].count + '</span></div>';
	                    var title = new Title(str, 12, 0, '微软雅黑', '#fff', 'transparent', 'transparent', 0);
	                    var lnglat = new Point(data[i].lng, data[i].lat);
	                    if (parseInt(data[i].lng)) {
	                        _marker = new Marker(lnglat, mkIcon, title);
	                        _marker.lng = data[i].lng;
	                        _marker.lat = data[i].lat;
	                        _marker.setZIndex(100 + i);
	                        map.addOverlay(_marker);
	                        labels.push(_marker);
	                        _this.addLabelEvt(_marker, lnglat, title, i);
	                    }
	                    $('.map-label').parent().attr('title', '').css({ 'width': '0', 'height': '0' });
	                }
	            },
	            /**
	             * Label事件*/
	            addLabelEvt: function addLabelEvt(mkr, lnglat, title, i) {
	                var _this = this,
	                    marker = void 0;
	                var mkIcon = new Icon();
	                mkIcon.width = 62;
	                mkIcon.height = 62;
	                //mkIcon.leftOffset = 31;
	                //mkIcon.topOffset = -31;
	                mkr.addListener('mouseover', function (e) {
	                    if (pickedLabelArr.length) {
	                        for (var j = 0; j < pickedLabelArr.length; j++) {
	                            map.removeOverlay(pickedLabelArr[j]);
	                        }
	                        pickedLabelArr = [];
	                    }
	                    e.stopPropagation();
	                    mkIcon.image = staticsUrl + '/images/map/label-red.png';
	                    marker = new Marker(lnglat, mkIcon, title);
	                    marker.setZIndex(101 + parseInt(i));
	                    map.addOverlay(marker);
	                    marker.lng = mkr.lng;
	                    marker.lat = mkr.lat;
	                    pickedLabelArr.push(marker);
	                    _this.addLabelOverEvt(marker);
	                    $('.map-label').parent().attr('title', '').css({ 'width': '0', 'height': '0' });
	                });
	            },
	            /**
	             * Label Mouseover添加marker事件*/
	            addLabelOverEvt: function addLabelOverEvt(mkr) {
	                var _this = this;
	                mkr.addListener('click', function () {
	                    map.removeOverlay(mkr);
	                    var _lng = mkr.lng,
	                        _lat = mkr.lat;
	                    map.centerAndZoom(new Point(_lng, _lat), 12);
	                    _this.reLoadViewMarker();
	                });
	                mkr.addListener('mouseout', function (e) {
	                    e.stopPropagation();
	                    if (mkr) {
	                        map.removeOverlay(mkr);
	                    }
	                });
	            },
	            /**
	             * 加载区县点*/
	            loadCity: function loadCity() {
	                var _this = this;
	                if (map) {
	                    if (typeof yisaTree !== 'undefined') {
	                        if (yisaTree instanceof Object) {
	                            var labelArr = yisaTree.getCounty();
	                            _this.addLabels(labelArr);
	                        }
	                    }
	                }
	            },
	            /* drawCircle圆形  drawRectangle矩形  drawClear删除 */
	            draw: function draw(drawType) {
	                var _this = this;
	                _this.drawClose();
	                var tempPicked = [];
	                if (drawType == 'drawCircle') {
	                    // 画圆
	                    map.changeDragMode('drawCircle', dataInputx, dataInputy, function (str) {
	                        vectorArr = [];
	                        var overlayArr = map.getOverlays();
	                        vectorArr.push(overlayArr[overlayArr.length - 1]);
	                        var circleArr = str.split(',');
	                        for (var m = 0; m < markerArr.length; m++) {
	                            if (_this.inCircle(circleArr, markerArr[m].getPoint()) && $.inArray(markerArr[m].id, markerPickedIdArr) == -1) {
	                                markerPickedIdArr.push(markerArr[m].id);
	                                _this.iconPicked(markerArr[m]);
	                                tempPicked.push(markerArr[m]);
	                            }
	                        }
	                        // 列表勾选
	                        yisaTree.check(markerPickedIdArr);
	                        if (tempPicked.length == 0) {
	                            map.removeOverlay(vectorArr[0]);
	                            vectorArr = [];
	                            alert('未选择任何标注点');
	                        }
	                        map.changeDragMode('pan');
	                        $('#drawCircle').removeClass('current');
	                        $('#drawDefault').addClass('current');
	                    });
	                } else if (drawType == 'drawRectangle') {
	                    // 画矩形
	                    map.changeDragMode('drawRect', dataInputx, dataInputy, function (str) {
	                        vectorArr = [];
	                        var overlayArr = map.getOverlays();
	                        vectorArr.push(overlayArr[overlayArr.length - 1]);
	                        var boundsArr = str.split(',');
	                        for (var m = 0; m < markerArr.length; m++) {
	                            if (_this.inRect(boundsArr, markerArr[m].getPoint()) && $.inArray(markerArr[m].id, markerPickedIdArr) == -1) {
	                                markerPickedIdArr.push(markerArr[m].id);
	                                _this.iconPicked(markerArr[m]);
	                                tempPicked.push(markerArr[m]);
	                            }
	                        }
	                        // 列表勾选
	                        yisaTree.check(markerPickedIdArr);
	                        if (tempPicked.length == 0) {
	                            map.removeOverlay(vectorArr[0]);
	                            vectorArr = [];
	                            alert('未选择任何标注点');
	                        }
	                        map.changeDragMode('pan');
	                        $('#drawRectangle').removeClass('current');
	                        $('#drawDefault').addClass('current');
	                    });
	                } else if (drawType == 'drawClear') {
	                    // 清除绘制
	                    if (vectorArr.length > 0) {
	                        for (var v = 0; v < vectorArr.length; v++) {
	                            map.removeOverlay(vectorArr[v]);
	                        }
	                        vectorArr = [];
	                    }
	                    if (markerPickedIdArr.length > 0) {
	                        var copyArr = [].concat(_toConsumableArray(markerPickedIdArr));
	                        // for (let m = 0; m < copyArr.length; m++) {
	                        //     // 单选取消勾选  会调用listControlMap操作数组　因此需要复制数组
	                        //     yisaTree.checkOne(copyArr[m], false);
	                        // }
	                        markerPickedArr = [];
	                        markerPickedIdArr = [];
	                        // 列表勾选
	                        yisaTree.check(markerPickedIdArr);
	                    }
	                    map.changeDragMode('pan');
	                }
	            },
	            /* 关闭绘制 */
	            drawClose: function drawClose() {
	                map.changeDragMode('pan');
	            },
	            /* 判断是否在圆圈内 */
	            inCircle: function inCircle(circleArr, lngLat) {
	                var _c_lng = circleArr[0] * Math.PI / 180,
	                    _c_lat = circleArr[1] * Math.PI / 180,
	                    _lng = lngLat.x * Math.PI / 180,
	                    _lat = lngLat.y * Math.PI / 180;
	                var _lng_d = Math.abs(_c_lng - _lng),
	                    _lat_d = Math.abs(_c_lat - _lat);
	                var stepOne = Math.pow(Math.sin(_lat_d / 2), 2) + Math.cos(_c_lat) * Math.cos(_lat) * Math.pow(Math.sin(_lng_d / 2), 2);
	                var stepTwo = 2 * Math.asin(Math.min(1, Math.sqrt(stepOne)));
	                var _distance = (6371012 * stepTwo).toFixed(2);
	                var radius = map.getMeter(new Point(circleArr[0], circleArr[1]), parseFloat(circleArr[2]));
	                if (radius >= _distance) {
	                    return true;
	                } else {
	                    return false;
	                }
	            },
	            /* 判断是否在矩形内 */
	            inRect: function inRect(bounds, lngLat) {
	                var _ne_lng = bounds[2],
	                    _ne_lat = bounds[3],
	                    _sw_lng = bounds[0],
	                    _sw_lat = bounds[1],
	                    _lng = lngLat.x,
	                    _lat = lngLat.y;
	                if (_sw_lng < _lng && _lng < _ne_lng) {
	                    if (_sw_lat < _lat && _lat < _ne_lat) {
	                        return true;
	                    }
	                }
	                return false;
	            },
	            /* 定义窗体信息 */
	            infoWindow: function infoWindow(lng, lat, title, content) {
	                var w = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 500;
	                var h = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 250;

	                var newContent = '<div class=\'pgis-infowindow\'  style=\'width: ' + w + 'px;height: ' + h + 'px\'>\n                                    <div class=\'pgis-info-title\'>' + title + '</div>\n                                    <div class=\'pgis-info-content\'>' + content + '</div>\n                                   </div>';
	                var lnglat = new Point(lng, lat);
	                var zoom = map.getZoomLevel();
	                map.centerAndZoom(lnglat, zoom);
	                map.openInfoWindow(lnglat, newContent);
	                $(".pgis-info-content img").css({ 'max-width': w + 'px', 'max-height': h + 'px' });
	            },
	            closeWindow: function closeWindow() {
	                if (map) {
	                    map.clearOverlays();
	                }
	            },
	            /* 清除页面infowindow，添加制定infowindow */
	            warningHoverWindow: function warningHoverWindow(lng, lat, title, content, carry) {
	                var _this = this;
	                this.closeWindow();
	                var tit = title + ('<img class=\'info-close\' src=\'' + staticsUrl + '/images/map/close.gif\'>');
	                if (parseInt(lng) != 0 && parseInt(lat) != 0) {
	                    if (carry) {
	                        this.infoWindow(lng, lat, tit, content, 200, 220);
	                    } else {
	                        this.infoWindow(lng, lat, tit, content);
	                    }
	                    $(" .info-close").on('click', function () {
	                        _this.closeWindow();
	                    });
	                }
	            },
	            /* 加载窗体信息 */
	            alarmInfoWindow: function alarmInfoWindow(data, aom) {
	                var _this = this;
	                _this.closeWindow();
	                var title = '\u8F66\u8F86\u544A\u8B66\uFF08<span>' + data.deployType + '</span>\uFF09<img class="info-close" src=\'' + staticsUrl + '/images/map/close.gif\'>';
	                var content = '';
	                if (aom) {
	                    content = '\n                        <div class="winInfo-txt">\n                            <dl>\n                                <dt>\u544A\u8B66\u4FE1\u606F</dt>\n                                <dd><span>\u5E03\u63A7\u53F7\u7801\uFF1A</span>' + data.number + '</dd>\n                                <dd><span>\u5E03\u63A7\u7C7B\u578B\uFF1A</span>' + data.deployType + '</dd>\n                                <dd><span>\u53D1\u73B0\u5730\u70B9\uFF1A</span>' + data.locationName + '</dd>\n                                <dd><span>\u53D1\u73B0\u65F6\u95F4\uFF1A</span>' + data.captureTime + '</dd>\n                                <dd><span>\u884C\u9A76\u65B9\u5411\uFF1A</span>' + data.directionName + '</dd>\n                            </dl>\n                            <dl>\n                                <dt>\u5E03\u63A7\u5355\u4FE1\u606F</dt>\n                                <dd><span>\u7533\u8BF7\u4EBA\uFF1A</span>' + data.applyUser + '</dd>\n                                <dd><span>\u7535\u8BDD\uFF1A</span>' + data.applyPhone + '</dd>\n                                <dd><span>\u5E03\u63A7\u5355\u53F7\uFF1A</span>' + data.deploySheetID + '</dd>\n                                <dd><span>\u5E03\u63A7\u539F\u56E0\uFF1A</span>' + data.deployReason + '</dd>\n                            </dl>                    \n                        </div>\n                        ';
	                } else {
	                    content = '\n                    <div class="winInfo-img">\n                        <img src="' + data.bigPic + '" atl="">\n                    </div>\n                    <div class="winInfo-txt">\n                        <dl>\n                            <dt>\u8F66\u8F86\u4FE1\u606F</dt>\n                            <dd><span>\u8F66\u724C\u53F7\uFF1A</span>' + data.plate + '</dd>\n                            <dd><span>\u8F66\u8EAB\u989C\u8272\uFF1A</span>' + data.colorName + '</dd>\n                            <dd><span>\u8F66\u578B\uFF1A</span>' + data.yearName + '</dd>\n                        </dl>\n                        <dl>\n                            <dt>\u544A\u8B66\u4FE1\u606F</dt>\n                            <dd><span>\u53D1\u73B0\u5730\u70B9\uFF1A</span>' + data.locationName + '</dd>\n                            <dd><span>\u53D1\u73B0\u65F6\u95F4\uFF1A</span>' + data.captureTime + '</dd>\n                            <dd><span>\u884C\u9A76\u65B9\u5411\uFF1A</span>' + data.directionName + '</dd>\n                            <dd><span>\u8F66\u901F\uFF1A</span>' + data.speed + '</dd>\n                        </dl>\n                        <dl>\n                            <dt>\u5E03\u63A7\u5355\u4FE1\u606F</dt>\n                            <dd><span>\u7533\u8BF7\u4EBA\uFF1A</span>' + data.applyUser + '</dd>\n                            <dd><span>\u7535\u8BDD\uFF1A</span>' + data.applyPhone + '</dd>\n                            <dd><span>\u5E03\u63A7\u5355\u53F7\uFF1A</span>' + data.deploySheetID + '</dd>\n                            <dd><span>\u5E03\u63A7\u7C7B\u578B\uFF1A</span>' + data.deployType + '</dd>\n                            <dd><span>\u5E03\u63A7\u539F\u56E0\uFF1A</span>' + data.deployReason + '</dd>\n                        </dl>\n                    </div>\n                    ';
	                }
	                if (parseInt(data.lng) && parseInt(data.lat)) {
	                    setTimeout(_this.infoWindow(data.lng, data.lat, title, content), 5000);
	                } else {
	                    _this.closeWindow();
	                }
	                $(".info-close").on('click', function () {
	                    _this.closeWindow();
	                });
	            },
	            /*detail添加一个文本标签*/
	            addLabel: function addLabel(lng, lat, loc) {
	                map.clearOverlays();
	                this.fixedPosition(lng, lat);
	                map.openInfoWindow(new Point(lng, lat), loc);
	            },
	            /**
	             * 设置选中的标注点
	             * 应用：加载布控区域
	             * 模块功能单独使用
	             * */
	            setMarkerPicked: function setMarkerPicked(data) {
	                this.clearAllMarker();
	                var _idArr = [];
	                for (var i = 0; i < data.length; i++) {
	                    _idArr.push(data[i].id);
	                }
	                var lnglat = new Point(data[0].lng, data[0].lat);
	                map.centerAndZoom(lnglat, options.zoom);
	                return markerPickedIdArr = _idArr;
	            },
	            /*gb-手机wifi设备采集信息卡口点击事件*/
	            markerOneClick: function markerOneClick(marker) {
	                var _this = this,
	                    allChecked = [];
	                if (_this._markerEvent) {
	                    var flag = true;
	                    (function (marker) {
	                        marker.addListener('click', function () {
	                            var _marker = marker;
	                            if ($.inArray(_marker.id, allChecked) == -1) {
	                                _this.iconPicked(_marker);
	                                $('#associate-point').multiselect('select', _marker.id);
	                                allChecked.push(_marker.id);
	                            } else {
	                                _this.iconRecover(_marker);
	                                $('#associate-point').multiselect('deselect', _marker.id);
	                                if (allChecked) {
	                                    $.each(allChecked, function (index, item) {
	                                        if (item == _marker.id) {
	                                            allChecked.splice(index, 1);
	                                        }
	                                    });
	                                }
	                            }
	                        });
	                    })(marker);
	                }
	            },
	            //arr是一个包含point的数组,每个point包含纬度,经度,地址id,卡口名称
	            peerAddMarker: function peerAddMarker(arr) {
	                var _this = this;
	                if (!map) return;
	                map.clearOverlays();
	                _this._markerAll = [];
	                for (var a = 0; a < arr.length; a++) {
	                    var icon = new Icon();
	                    var lng = arr[a][0],
	                        lat = arr[a][1];
	                    icon.image = staticsUrl + '/images/map/1h.png';
	                    icon.width = 24;
	                    icon.height = 23;
	                    //icon.leftOffset = 12;
	                    //icon.topOffset = -11;
	                    var title = new Title(arr[a][3], 12, 7, '宋体', '#000', '#fff', '#ccc', '1');
	                    var lnglat = new Point(lng, lat);
	                    var _marker2 = new Marker(lnglat, icon, title);
	                    _marker2.type = '1';
	                    map.addOverlay(_marker2);
	                    _this._markerAll.push(_marker2);
	                }
	            },
	            peerShowViewMarker: function peerShowViewMarker(arr) {
	                var _this = this;
	                map.addMapChangeListener(function () {
	                    if (_this._mapEvent) {
	                        _this.peerAddMarker(arr);
	                    }
	                });
	            },
	            /* 清除所有叠加对象 */
	            clearAll: function clearAll() {
	                if (carMarker) {
	                    carMarker = null;
	                }
	                map.clearOverlays();
	            },
	            /* 清除地图上的所有点 */
	            clearAllMarker: function clearAllMarker() {
	                for (var i = 0; i < markerArr.length; i++) {
	                    map.removeOverlay(markerArr[i]);
	                }
	                for (var _i4 = 0; _i4 < markerPickedArr.length; _i4++) {
	                    map.removeOverlay(markerPickedArr[_i4]);
	                }
	                markerPickedArr = [];
	                markerArr = [];
	                markerIdArr = [];
	            }
	        };
	        window.mapCtrl = mapCtrl;
	    } else {
	        var _mapCtrl = '';
	        window.mapCtrl = _mapCtrl;
	    }
	})();

/***/ })
/******/ ]);