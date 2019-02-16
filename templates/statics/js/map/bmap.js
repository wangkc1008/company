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

	// tmap.js
	(function () {
	    if (typeof BMap !== 'undefined') {
	        var size = new BMap.Size(24, 23),
	            offset = new BMap.Pixel(0, 0),
	            anchor = new BMap.Size(-12, -12);

	        var tileLayer = new BMap.TileLayer();
	        tileLayer.getTilesUrl = function (tileCode, zoom) {
	            var x = tileCode.x;
	            var y = tileCode.y;
	            var z = zoom;
	            // return `http://${mapConfig.mapTileHost}/tile/?qt=tile&x=${x}&y=${y}&z=${z}&styles=pl&scaler=1&udt=20180904`
	            // return `http://localhost/static/baidu_tile/${z}/${x}/${y}.png`
	            return 'http://' + mapConfig.mapTileHost + '/map/baidu_tile/' + z + '/' + x + '/' + y + '.png';
	        };
	        var SELF_TYPE = new BMap.MapType('SELF_TYPE', tileLayer);
	        var options = {
	            minZoom: mapConfig.minZoom,
	            maxZoom: mapConfig.maxZoom,
	            center: new BMap.Point(mapConfig.center[0], mapConfig.center[1]),
	            zoom: mapConfig.zoom,
	            mapType: SELF_TYPE
	        };
	        /** ****图盟地图用到的变量说明：
	         * markerArr - 地图上所有点的marker集合 ， markerIdArr - 地图上所有点的id集合
	         * markerPickedIdArr - 地图上所有被选中的点的id集合
	         * drawTool - 绘制工具 , vectorArr - 绘制的图形集合
	         * labels - label集合 , boundaryOverlayArr - 行政区域边界线集合，用于形成边界
	         ** ****图盟地图 函数说明：
	         * */
	        var map = void 0,
	            marker = void 0,
	            carMarker = void 0,
	            markerArr = [],
	            markerIdArr = [],
	            markerPickedIdArr = [],
	            lushu = {},
	            addOverlayEvt = void 0,
	            vectorArr = {},
	            infowindow = void 0;
	        var labels = [],
	            label = void 0,
	            boundaryOverlayArr = [];
	        var warningMarkerArr = []; // 实时预警地图点集合
	        var boundaryLoodTime = 0;

	        var mapCtrl = {
	            // _markerPickedIdArr: markerPickedIdArr,  // 未用到,测试使用
	            _mapEvent: true, // 是否启用地图map事件，获取可视区域标注点
	            _markerEvent: true, // 是否启用标注点marker事件
	            _scrollWheel: true, // 是否启用鼠标缩放地图
	            _dragged: true, // 是否启用鼠标拖放地图
	            _markerAll: [],
	            _drivingAll: {}, //所有车牌号行驶路线
	            _onePick: false, // 地图只允许选择一个标注点
	            _markerLoadType: '', // 地图标注点加载的类型  默认加载全部，'picked'只加载被选中的图标
	            /* 初始化地图 */
	            initMap: function initMap(elem) {
	                var _this = this;
	                if (!map) {
	                    window.tmap = map = new BMap.Map(elem, options);
	                    map.centerAndZoom(new BMap.Point(mapConfig.center[0], mapConfig.center[1]), mapConfig.zoom);
	                }

	                // 初始化绘制工具
	                var styleOptions = {
	                    strokeColor: 'red', // 边线颜色。
	                    fillColor: 'red', // 填充颜色。当参数为空时，圆形将没有填充效果。
	                    strokeWeight: 3, // 边线的宽度，以像素为单位。
	                    strokeOpacity: 0.7, // 边线透明度，取值范围0 - 1。
	                    fillOpacity: 0.2, // 填充的透明度，取值范围0 - 1。
	                    strokeStyle: 'solid' // 边线的样式，实线solid或虚线dashed。
	                };

	                var drawingManager = window.drawingManager = new BMapLib.DrawingManager(map, {
	                    isOpen: false, // 是否开启绘制模式
	                    enableDrawingTool: false, // 是否显示工具栏
	                    circleOptions: styleOptions, // 圆的样式
	                    polylineOptions: styleOptions, // 线的样式
	                    polygonOptions: styleOptions, // 多边形的样式
	                    rectangleOptions: styleOptions // 矩形的样式
	                });

	                addOverlayEvt = drawingManager.addEventListener('overlaycomplete', function (e) {
	                    drawingManager.close();

	                    var _overlayId = 'o' + new Date().getTime();
	                    e.overlay['oid'] = _overlayId;
	                    vectorArr[_overlayId] = e.overlay;
	                    var tempPicked = [];

	                    if (e.drawingMode == 'circle') {
	                        if (e.overlay.getRadius() == 0) {
	                            map.removeOverlay(e.overlay);
	                        } else {
	                            for (var m = 0; m < markerArr.length; m++) {
	                                if (BMapLib.GeoUtils.isPointInCircle(markerArr[m].getPosition(), e.overlay) && $.inArray(markerArr[m].id, markerPickedIdArr) == -1) {
	                                    markerPickedIdArr.push(markerArr[m].id);
	                                    _this.iconPicked(markerArr[m]);
	                                    tempPicked.push(markerArr[m]);
	                                }
	                            }
	                            // 列表勾选
	                            yisaTree.check(markerPickedIdArr);
	                            if (tempPicked.length == 0) {
	                                map.removeOverlay(e.overlay);
	                                delete vectorArr[_overlayId];
	                                alert('未选择任何标注点');
	                            }
	                        }
	                        $('#drawCircle').removeClass('current');
	                        $('#drawDefault').addClass('current');
	                    }
	                    if (e.drawingMode == 'rectangle') {
	                        if (e.overlay.getBounds().getNorthEast().lng == e.overlay.getBounds().getSouthWest().lng && e.overlay.getBounds().getNorthEast().lat == e.overlay.getBounds().getSouthWest().lat) {
	                            map.removeOverlay(e.overlay);
	                        } else {
	                            var _bounds = e.overlay.getBounds();
	                            for (var _m = 0; _m < markerArr.length; _m++) {
	                                if (BMapLib.GeoUtils.isPointInRect(markerArr[_m].getPosition(), e.overlay.getBounds()) && $.inArray(markerArr[_m].id, markerPickedIdArr) == -1) {
	                                    markerPickedIdArr.push(markerArr[_m].id);
	                                    _this.iconPicked(markerArr[_m]);
	                                    tempPicked.push(markerArr[_m]);
	                                }
	                            }
	                            // 列表勾选
	                            yisaTree.check(markerPickedIdArr);
	                            if (tempPicked.length == 0) {
	                                delete vectorArr[_overlayId];
	                                map.removeOverlay(e.overlay);
	                                alert('未选择任何标注点');
	                            }
	                        }
	                        $('#drawRectangle').removeClass('current');
	                        $('#drawDefault').addClass('current');
	                    }
	                    if (e.drawingMode == 'drawo') {
	                        for (var _m2 = 0; _m2 < markerArr.length; _m2++) {
	                            if (BMapLib.GeoUtils.isPointInPolygon(markerArr[_m2].getPosition(), e.overlay) && $.inArray(markerArr[_m2].id, markerPickedIdArr) == -1) {
	                                markerPickedIdArr.push(markerArr[_m2].id);
	                                _this.iconPicked(markerArr[_m2]);
	                                tempPicked.push(markerArr[_m2]);
	                            }
	                        }
	                        // 列表勾选
	                        yisaTree.check(markerPickedIdArr);
	                        if (tempPicked.length == 0) {
	                            delete vectorArr[_overlayId];
	                            map.removeOverlay(e.overlay);
	                            alert('未选择任何标注点');
	                        }

	                        $('#drawArbitrary').removeClass('current');
	                        $('#drawDefault').addClass('current');
	                    }
	                });

	                //缩放开始前全部清除
	                //缩放结束后加载 Constants.ZOOM_END
	                map.addEventListener('zoomend', function (e) {
	                    if (map.getZoom() < 13) {
	                        for (var i in vectorArr) {
	                            vectorArr[i].hide();
	                        }
	                    } else {
	                        for (var _i in vectorArr) {
	                            !vectorArr[_i].isVisible() && vectorArr[_i].show();
	                        }
	                    }

	                    if (_this._mapEvent) {
	                        _this.reLoadViewMarker();
	                    }
	                });
	                map.addEventListener('dragend', function (e) {
	                    if (_this._mapEvent) {
	                        _this.reLoadViewMarker();
	                    }
	                });
	                map.addEventListener('resize', function (e) {
	                    if (_this._mapEvent) {
	                        _this.reLoadViewMarker();
	                    }
	                });
	                map.addControl(new BMap.NavigationControl());
	                if (_this._scrollWheel) {
	                    map.enableScrollWheelZoom();
	                } else {
	                    map.disableScrollWheelZoom();
	                }
	                if (_this._dragged) {
	                    map.enableDragging();
	                } else {
	                    map.disableDragging();
	                }
	            },
	            //
	            clearAll: function clearAll() {
	                if (carMarker) {
	                    carMarker = null;
	                }
	                map.clearOverlays();
	            },
	            /*detail添加一个文本标签*/
	            addLabel: function addLabel(lng, lat, loc) {
	                map.clearOverlays();
	                this.fixedPosition(lng, lat);
	                var label = new BMap.Label(loc, {
	                    position: new BMap.Point(lng, lat)
	                });
	                map.addOverlay(label);
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
	                    // console.log(arr[a].id);  // 测试
	                    var opts = {};
	                    if ($.inArray(arr[a].id, markerPickedIdArr) == -1) {
	                        opts.icon = new BMap.Icon(staticsUrl + '/images/map/' + arr[a].type + '.png', size);
	                    } else {
	                        opts.icon = new BMap.Icon(staticsUrl + '/images/map/' + arr[a].type + 'h.png', size);
	                    }
	                    opts.title = arr[a].text;
	                    var lngLat = new BMap.Point(arr[a].lng, arr[a].lat);
	                    if (parseInt(arr[a].lng)) {
	                        marker = new BMap.Marker(lngLat, opts);
	                        marker.id = arr[a].id;
	                        marker.type = arr[a].type;
	                        marker.text = arr[a].text;
	                        markerArr.push(marker);
	                        markerIdArr.push(marker.id);
	                        if (_this._markerEvent) {
	                            marker.addEventListener('click', function (e) {
	                                var _marker = e.target;
	                                if ($.inArray(_marker.id, markerPickedIdArr) == -1) {
	                                    // 只允许地图选这一个标注点的时候
	                                    if (_this._onePick) {
	                                        for (var m = 0; m < markerArr.length; m++) {
	                                            if (markerArr[m].id == markerPickedIdArr[0]) {
	                                                // console.log(markerArr[m].id);
	                                                _this.iconRecover(markerArr[m]);
	                                            }
	                                        }
	                                        markerPickedIdArr = [];
	                                    }
	                                    markerPickedIdArr.push(_marker.id);
	                                    _this.iconPicked(_marker);
	                                    // console.log(markerPickedIdArr);
	                                    yisaTree.check(markerPickedIdArr);
	                                    // console.log(_marker);
	                                } else {
	                                    markerPickedIdArr = markerPickedIdArr.filter(function (f) {
	                                        return f != _marker.id;
	                                    });
	                                    _this.iconRecover(_marker);
	                                    // yisaTree.checkOne(_marker.id, false);// 单选选中转非选中
	                                    yisaTree.check(markerPickedIdArr);
	                                }
	                            });
	                        }
	                    }
	                    map.addOverlay(marker);
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
	                        var opts = {};
	                        opts.icon = new BMap.Icon(staticsUrl + '/images/map/' + arr[a].type + 'h.png', size);
	                        opts.title = arr[a].text;
	                        var lngLat = new BMap.Point(arr[a].lng, arr[a].lat);
	                        if (parseInt(arr[a].lng)) {
	                            marker = new BMap.Marker(lngLat, opts);
	                            marker.id = arr[a].id;
	                            marker.type = arr[a].type;
	                            marker.text = arr[a].text;
	                            markerArr.push(marker);
	                            markerIdArr.push(marker.id);
	                            if (_this._markerEvent) {
	                                marker.addEventListener('click', function (e) {
	                                    var _marker = e.target;
	                                    if ($.inArray(_marker.id, markerPickedIdArr) == -1) {
	                                        markerPickedIdArr.push(_marker.id);
	                                        _this.iconPicked(_marker);
	                                        yisaTree.check(markerPickedIdArr);
	                                    } else {
	                                        markerPickedIdArr = markerPickedIdArr.filter(function (f) {
	                                            return f != _marker.id;
	                                        });
	                                        _this.iconRecover(_marker);
	                                        yisaTree.check(markerPickedIdArr);
	                                    }
	                                });
	                            }
	                        }
	                    }
	                    map.addOverlay(marker);
	                }
	                // const allPoints = arr.map((item)=> {
	                //     return new BMap.LngLat(item.lng, item.lat);
	                // });
	                // map.setBestMap(allPoints);
	            },
	            /*添加一个marker,如果传入con，显示infowindow*/
	            addMarkerOne: function addMarkerOne(lng, lat, locid, con) {
	                var icon = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : '1';
	                var edit = arguments[5];

	                var _this = this;
	                var opts = {};
	                var size = void 0;
	                if (icon == 'stop-icon') {
	                    size = new BMap.Size(11, 11);
	                } else {
	                    size = new BMap.Size(24, 23);
	                }
	                opts.icon = new BMap.Icon(staticsUrl + '/images/map/' + icon + 'h.png', size);
	                if (edit) opts.enableDragging = true;
	                var lnglat = new BMap.Point(lng, lat);
	                var marker = new BMap.Marker(lnglat, opts);
	                marker.id = locid;
	                marker.type = icon;

	                if (con) {
	                    marker.addEventListener('click', function (e) {
	                        _this.infoWindow(lng, lat, '', con, 200, 170);
	                    });
	                }
	                map.addOverlay(marker);
	                this._markerAll.push(marker);
	                return marker;
	            },
	            /*添加temArr中的marker*/
	            warningAddMakers: function warningAddMakers(tempArr, flag) {
	                var _this = this;
	                var opts = {};
	                opts.icon = new BMap.Icon(staticsUrl + '/images/map/1.png', new BMap.Size(24, 23));
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
	                    var lnglat = new BMap.Point(item.lng, item.lat);
	                    var marker = new BMap.Marker(lnglat, opts);
	                    marker.id = item.locationID;
	                    map.addOverlay(marker);
	                    if (item.con) {
	                        // 默认显示第一个
	                        if (parseInt(item.lng) != 0 && parseInt(item.lat) != 0) {
	                            if (item.index === 0) {
	                                _this.infoWindow(item.lng, item.lat, item.title, item.con, 500, 230);
	                                _this.setPosition(item.lng, item.lat);
	                            }
	                            marker.addEventListener('click', function (e) {
	                                _this.infoWindow(item.lng, item.lat, item.title, item.con, 500, 230);
	                            }, marker);
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
	            /* drawCircle圆形  drawRectangle矩形  drawClear删除 */
	            draw: function draw(drawType) {
	                var _this = this;
	                _this.drawClose();
	                switch (drawType) {
	                    case 'drawCircle':
	                        drawingManager.setDrawingMode(BMAP_DRAWING_CIRCLE);
	                        drawingManager.open();
	                        break;
	                    case 'drawRectangle':
	                        drawingManager.setDrawingMode(BMAP_DRAWING_RECTANGLE);
	                        drawingManager.open();
	                        break;
	                    case 'drawArbitrary':
	                        drawingManager.setDrawingMode(BMAP_DRAWING_O);
	                        drawingManager.open();
	                        break;
	                    case 'drawDefault':
	                        drawingManager.close();
	                        break;
	                    case 'drawClear':
	                        _this.drawClear();
	                        return;
	                    default:
	                        return;
	                }
	            },
	            /*轨迹重现：绘制线路 */
	            drawLine: function drawLine(points, c, id) {
	                if (typeof points[0] == 'string') {
	                    points = points.map(function (item, v) {
	                        return new BMap.Point(item.split(',')[0], item.split(',')[1]);
	                    });
	                }
	                var polyline = new BMap.Polyline(points, {
	                    strokeColor: c,
	                    strokeWeight: 3,
	                    strokeOpacity: 1
	                });
	                polyline.id = id;
	                map.addOverlay(polyline);
	            },
	            /**
	             * @param point 每组车牌号的point数组
	             * @param c     颜色
	             * @param count 车牌号的索引值
	             * */
	            drawDriving: function drawDriving(point, c, count) {
	                return;
	            },

	            //运行轨迹
	            /**
	             * @param array paths 所有的点 array
	             * @param string car   车的颜色颜色
	             * @param stop [0,1]  是否暂停播放
	             * */
	            runCar: function runCar(paths, car, stop, t) {
	                var p = $(t).text().split('：')[1];
	                if (typeof paths[0] == 'string') {
	                    paths = paths.map(function (item, v) {
	                        return new BMap.Point(item.split(',')[0], item.split(',')[1]);
	                    });
	                }
	                if (stop) {
	                    lushu[p].pause();
	                } else {
	                    map.setViewport(paths);
	                    if (lushu[p]) {
	                        lushu[p].stop();
	                        lushu[p].start();
	                        return;
	                    }

	                    lushu[p] = new BMapLib.LuShu(map, paths, {
	                        defaultContent: p,
	                        autoView: true,
	                        icon: new BMap.Icon(staticsUrl + '/images/map/' + car + '.png', new BMap.Size(43, 21), { anchor: new BMap.Size(21, 10) }),
	                        speed: 450,
	                        enableRotation: true,
	                        landmarkPois: [],
	                        cb: function cb() {
	                            $(t).removeClass('pause').addClass('default').find("em").text("播放");
	                        }
	                    });
	                    lushu[p].start();
	                }
	            },
	            /* 关闭绘制 */
	            drawClose: function drawClose() {
	                if (addOverlayEvt) {
	                    drawingManager.removeEventListener(addOverlayEvt);
	                }
	                drawingManager.close();
	            },
	            /* 清除绘制，清除绘制选中的标注点的效果 */
	            drawClear: function drawClear() {
	                var _this = this;

	                for (var i in vectorArr) {
	                    map.removeOverlay(vectorArr[i]);
	                }
	                vectorArr = {};

	                if (markerPickedIdArr.length > 0) {
	                    for (var m = 0; m < markerArr.length; m++) {
	                        if ($.inArray(markerArr[m].id, markerPickedIdArr) != -1) {
	                            _this.iconRecover(markerArr[m]);
	                            // 单选取消勾选
	                            // yisaTree.checkOne(markerArr[m].id, false);
	                        }
	                    }
	                    markerPickedIdArr = [];
	                    // 列表勾选
	                    yisaTree.check(markerPickedIdArr);
	                }
	            },

	            /* 标注点被选中后的样式 */
	            iconPicked: function iconPicked(m) {
	                var iconPic = void 0;
	                var size = void 0;
	                if (m.type == 'stop-icon') {
	                    size = new BMap.Size(14, 14);
	                } else {
	                    size = new BMap.Size(24, 23);
	                }
	                iconPic = new BMap.Icon(staticsUrl + '/images/map/' + m.type + 'h.png', size);
	                m.setIcon(iconPic);
	            },
	            /* 恢复标注点样式 */
	            iconRecover: function iconRecover(m) {
	                var icon = void 0;
	                var size = void 0;
	                if (m.type == 'stop-icon') {
	                    size = new BMap.Size(14, 14);
	                } else {
	                    size = new BMap.Size(24, 23);
	                }
	                icon = new BMap.Icon(staticsUrl + '/images/map/' + m.type + '.png', size);
	                m.setIcon(icon);
	            },
	            reLoadViewMarker: function reLoadViewMarker() {
	                var _this = this,
	                    _currentZoom = map.getZoom();
	                // 没有树形结构的时候
	                if (typeof yisaTree != 'undefined' && _currentZoom < 13) {
	                    //应该缩放前全部清除，暂时做法，判断zoom级别后再进行是否清除选择
	                    // //删除所有点图标
	                    for (var i = 0; i < markerArr.length; i++) {
	                        map.removeOverlay(markerArr[i]);
	                    }
	                    markerArr = [];
	                    if (labels.length == 0) {
	                        _this.loadCity();
	                        $('#map-pannel').hide();
	                    }
	                } else {
	                    for (var _i2 = 0; _i2 < labels.length; _i2++) {
	                        map.removeOverlay(labels[_i2]);
	                    }
	                    labels = [];
	                    //移除行政区边界，防止鼠标在圆圈上缩放引起的bug
	                    if (boundaryOverlayArr.length > 0) {
	                        for (var b = 0; b < boundaryOverlayArr.length; b++) {
	                            map.removeOverlay(boundaryOverlayArr[b]);
	                        }
	                        boundaryOverlayArr = [];
	                    }
	                    _this.showViewMarker();
	                }
	            },
	            /**
	             *  显示地图可视区域内的点
	             *  @param String 'all'默认全部显示 'picked'显示选中
	             *  */
	            showViewMarker: function showViewMarker() {
	                var _this = this;
	                var loadType = _this._markerLoadType || 'all';

	                if (typeof yisaTree != 'undefined' && map.getZoom() < 13) {
	                    _this.loadCity();
	                    // 隐藏设备图标说明面板
	                    $('#map-pannel').hide();
	                } else {
	                    // 显示设备图标说明面板
	                    $('#map-pannel').show();
	                    var _bounds = map.getBounds(),
	                        _sw = _bounds.getSouthWest().lng + ',' + _bounds.getSouthWest().lat,
	                        _ne = _bounds.getNorthEast().lng + ',' + _bounds.getNorthEast().lat;
	                    // 清除地图所有点
	                    _this.clearAllMarker();
	                    // map.getOverlayLayer().clear(markerArr);
	                    // markerArr = [];
	                    // markerIdArr = [];
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
	                                        // console.log("all");
	                                        break;
	                                    case 'picked':
	                                        _this.addPickedMarker(data);
	                                        // console.log("picked");
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
	            //arr是一个包含point的数组,每个point包含纬度,经度,地址id,卡口名称
	            peerAddMarker: function peerAddMarker(arr) {
	                var _this = this;
	                if (!map) return;
	                map.clearOverlays();
	                this._markerAll = [];
	                for (var a = 0; a < arr.length; a++) {
	                    var opts = {};
	                    var lng = arr[a][0],
	                        lat = arr[a][1];
	                    opts.title = arr[a][3];
	                    opts.icon = new BMap.Icon(staticsUrl + '/images/map/1h.png', new BMap.Size(24, 23));
	                    var lnglat = new BMap.LngLat(lng, lat);
	                    var _marker2 = new BMap.Marker(lnglat, opts);
	                    _marker2.type = '1';
	                    map.addOverlay(_marker2);
	                    this._markerAll.push(_marker2);
	                }
	            },
	            peerShowViewMarker: function peerShowViewMarker(arr) {
	                var _this = this;
	                map.addEventListener('zoomend', function (e) {
	                    if (_this._mapEvent) {
	                        // _this.clearAll();
	                        _this.peerAddMarker(arr);
	                    }
	                });
	                map.addEventListener('dragend', function (e) {
	                    if (_this._mapEvent) {
	                        // _this.clearAll();
	                        _this.peerAddMarker(arr);
	                    }
	                });
	                map.addEventListener('resize', function (e) {
	                    if (_this._mapEvent) {
	                        // _this.clearAll();
	                        _this.peerAddMarker(arr);
	                    }
	                });
	            },
	            /* 定义窗体信息 */
	            infoWindow: function infoWindow(lng, lat, title, content) {
	                var w = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 500;
	                var h = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 250;

	                //map.clearOverlays();
	                var infowindowOpts = {};
	                infowindowOpts.width = w;
	                infowindowOpts.height = h;
	                infowindowOpts.title = title;
	                infowindowOpts.enableAutoPan = true;

	                infowindow = new BMap.InfoWindow(content, infowindowOpts);
	                map.openInfoWindow(infowindow, new BMap.Point(lng, lat));
	            },
	            closeWindow: function closeWindow() {
	                if (map && infowindow) {
	                    map.removeOverlay(infowindow);
	                }
	            },
	            /*清除页面infowindow，添加制定infowindow*/
	            warningHoverWindow: function warningHoverWindow(lng, lat, title, content) {
	                this.closeWindow();
	                if (parseInt(lng) != 0 && parseInt(lat) != 0) {
	                    this.infoWindow(lng, lat, title, content);
	                }
	            },
	            // 加载窗体信息
	            alarmInfoWindow: function alarmInfoWindow(data) {
	                var _this = this;
	                if (map && infowindow) {
	                    map.removeOverlay(infowindow);
	                }
	                var title = '\u8F66\u8F86\u544A\u8B66\uFF08<span>' + data.deployType + '</span>\uFF09';
	                var content = '\n                                        <div class="winInfo-img">\n                                            <img src="' + data.bigPic + '" atl="">\n                                        </div>\n                                        <div class="winInfo-txt">\n                                            <dl>\n                                                <dt>\u8F66\u8F86\u4FE1\u606F</dt>\n                                                <dd><span>\u8F66\u724C\u53F7\uFF1A</span>' + data.plate + '</dd>\n                                                <dd><span>\u8F66\u8EAB\u989C\u8272\uFF1A</span>' + data.colorName + '</dd>\n                                                <dd><span>\u8F66\u578B\uFF1A</span>' + data.yearName + '</dd>\n                                            </dl>\n                                            <dl>\n                                                <dt>\u544A\u8B66\u4FE1\u606F</dt>\n                                                <dd><span>\u53D1\u73B0\u5730\u70B9\uFF1A</span>' + data.locationName + '</dd>\n                                                <dd><span>\u53D1\u73B0\u65F6\u95F4\uFF1A</span>' + data.captureTime + '</dd>\n                                                <dd><span>\u884C\u9A76\u65B9\u5411\uFF1A</span>' + data.directionName + '</dd>\n                                                <dd><span>\u8F66\u901F\uFF1A</span>' + data.speed + '</dd>\n                                            </dl>\n                                            <dl>\n                                                <dt>\u5E03\u63A7\u5355\u4FE1\u606F</dt>\n                                                <dd><span>\u7533\u8BF7\u4EBA\uFF1A</span>' + data.applyUser + '</dd>\n                                                <dd><span>\u7535\u8BDD\uFF1A</span>' + data.applyPhone + '</dd>\n                                                <dd><span>\u5E03\u63A7\u5355\u53F7\uFF1A</span>' + data.deploySheetID + '</dd>\n                                                <dd><span>\u5E03\u63A7\u7C7B\u578B\uFF1A</span>' + data.deployType + '</dd>\n                                                <dd><span>\u5E03\u63A7\u539F\u56E0\uFF1A</span>' + data.deployReason + '</dd>\n                                            </dl>                    \n                                        </div>\n                                        ';
	                // _this.setPosition(data.lng, data.lat);
	                if (data.lng || data.lat) {
	                    setTimeout(_this.infoWindow(data.lng, data.lat, title, content), 5000);
	                } else {
	                    _this.closeWindow();
	                    _this.setPosition(data.lng, data.lat);
	                }
	            },
	            /**
	             * 应用：搜索结果页面
	             * 定位
	             * */
	            fixedPosition: function fixedPosition(lng, lat) {
	                map.setZoom(16);

	                for (var i = 0; i < markerArr.length; i++) {
	                    map.removeOverlay(markerArr[i]);
	                }
	                markerArr = [];

	                var lnglat = new BMap.Point(lng, lat);
	                map.setCenter(lnglat);
	                var opts = {};
	                opts.icon = new BMap.Icon(staticsUrl + '/images/map/1.png', new BMap.Size(35, 30));
	                marker = new BMap.Marker(lnglat, opts);
	                map.addOverlay(marker);
	                markerArr.push(marker);
	            },
	            /* 列表与地图交互 */
	            listControlMap: function listControlMap(id, str) {
	                var _this = this;
	                if (str == 'del') {
	                    for (var m = 0; m < markerArr.length; m++) {
	                        if (markerArr[m].id == id) {
	                            _this.iconRecover(markerArr[m]);
	                        }
	                    }
	                    markerPickedIdArr = markerPickedIdArr.filter(function (f) {
	                        return f != id;
	                    });
	                    // for (let d = 0; d < idArr.length; d++) {
	                    //     for (let m = 0; m < markerArr.length; m++) {
	                    //         if (markerArr[m].id == idArr[d]) {
	                    //             _this.iconRecover(markerArr[m]);
	                    //         }
	                    //     }
	                    //     markerPickedIdArr = markerPickedIdArr.filter(function (f) {
	                    //         return f != idArr[d];
	                    //     });
	                    // }
	                } else if (str == 'add') {
	                    markerPickedIdArr.push(id);
	                    for (var _m3 = 0; _m3 < markerArr.length; _m3++) {
	                        if (markerArr[_m3].id == id) {
	                            _this.iconPicked(markerArr[_m3]);
	                        }
	                    }
	                    // for (let a = 0; a < idArr.length; a++) {
	                    //     markerPickedIdArr.push(idArr[a]);
	                    //     for (let m = 0; m < markerArr.length; m++) {
	                    //         if (markerArr[m].id == idArr[a]) {
	                    //             _this.iconPicked(markerArr[m]);
	                    //         }
	                    //     }
	                    // }
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
	                for (var _m4 = 0; _m4 < markerArr.length; _m4++) {
	                    if (markerPickedIdArr.indexOf(markerArr[_m4].id) >= 0) {
	                        _this.iconPicked(markerArr[_m4]);
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
	                    _lnglat = new BMap.Point(lng, lat);
	                } else {
	                    _lnglat = options.center;
	                }
	                if (zoom) {
	                    _zoom = zoom;
	                } else {
	                    _zoom = options.zoom;
	                }
	                map.setCenter(_lnglat);
	                map.setZoom(_zoom);
	            },
	            /**
	             * 加载区县级的点，以实现类似点标注的效果，点击后改变地图缩放等级，加载可视区域的点
	             * data: Array
	             * {text,lng,lat,count}
	             * */
	            addLabels: function addLabels(data) {
	                var _this = this;
	                var styleDefault = {
	                    width: '60px',
	                    height: '60px',
	                    maxWidth: '60px',
	                    borderRadius: '50%',
	                    cursor: 'pointer',
	                    color: '#fff',
	                    backgroundColor: 'rgba(57, 172, 106, 0.9)',
	                    border: 'none',
	                    fontFamily: '微软雅黑'
	                };
	                for (var i = 0; i < data.length; i++) {
	                    var str = '<div class="label-city" style="margin-top:14px;text-align:center;">' + data[i].text + '<br/>' + data[i].count + '</div>';
	                    var opts = {
	                        position: new BMap.Point(data[i].lng, data[i].lat),
	                        offset: new BMap.Size(0, 0) //设置文本偏移量
	                    };
	                    var _label = new BMap.Label(str, opts);
	                    _label.lng = data[i].lng;
	                    _label.lat = data[i].lat;
	                    _label.setStyle(styleDefault);
	                    map.addOverlay(_label);
	                    labels.push(_label);
	                    _label.addEventListener('click', function (e) {
	                        var _lng = e.target.lng,
	                            _lat = e.target.lat;
	                        map.centerAndZoom(new BMap.Point(_lng, _lat), 13);
	                        _this.reLoadViewMarker();
	                    }, this);
	                    _label.addEventListener('mouseover', function (e) {
	                        e.target.setStyle({ backgroundColor: '#e4393c' });
	                    });
	                    _label.addEventListener('mouseout', function (e) {
	                        e.target.setStyle({ backgroundColor: 'rgba(57, 172, 106, 0.9)' });
	                    });
	                }
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
	                var lnglat = new BMap.Point(data[0].lng, data[0].lat);
	                map.setViewport(lnglat);
	                return markerPickedIdArr = _idArr;
	            },
	            /**
	             * 清除地图上的所有点*/
	            clearAllMarker: function clearAllMarker() {

	                for (var i = 0; i < markerArr.length; i++) {
	                    map.removeOverlay(markerArr[i]);
	                }
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