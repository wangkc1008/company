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
	    if (typeof IMAP !== 'undefined') {
	        var size = new IMAP.Size(24, 23),
	            offset = new IMAP.Pixel(0, 0);
	        var options = {
	            minZoom: mapConfig.minZoom,
	            maxZoom: mapConfig.maxZoom,
	            zoom: mapConfig.zoom,
	            // tileUrl: ["http://{s}/v3/tile?z={z}&x={x}&y={y}", [mapConfig.mapStyle.mapUrl, mapConfig.mapStyle.mapUrl]],
	            center: new IMAP.LngLat(mapConfig.center[0], mapConfig.center[1]),
	            animation: true
	        };
	        if (mapConfig.mapStyle.mapUrl) {
	            Object.assign(options, { tileUrl: ['http://{s}/v3/tile?z={z}&x={x}&y={y}', [mapConfig.mapStyle.mapUrl, mapConfig.mapStyle.mapUrl]] });
	        }
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
	            _navi: '',
	            _viewFirst: true, // 是否是第一次加载可视的点，即从城市变为加载可视点
	            bgTileLayer: null,
	            pickedIdArr: [],
	            regionCarInfoWindow: null,
	            /* 初始化地图 */
	            initMap: function initMap(elem) {
	                var _this = this;
	                if (!map) {
	                    window.tmap = map = new IMAP.Map(elem, options);
	                } else {
	                    return;
	                }
	                if (options.zoom < 13) {
	                    _this._viewFirst = true;
	                } else {
	                    _this._viewFirst = false;
	                }
	                //缩放开始前全部清除
	                //缩放结束后加载 Constants.ZOOM_END
	                map.addEventListener(IMAP.Constants.ZOOM_END, function (e) {
	                    if (_this._mapEvent) {
	                        if (e.zoom < 13) {
	                            for (var i in overlayArr) {
	                                overlayArr[i].visible(false);
	                            }
	                        } else {
	                            for (var _i in overlayArr) {
	                                !overlayArr[_i]._visible && overlayArr[_i].visible(true);
	                            }
	                        }
	                        _this.reLoadViewMarker();
	                    }
	                }, map);
	                map.addEventListener(IMAP.Constants.DRAG_END, function (e) {
	                    if (_this._mapEvent) {
	                        _this.reLoadViewMarker();
	                    }
	                }, map);
	                map.addEventListener(IMAP.Constants.RESIZE, function (e) {
	                    if (_this._mapEvent) {
	                        _this.reLoadViewMarker();
	                    }
	                }, map);
	                // map.addControl(new IMAP.NavigationControl({offset: IMAP.Size(10,10),visible: true,anchor: IMAP.Constants.RIGHT_TOP}));
	                _this._navi = new IMAP.NavigationControl({
	                    visible: true,
	                    anchor: IMAP.Constants.RIGHT_TOP,
	                    offset: new IMAP.Pixel(-15, 15)
	                });
	                map.addControl(_this._navi);
	                map.addControl(new IMAP.ScaleControl({
	                    visible: true,
	                    anchor: IMAP.Constants.RIGHT_BOTTOM,
	                    offset: new IMAP.Pixel(-15, -15)
	                }));
	                map.scrollWheelZoom(_this._scrollWheel);
	                map.dragged(_this._dragged);
	                L.DomUtil.enableTextSelection(); //图盟API里设置禁止用户选择文本，不知为何，此处手工启用一下，否则搜索结果页无法选中文本
	                // 根据配置问价选择是否加载单独的文字图层
	                if (mapConfig.mapStyle.tileFlag == 1) {
	                    this.addTextLayer();
	                    console.log(666666);
	                    // this.addRoadNetLayer()
	                }
	            },
	            //
	            clearAll: function clearAll() {
	                if (carMarker) {
	                    carMarker = null;
	                }
	                map.getOverlayLayer().clear();
	            },
	            /*detail添加一个文本标签*/
	            addLabel: function addLabel(lng, lat, loc) {
	                map.getOverlayLayer().clear();
	                this.fixedPosition(lng, lat);
	                var label = new IMAP.Label(loc, {
	                    //type:IMAP.Constants.OVERLAY_LABEL_DEFAULT,
	                    position: new IMAP.LngLat(lng, lat),
	                    anchor: IMAP.Constants.RIGHT_BOTTOM,
	                    fontColor: '#333',
	                    fontSize: 10,
	                    fontBold: false
	                });

	                map.getOverlayLayer().addOverlay(label);
	            },

	            getAllMarkers: function getAllMarkers() {
	                var os = map.getOverlayLayer().getOverlays();
	                var re = {};
	                for (var i in os) {
	                    re[os[i].id] = os[i].getPosition().lng + ',' + os[i].getPosition().lat;
	                }
	                return re;
	            },

	            /**
	             * 批量添加标注点
	             * arr : 坐标集合
	             * */
	            addMarker: function addMarker(arr) {
	                var _this = this;
	                if (map) {
	                    for (var a = 0; a < arr.length; a++) {
	                        var opts = new IMAP.MarkerOptions();
	                        opts.editable = false;
	                        opts.anchor = IMAP.Constants.CENTER;
	                        if ($.inArray(arr[a].id, markerPickedIdArr) == -1) {
	                            opts.icon = new IMAP.Icon(staticsUrl + '/images/map/' + arr[a].type + '.png', size, offset);
	                        } else {
	                            opts.icon = new IMAP.Icon(staticsUrl + '/images/map/' + arr[a].type + 'h.png', size, offset);
	                        }
	                        var lngLat = new IMAP.LngLat(arr[a].lng, arr[a].lat);
	                        if (lngLat) {
	                            marker = new IMAP.Marker(lngLat, opts);
	                            marker.id = arr[a].id;
	                            marker.type = arr[a].type;
	                            marker.text = arr[a].text;
	                            markerArr.push(marker);
	                            markerIdArr.push(marker.id);
	                            if (_this._markerEvent) {
	                                marker.addEventListener(IMAP.Constants.CLICK, function (e) {
	                                    var _marker = e.target;
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
	                                            return f != _marker.id;
	                                        });
	                                        _this.iconRecover(_marker);
	                                        // yisaTree.checkOne(_marker.id, false);// 单选选中转非选中
	                                        yisaTree.check(markerPickedIdArr);
	                                    }
	                                }, marker);
	                            }
	                            // 显示标注点 位置
	                            marker.addEventListener(IMAP.Constants.MOUSE_OVER, function (e) {
	                                var _marker = e.target;
	                                var labelOpts = {
	                                    type: IMAP.Constants.OVERLAY_LABEL_HTML,
	                                    position: _marker.getPosition(),
	                                    offset: new IMAP.Pixel(0, -13),
	                                    anchor: IMAP.Constants.BOTTOM_CENTER,
	                                    fontColor: '#333'
	                                };
	                                var _text = _marker.text + '<span class="triangle-down"><i></i></span>';
	                                _marker.setLabel(_text, labelOpts);
	                                $('.imap-overlay-pane .imap-clickable').addClass('label-marker-address');
	                                $('.imap-overlay-pane').css('z-index', '800');
	                            });
	                            marker.addEventListener(IMAP.Constants.MOUSE_OUT, function (e) {
	                                var _marker = e.target;
	                                setTimeout(function () {
	                                    _marker.removeLabel();
	                                }, 100);
	                            });
	                        }
	                    }
	                    // const allPoints = arr.map((item)=> {
	                    //     return new IMAP.LngLat(item.lng, item.lat);
	                    // });
	                    // map.setBestMap(allPoints);
	                    map.getOverlayLayer().addOverlays(markerArr, false);
	                }
	            },
	            /**
	             * 在批量添加点标注的基础上添加label(123)
	             * */
	            addDangerMarkerNum: function addDangerMarkerNum(arr) {
	                var _this = this;
	                if (map) {
	                    for (var a = 0; a < arr.length; a++) {
	                        var opts = new IMAP.MarkerOptions();
	                        opts.editable = true;
	                        opts.anchor = IMAP.Constants.CENTER;
	                        opts.icon = new IMAP.Icon(staticsUrl + '/images/map/stop-marker.png', size, offset);
	                        opts.visible = false;
	                        var lngLat = new IMAP.LngLat(arr[a].lng, arr[a].lat);
	                        if (lngLat) {
	                            marker = new IMAP.Marker(lngLat, opts);
	                            map.getOverlayLayer().addOverlay(marker, false);
	                        }
	                        var labelOpts = {
	                            type: IMAP.Constants.OVERLAY_LABEL_HTML,
	                            position: lngLat,
	                            offset: new IMAP.Pixel(0, -13),
	                            anchor: IMAP.Constants.BOTTOM_CENTER
	                        };
	                        marker.setLabel(a + 1, labelOpts);
	                        $('.imap-overlay-pane .imap-clickable div').css({
	                            'border': '0',
	                            'background': 'transparent',
	                            'margin-top': '27px',
	                            'color': '#fff'
	                        });
	                        $('.imap-overlay-pane').css('z-index', '800');
	                    }
	                }
	            },
	            addDangerMarker: function addDangerMarker(arr) {
	                var _this = this;
	                if (map) {
	                    for (var a = 0; a < arr.length; a++) {
	                        var opts = new IMAP.MarkerOptions();
	                        opts.editable = true;
	                        opts.anchor = IMAP.Constants.CENTER;
	                        opts.icon = new IMAP.Icon(staticsUrl + '/images/map/stop-marker.png', size, offset);
	                        opts.visible = false;
	                        var lngLat = new IMAP.LngLat(arr[a].lng, arr[a].lat);
	                        if (lngLat) {
	                            marker = new IMAP.Marker(lngLat, opts);
	                            marker.id = arr[a].id;
	                            marker.type = 'stop-marker';
	                            marker.text = arr[a].text;
	                            marker.loc = arr[a].roadName;
	                            marker.speed = arr[a].carSpeed;
	                            marker.lng = arr[a].lng;
	                            marker.lat = arr[a].lat;

	                            this._markerAll.push(marker);
	                            map.getOverlayLayer().addOverlay(marker, false);
	                        }
	                    }
	                }
	            },
	            //移出label
	            RemoveLabel: function RemoveLabel(marker) {
	                marker.removeLabel();
	            },
	            /**
	             * 添加选中标注点
	             * arr : 坐标集合
	             * */
	            addPickedMarker: function addPickedMarker(arr) {
	                var _this = this;
	                if (map) {
	                    for (var a = 0; a < arr.length; a++) {
	                        if ($.inArray(arr[a].id, markerPickedIdArr) !== -1) {
	                            var opts = new IMAP.MarkerOptions();
	                            opts.editable = false;
	                            opts.anchor = IMAP.Constants.CENTER;
	                            opts.icon = new IMAP.Icon(staticsUrl + '/images/map/' + arr[a].type + 'h.png', size, offset);
	                            var lngLat = new IMAP.LngLat(arr[a].lng, arr[a].lat);
	                            if (lngLat) {
	                                marker = new IMAP.Marker(lngLat, opts);
	                                marker.id = arr[a].id;
	                                marker.type = arr[a].type;
	                                marker.text = arr[a].text;
	                                markerArr.push(marker);
	                                markerIdArr.push(marker.id);
	                                if (_this._markerEvent) {
	                                    marker.addEventListener(IMAP.Constants.CLICK, function (e) {
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
	                                    }, marker);
	                                }
	                                marker.addEventListener(IMAP.Constants.MOUSE_OVER, function (e) {
	                                    var _marker = e.target;
	                                    var labelOpts = {
	                                        type: IMAP.Constants.OVERLAY_LABEL_HTML,
	                                        position: _marker.getPosition(),
	                                        offset: new IMAP.Pixel(0, -13),
	                                        anchor: IMAP.Constants.BOTTOM_CENTER,
	                                        fontColor: '#333'
	                                    };
	                                    var _text = _marker.text + '<span class="triangle-down"><i></i></span>';
	                                    _marker.setLabel(_text, labelOpts);
	                                    $('.imap-overlay-pane .imap-clickable').addClass('label-marker-address');
	                                    $('.imap-overlay-pane').css('z-index', '800');
	                                });
	                                marker.addEventListener(IMAP.Constants.MOUSE_OUT, function (e) {
	                                    var _marker = e.target;
	                                    setTimeout(function () {
	                                        _marker.removeLabel();
	                                    }, 100);
	                                });
	                            }
	                        }
	                    }
	                    // const allPoints = arr.map((item)=> {
	                    //     return new IMAP.LngLat(item.lng, item.lat);
	                    // });
	                    // map.setBestMap(allPoints);
	                    map.getOverlayLayer().addOverlays(markerArr, false);
	                }
	            },
	            /*添加一个marker,如果传入con，显示infowindow*/
	            addMarkerOne: function addMarkerOne(lng, lat, locid, con) {
	                var icon = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 'stop-marker';
	                var edit = arguments[5];
	                var label = arguments[6];

	                if (map) {
	                    var _this = this;
	                    var opts = new IMAP.MarkerOptions();
	                    var _size = void 0,
	                        _offset = new IMAP.Pixel(0, 0);

	                    if (icon == 1) {
	                        opts.icon = new IMAP.Icon(staticsUrl + '/images/map/' + icon + '.png', {
	                            'size': new IMAP.Size(24, 23),
	                            'offset': _offset
	                        });
	                    } else if (icon == 'phone') {
	                        opts.icon = new IMAP.Icon(staticsUrl + '/images/map/' + icon + '.png', {
	                            'size': new IMAP.Size(24, 23),
	                            'offset': _offset
	                        });
	                    } else {
	                        if (icon == 'stop-icon') {
	                            opts.anchor = IMAP['Constants']['CENTER'];
	                            _size = new IMAP.Size(11, 11);
	                        } else if (icon == 'map-start' || icon == 'map-end') {
	                            opts.anchor = IMAP['Constants']['BOTTOM_CENTER'];
	                            _size = new IMAP.Size(25, 37);
	                        } else {
	                            opts.anchor = IMAP['Constants']['BOTTOM_CENTER'];
	                            _size = new IMAP.Size(25, 37);
	                        }
	                        opts.icon = new IMAP.Icon(staticsUrl + '/images/map/' + icon + 'h.png', {
	                            'size': _size,
	                            'offset': _offset
	                        });
	                    }

	                    if (edit) opts.editabled = true;
	                    var lnglat = new IMAP.LngLat(lng, lat);
	                    var _marker2 = new IMAP.Marker(lnglat, opts);
	                    _marker2.id = locid;
	                    _marker2.type = icon;
	                    _marker2.text = label;

	                    if (con) {
	                        _marker2.addEventListener(IMAP.Constants.CLICK, function (e) {
	                            _this.infoWindow(lng, lat, '', con, 200, 170);
	                            console.log(locid);
	                        }, _marker2);
	                    }

	                    if (label) {
	                        _marker2.addEventListener(IMAP.Constants.MOUSE_OVER, function (e) {
	                            var _marker = e.target;
	                            var labelOpts = {
	                                type: IMAP.Constants.OVERLAY_LABEL_HTML,
	                                position: _marker.getPosition(),
	                                offset: new IMAP.Pixel(0, -22),
	                                anchor: IMAP.Constants.BOTTOM_CENTER,
	                                fontColor: '#333'
	                            };
	                            var _text = _marker.text + '<span class="triangle-down"><i></i></span>';
	                            _marker.setLabel(_text, labelOpts);
	                            $('.imap-overlay-pane .imap-clickable').addClass('label-marker-address');
	                            $('.imap-overlay-pane').css('z-index', '800');
	                        });
	                        _marker2.addEventListener(IMAP.Constants.MOUSE_OUT, function (e) {
	                            var _marker = e.target;
	                            setTimeout(function () {
	                                _marker.removeLabel();
	                            }, 100);
	                        });
	                    }

	                    map.getOverlayLayer().addOverlays(_marker2, false);

	                    this._markerAll.push(_marker2);
	                    return _marker2;
	                }
	            },
	            /*gb-手机wifi设备采集信息卡口点击事件*/
	            markerOneClick: function markerOneClick(marker, checked) {
	                var _this = this;
	                var allChecked = checked || [];
	                if (_this._markerEvent) {
	                    var flag = true;
	                    marker.addEventListener(IMAP.Constants.CLICK, function (e) {
	                        var _marker = e.target;
	                        if ($.inArray(_marker.id, allChecked) == -1) {
	                            _this.iconPicked(_marker);
	                            $('#associatePoint').multiselect('select', _marker.id);
	                            $('#associateEquip').multiselect('select', _marker.id);
	                            allChecked.push(_marker.id);
	                        } else {
	                            _this.iconRecover(_marker);
	                            $('#associatePoint').multiselect('deselect', _marker.id);
	                            $('#associateEquip').multiselect('deselect', _marker.id);
	                            if (allChecked) {
	                                $.each(allChecked, function (index, item) {
	                                    if (item == _marker.id) {
	                                        allChecked.splice(index, 1);
	                                    }
	                                });
	                            }
	                        }
	                    }, marker);
	                }
	            },
	            /*添加temArr中的marker*/
	            warningAddMakers: function warningAddMakers(tempArr, flag, carry) {
	                var _this = this;
	                var opts = new IMAP.MarkerOptions();
	                opts.anchor = IMAP['Constants']['BOTTOM_CENTER'];
	                opts.icon = new IMAP.Icon(staticsUrl + '/images/map/1.png', {
	                    'size': new IMAP.Size(24, 23),
	                    'offset': new IMAP.Pixel(0, 0)
	                });

	                // 超过20个点位在数组中移除
	                var len = warningMarkerArr.length;
	                if (len + tempArr.length > 20) {
	                    for (var i = 0; i < len + tempArr.length - 20; i++) {
	                        warningMarkerArr.pop();
	                    }
	                }
	                flag ? warningMarkerArr = tempArr.concat(warningMarkerArr) : warningMarkerArr = warningMarkerArr.concat(tempArr);
	                map.getOverlayLayer().clear();
	                warningMarkerArr.forEach(function (item) {
	                    var lnglat = new IMAP.LngLat(item.lng, item.lat);
	                    var marker = new IMAP.Marker(lnglat, opts);
	                    marker.id = item.locationID;
	                    map.getOverlayLayer().addOverlays(marker, false);
	                    if (item.con) {
	                        // 默认显示第一个
	                        if (parseInt(item.lng) != 0 && parseInt(item.lat) != 0) {
	                            if (item.index === 0) {
	                                if (carry) {
	                                    _this.infoWindow(item.lng, item.lat, item.title, item.con, 200, 220);
	                                } else {
	                                    _this.infoWindow(item.lng, item.lat, item.title, item.con);
	                                }

	                                map.setCenter(lnglat);
	                            }
	                            marker.addEventListener(IMAP.Constants.CLICK, function (e) {
	                                if (carry) {
	                                    _this.infoWindow(item.lng, item.lat, item.title, item.con, 200, 220);
	                                } else {
	                                    _this.infoWindow(item.lng, item.lat, item.title, item.con);
	                                }
	                            }, marker);
	                        }
	                    }
	                });
	            },
	            /*轨迹重现：添加marker*/
	            addMarkerAll: function addMarkerAll(arr) {
	                var _this = this;
	                if (map) {
	                    //this._markerAll = [];
	                    for (var a = 0; a < arr.length; a++) {

	                        if (!parseInt(arr[a][0])) continue;
	                        _this.addMarkerOne(arr[a][0], arr[a][1], arr[a][2], '', 'stop-icon');
	                    }
	                    //map.getOverlayLayer().addOverlays(this._markerAll, true);
	                }
	            },
	            /* drawCircle圆形  drawRectangle矩形  drawClear删除 */
	            draw: function draw(drawType) {
	                var _this = this;
	                _this.drawClose();
	                switch (drawType) {
	                    case 'drawCircle':
	                        drawTool = new IMAP.CircleTool();
	                        break;
	                    case 'drawRectangle':
	                        drawTool = new IMAP.RectangleTool();
	                        break;
	                    case 'drawArbitrary':
	                        drawTool = new IMAP.ArbitraryTool();
	                        break;
	                    case 'drawClear':
	                        _this.drawClear();
	                        return;
	                    default:
	                        return;
	                }
	                map.addTool(drawTool);
	                drawTool.autoClose = true;
	                drawTool.open();
	                vectorArr.push(drawTool);
	                addOverlayEvt = drawTool.addEventListener(IMAP.Constants.ADD_OVERLAY, function (e) {
	                    var _overlay = e.overlay,
	                        _overlayId = _overlay.getId();
	                    overlayArr[_overlayId] = _overlay;
	                    var tempPicked = [];
	                    if (drawType == 'drawCircle') {
	                        if (_overlay.getRadius() == -1) {
	                            map.getOverlayLayer().removeOverlay(_overlayId);
	                        } else {
	                            var _center = _overlay.getCenter(),
	                                _radius = _overlay.getRadius();
	                            for (var m = 0; m < markerArr.length; m++) {
	                                if (_this.inCircle(_center, _radius, markerArr[m].getPosition()) && $.inArray(markerArr[m].id, markerPickedIdArr) == -1) {
	                                    markerPickedIdArr.push(markerArr[m].id);
	                                    _this.iconPicked(markerArr[m]);
	                                    tempPicked.push(markerArr[m]);
	                                }
	                            }
	                            // 列表勾选
	                            yisaTree.check(markerPickedIdArr);
	                            if (tempPicked.length == 0) {
	                                map.getOverlayLayer().removeOverlay(_overlayId);
	                                delete overlayArr[_overlayId];
	                                alert('未选择任何标注点');
	                            }
	                        }
	                        $('#drawCircle').removeClass('current');
	                        $('#drawDefault').addClass('current');
	                    }
	                    if (drawType == 'drawRectangle') {
	                        if (_overlay.getBounds().northeast.lng == _overlay.getBounds().southwest.lng && _overlay.getBounds().northeast.lat == _overlay.getBounds().southwest.lat) {
	                            map.getOverlayLayer().removeOverlay(_overlayId);
	                        } else {
	                            var _bounds = _overlay.getBounds();

	                            for (var _m = 0; _m < markerArr.length; _m++) {
	                                if (_this.inRect(_bounds, markerArr[_m].getPosition()) && $.inArray(markerArr[_m].id, markerPickedIdArr) == -1) {
	                                    markerPickedIdArr.push(markerArr[_m].id);
	                                    _this.iconPicked(markerArr[_m]);
	                                    tempPicked.push(markerArr[_m]);
	                                }
	                            }
	                            // 列表勾选
	                            yisaTree.check(markerPickedIdArr);
	                            if (tempPicked.length == 0) {
	                                map.getOverlayLayer().removeOverlay(_overlayId);
	                                delete overlayArr[_overlayId];
	                                alert('未选择任何标注点');
	                            }
	                        }
	                        $('#drawRectangle').removeClass('current');
	                        $('#drawDefault').addClass('current');
	                    }
	                    if (drawType == 'drawArbitrary') {
	                        if (_overlay.getBounds().northeast.lng == _overlay.getBounds().southwest.lng && _overlay.getBounds().northeast.lat == _overlay.getBounds().southwest.lat) {
	                            map.getOverlayLayer().removeOverlay(_overlayId);
	                        } else {
	                            for (var _m2 = 0; _m2 < markerArr.length; _m2++) {
	                                if (IMAPLib.GeoUtils.isPointInPolygon(markerArr[_m2].getPosition(), _overlay) && $.inArray(markerArr[_m2].id, markerPickedIdArr) == -1) {
	                                    markerPickedIdArr.push(markerArr[_m2].id);
	                                    _this.iconPicked(markerArr[_m2]);
	                                    tempPicked.push(markerArr[_m2]);
	                                }
	                            }
	                            // 列表勾选
	                            yisaTree.check(markerPickedIdArr);
	                            if (tempPicked.length == 0) {
	                                map.getOverlayLayer().removeOverlay(_overlayId);
	                                delete overlayArr[_overlayId];
	                                alert('未选择任何标注点');
	                            }
	                        }
	                        $('#drawArbitrary').removeClass('current');
	                        $('#drawDefault').addClass('current');
	                    }
	                }, drawTool);
	            },
	            /*轨迹重现：绘制线路 */
	            drawLine: function drawLine(points, c, id) {
	                if (typeof points[0] == 'string') {
	                    points = points.map(function (item, v) {
	                        return new IMAP.LngLat(item.split(',')[0], item.split(',')[1]);
	                    });
	                }
	                var polyline = new IMAP.Polyline(points, {
	                    strokeColor: c,
	                    strokeWeight: 3,
	                    strokeOpacity: 1
	                });
	                polyline.id = id;
	                map.getOverlayLayer().addOverlays(polyline, true);
	            },
	            /**
	             * @param point 每组车牌号的point数组
	             * @param c     颜色
	             * @param count 车牌号的索引值
	             * */
	            drawDriving: function drawDriving(point, c, count) {
	                //map.getOverlayLayer().clear();
	                var _this = this;
	                var points = point.map(function (item) {
	                    return item.slice(0, 2);
	                });
	                mapCtrl._drivingAll[count] = [];
	                if (points.length > 1) {
	                    var _loop = function _loop(i) {
	                        if (!parseInt(points[i][0]) || !parseInt(points[i + 1][0])) return 'continue';
	                        mapCtrl.navDrivingPoints(points[i].join(','), points[i + 1].join(',')).then(function (res) {
	                            var allPoints = [];
	                            if (parseInt(res.status)) {
	                                allPoints.push(new IMAP.LngLat(points[i][0], points[i][1]));
	                                allPoints.push(new IMAP.LngLat(points[i + 1][0], points[i + 1][1]));
	                            } else {
	                                var steps = res.result.routes[0].steps;
	                                var path = '';
	                                for (var _i2 = 0; _i2 < steps.length; _i2++) {
	                                    path += steps[_i2].path + ";";
	                                }
	                                var pathArr = path.slice(0, -1).split(';');
	                                for (var _i3 = 0; _i3 < pathArr.length; _i3++) {
	                                    allPoints.push(new IMAP.LngLat(pathArr[_i3].split(',')[0], pathArr[_i3].split(',')[1]));
	                                }
	                            }
	                            _this.drawLine(allPoints, c);
	                            if (mapCtrl._drivingAll[count]) {
	                                mapCtrl._drivingAll[count].push(allPoints);
	                            }
	                            /*map.setBestMap(allPoints);
	                             map.setZoom(15);*/
	                        });
	                    };

	                    for (var i = 0; i < points.length - 1; i++) {
	                        var _ret = _loop(i);

	                        if (_ret === 'continue') continue;
	                    }
	                }
	            },
	            navDrivingPoints: function navDrivingPoints(origin, destination) {
	                var translateUrl = mapConfig.mapDrivingRoute;
	                var ak = 'ec85d3648154874552835438ac6a02b2',
	                    output = 'json';

	                return new Promise(function (resolve, reject) {
	                    $.ajax({
	                        url: translateUrl,
	                        type: 'post',
	                        data: {
	                            origin: origin,
	                            destination: destination,
	                            output: output,
	                            ak: ak
	                        },
	                        dataType: 'jsonp',
	                        jsonp: 'callback'
	                    }).done(function (json) {
	                        resolve(json);
	                    }).fail(function () {
	                        return alert('服务器连接失败!');
	                    });
	                });
	            },
	            //运行轨迹
	            /**
	             * @param array paths 所有的点 array
	             * @param string car   车的颜色颜色
	             * @param stop [0,1]  是否暂停播放
	             * */
	            runCar: function runCar(paths, car, stop) {
	                if (typeof paths[0] == 'string') {
	                    paths = paths.map(function (item, v) {
	                        return new IMAP.LngLat(item.split(',')[0], item.split(',')[1]);
	                    });
	                }
	                if (stop) {
	                    if (carMarker) {
	                        carMarker.pauseMove();
	                    }
	                } else {
	                    if (carMarker) {
	                        carMarker.stopMove();
	                    }
	                    if (paths.length > 1) {
	                        if (!carMarker) {
	                            var opts = new IMAP.MarkerOptions();
	                            opts.anchor = IMAP['Constants']['BOTTOM_CENTER'];
	                            if (car.indexOf('phone') !== -1) {
	                                opts.icon = new IMAP.Icon(staticsUrl + '/images/map/' + car + '.png', {
	                                    'size': new IMAP.Size(24, 24)
	                                });
	                            } else {
	                                opts.icon = new IMAP.Icon(staticsUrl + '/images/map/' + car + '.png', {
	                                    'size': new IMAP.Size(43, 21)
	                                });
	                            }
	                            var lnglat = new IMAP.LngLat(paths[0][0], paths[0][1]);
	                            if (lnglat) {
	                                carMarker = new IMAP.Marker(lnglat, opts);
	                                map.getOverlayLayer().addOverlay(carMarker, true);
	                                //carMarker.setAngleOffsetX(52 / 2);
	                                //carMarker.setAnchor(IMAP.Constants.CENTER);
	                                //carMarker.setOffset(new IMAP.Pixel(-5, 0));
	                            }
	                        } else {
	                            var icon = void 0;
	                            if (car.indexOf('phone') !== -1) {
	                                icon = new IMAP.Icon(staticsUrl + '/images/map/' + car + '.png', {
	                                    'size': new IMAP.Size(24, 24)
	                                });
	                            } else {
	                                icon = new IMAP.Icon(staticsUrl + '/images/map/' + car + '.png', {
	                                    'size': new IMAP.Size(43, 21)
	                                });
	                            }
	                            carMarker.setIcon(icon);
	                        }
	                        map.setBestMap(paths);
	                        //map.setZoom(16)
	                        carMarker.moveAlong(paths, 70, true, true);
	                    }
	                }
	            },
	            /* 关闭绘制 */
	            drawClose: function drawClose() {
	                if (drawTool) {
	                    if (addOverlayEvt) {
	                        drawTool.removeEventListener(addOverlayEvt);
	                    }
	                    drawTool.close();
	                    drawTool = null;
	                }
	            },
	            /* 清除绘制，清除绘制选中的标注点的效果 */
	            drawClear: function drawClear() {
	                var _this = this;
	                if (vectorArr.length > 0) {
	                    for (var v = 0; v < vectorArr.length; v++) {
	                        vectorArr[v].clear();
	                    }
	                    vectorArr = [];
	                }
	                if (markerPickedIdArr.length > 0) {
	                    console.log(markerPickedIdArr);
	                    for (var m = 0; m < markerArr.length; m++) {
	                        if ($.inArray(markerArr[m].id, markerPickedIdArr) != -1) {
	                            _this.iconRecover(markerArr[m]);
	                        }
	                    }
	                    markerPickedIdArr = [];
	                    // 列表勾选
	                    yisaTree.check(markerPickedIdArr);
	                }
	            },
	            /* 判断是否在圆圈内 */
	            inCircle: function inCircle(center, radius, lngLat) {
	                var _c_lng = center.getLng() * Math.PI / 180,
	                    _c_lat = center.getLat() * Math.PI / 180,
	                    _lng = lngLat.getLng() * Math.PI / 180,
	                    _lat = lngLat.getLat() * Math.PI / 180;
	                var _lng_d = Math.abs(_c_lng - _lng),
	                    _lat_d = Math.abs(_c_lat - _lat);
	                var stepOne = Math.pow(Math.sin(_lat_d / 2), 2) + Math.cos(_c_lat) * Math.cos(_lat) * Math.pow(Math.sin(_lng_d / 2), 2);
	                var stepTwo = 2 * Math.asin(Math.min(1, Math.sqrt(stepOne)));
	                var _distance = (6371012 * stepTwo).toFixed(2);
	                if (radius >= _distance) {
	                    return true;
	                } else {
	                    return false;
	                }
	            },
	            /* 判断是否在矩形内 */
	            inRect: function inRect(bounds, lngLat) {
	                var _ne_lng = bounds.northeast.lng,
	                    _ne_lat = bounds.northeast.lat,
	                    _sw_lng = bounds.southwest.lng,
	                    _sw_lat = bounds.southwest.lat,
	                    _lng = lngLat.lng,
	                    _lat = lngLat.lat;
	                if (_sw_lng < _lng && _lng < _ne_lng) {
	                    if (_sw_lat < _lat && _lat < _ne_lat) {
	                        return true;
	                    }
	                }
	                return false;
	            },
	            /* 标注点被选中后的样式 */
	            iconPicked: function iconPicked(m) {
	                var iconPic = void 0;
	                var size = void 0,
	                    offset = void 0;
	                if (m.type && m.type == 'stop-icon') {
	                    size = new IMAP.Size(14, 14);
	                    offset = new IMAP.Pixel(3, 3);
	                } else {
	                    size = new IMAP.Size(24, 23);
	                    //size = new IMAP.Size(36, 24)
	                    offset = new IMAP.Pixel(1, 0);
	                }
	                iconPic = new IMAP.Icon(staticsUrl + '/images/map/' + m.type + 'h.png', { 'size': size, 'offset': offset });
	                m.setIcon(iconPic);
	            },
	            /* 恢复标注点样式 */
	            iconRecover: function iconRecover(m) {
	                // console.log(m)
	                var icon = void 0;
	                var size = void 0,
	                    offset = void 0;
	                if (m.type && m.type == 'stop-icon') {
	                    size = new IMAP.Size(14, 14);
	                    offset = new IMAP.Pixel(3, 3);
	                } else {
	                    size = new IMAP.Size(24, 23);
	                    //size = new IMAP.Size(36, 24)
	                    offset = new IMAP.Pixel(1, 0);
	                }
	                icon = new IMAP.Icon(staticsUrl + '/images/map/' + m.type + '.png', { 'size': size, 'offset': offset });
	                m.setIcon(icon);
	            },
	            reLoadViewMarker: function reLoadViewMarker() {
	                var _this = this,
	                    _currentZoom = map.getZoom();
	                // 没有树形结构的时候
	                if (typeof yisaTree != 'undefined' && _currentZoom < 13) {
	                    //应该缩放前全部清除，暂时做法，判断zoom级别后再进行是否清除选择
	                    // //删除所有点图标
	                    if (markerArr.length > 0) {
	                        map.getOverlayLayer().clear(markerArr);
	                        markerArr = [];
	                    }
	                    if (labels.length == 0) {
	                        _this.loadCity();
	                        _this._viewFirst = true;
	                        $('#map-pannel').hide();
	                        _this._navi.setOffset(new IMAP.Pixel(-15, 15));
	                    }
	                } else {
	                    if (labels.length > 0) {
	                        map.getOverlayLayer().clear(labels);
	                        labels = [];
	                        // $('#map-pannel').show();
	                    }
	                    //移除行政区边界，防止鼠标在圆圈上缩放引起的bug
	                    if (boundaryOverlayArr.length > 0) {
	                        for (var b = 0; b < boundaryOverlayArr.length; b++) {
	                            map.getOverlayLayer().removeOverlay(boundaryOverlayArr[b]);
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
	                    _this._navi.setOffset(new IMAP.Pixel(-15, 15));
	                } else {
	                    // 显示设备图标说明面板
	                    $('#map-pannel').show();
	                    _this._navi.setOffset(new IMAP.Pixel(-15, 55));
	                    if (_this._viewFirst) {
	                        map.panBy(-120, 0);
	                        _this._viewFirst = false;
	                    }
	                    var _bounds = map.getBounds(),
	                        _sw = _bounds.southwest.lng + ',' + _bounds.southwest.lat,
	                        _ne = _bounds.northeast.lng + ',' + _bounds.northeast.lat;
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
	            //arr是一个包含point的数组,每个point包含纬度,经度,地址id,卡口名称
	            peerAddMarker: function peerAddMarker(arr) {
	                var _this = this;
	                if (map) {
	                    map.getOverlayLayer().clear();
	                    this._markerAll = [];
	                    for (var a = 0; a < arr.length; a++) {
	                        var opts = new IMAP.MarkerOptions();
	                        var lng = arr[a][0],
	                            lat = arr[a][1],
	                            title = arr[a][3];
	                        opts.anchor = IMAP['Constants']['BOTTOM_CENTER'];
	                        opts.icon = new IMAP.Icon(staticsUrl + '/images/map/stop-markerh.png', {
	                            'size': new IMAP.Size(24, 23),
	                            'offset': new IMAP.Pixel(1, 0),
	                            'title': arr[a][3],
	                            'visible': true
	                        });
	                        var lnglat = new IMAP.LngLat(lng, lat);
	                        var _marker3 = new IMAP.Marker(lnglat, opts);
	                        _marker3.type = 'stop-marker';
	                        map.getOverlayLayer().addOverlays(_marker3, true);
	                        _marker3.setTitle(arr[a][3]);
	                        //marker.setLabel("京Q-8382233", IMAP.Constants.RIGHT_TOP, new IMAP.Pixel(0,0));
	                        this._markerAll.push(_marker3);
	                    }

	                    map.getOverlayLayer().addOverlays(this._markerAll, true);
	                }
	            },
	            peerShowViewMarker: function peerShowViewMarker(arr) {
	                var _this = this;
	                map.addEventListener(IMAP.Constants.ZOOM_END, function (e) {
	                    if (_this._mapEvent) {
	                        // _this.clearAll();
	                        _this.peerAddMarker(arr);
	                    }
	                }, map);
	                map.addEventListener(IMAP.Constants.DRAG_END, function (e) {
	                    if (_this._mapEvent) {
	                        // _this.clearAll();
	                        _this.peerAddMarker(arr);
	                    }
	                }, map);
	                map.addEventListener(IMAP.Constants.RESIZE, function (e) {
	                    if (_this._mapEvent) {
	                        // _this.clearAll();
	                        _this.peerAddMarker(arr);
	                    }
	                }, map);
	            },
	            /* 定义窗体信息 */
	            infoWindow: function infoWindow(lng, lat, title, content, w, h) {
	                var width = 500,
	                    height = 250;
	                var infowindowOpts = new IMAP.InfoWindowOptions();
	                if (w && h) {
	                    infowindowOpts.size = new IMAP.Size(w, h);
	                } else {
	                    infowindowOpts.size = new IMAP.Size(width || 0, height || 0);
	                }
	                infowindowOpts.offset = new IMAP.Pixel(0, 0);
	                infowindowOpts.position = new IMAP.LngLat(lng, lat);
	                infowindowOpts.title = title;
	                infowindowOpts.autoPan = true;
	                infowindow = new IMAP.InfoWindow(content, infowindowOpts);
	                map.getOverlayLayer().addOverlay(infowindow);
	                infowindow.visible(true);
	                // map.setCenter(new IMAP.LngLat(lng, lat))
	            },
	            closeWindow: function closeWindow() {
	                if (map && infowindow) {
	                    map.getOverlayLayer().removeOverlay(infowindow);
	                }
	            },
	            /*清除页面infowindow，添加制定infowindow*/
	            warningHoverWindow: function warningHoverWindow(lng, lat, title, content, carry) {
	                this.closeWindow();
	                if (parseInt(lng) != 0 && parseInt(lat) != 0) {
	                    if (carry) {
	                        this.infoWindow(lng, lat, title, content, 200, 220);
	                    } else {
	                        this.infoWindow(lng, lat, title, content);
	                    }
	                    map.setCenter(new IMAP.LngLat(lng, lat));
	                }
	            },
	            // 加载窗体信息
	            alarmInfoWindow: function alarmInfoWindow(data, aom) {
	                var _this = this;
	                if (map && infowindow) {
	                    map.getOverlayLayer().removeOverlay(infowindow);
	                }
	                var title = '\u8F66\u8F86\u544A\u8B66\uFF08<span>' + data.deployType + '</span>\uFF09';
	                var content = '';
	                if (aom) {
	                    content = '\n                        <div class="winInfo-txt">\n                            <dl>\n                                <dt>\u544A\u8B66\u4FE1\u606F</dt>\n                                <dd><span>\u5E03\u63A7\u53F7\u7801\uFF1A</span>' + data.number + '</dd>\n                                <dd><span>\u5E03\u63A7\u7C7B\u578B\uFF1A</span>' + data.deployType + '</dd>\n                                <dd><span>\u53D1\u73B0\u5730\u70B9\uFF1A</span>' + data.locationName + '</dd>\n                                <dd><span>\u53D1\u73B0\u65F6\u95F4\uFF1A</span>' + data.captureTime + '</dd>\n                                <dd><span>\u884C\u9A76\u65B9\u5411\uFF1A</span>' + data.directionName + '</dd>\n                            </dl>\n                            <dl>\n                                <dt>\u5E03\u63A7\u5355\u4FE1\u606F</dt>\n                                <dd><span>\u7533\u8BF7\u4EBA\uFF1A</span>' + data.applyUser + '</dd>\n                                <dd><span>\u7535\u8BDD\uFF1A</span>' + data.applyPhone + '</dd>\n                                <dd><span>\u5E03\u63A7\u5355\u53F7\uFF1A</span>' + data.deploySheetID + '</dd>\n                                <dd><span>\u5E03\u63A7\u539F\u56E0\uFF1A</span>' + data.deployReason + '</dd>\n                            </dl>                    \n                        </div>\n                        ';
	                } else {
	                    content = '\n                    <div class="winInfo-img">\n                        <img src="' + data.bigPic + '" atl="">\n                    </div>\n                    <div class="winInfo-txt">\n                        <dl>\n                            <dt>\u8F66\u8F86\u4FE1\u606F</dt>\n                            <dd><span>\u8F66\u724C\u53F7\uFF1A</span>' + data.plate + '</dd>\n                            <dd><span>\u8F66\u8EAB\u989C\u8272\uFF1A</span>' + data.colorName + '</dd>\n                            <dd><span>\u8F66\u578B\uFF1A</span>' + data.yearName + '</dd>\n                        </dl>\n                        <dl>\n                            <dt>\u544A\u8B66\u4FE1\u606F</dt>\n                            <dd><span>\u53D1\u73B0\u5730\u70B9\uFF1A</span>' + data.locationName + '</dd>\n                            <dd><span>\u53D1\u73B0\u65F6\u95F4\uFF1A</span>' + data.captureTime + '</dd>\n                            <dd><span>\u884C\u9A76\u65B9\u5411\uFF1A</span>' + data.directionName + '</dd>\n                            <dd><span>\u8F66\u901F\uFF1A</span>' + data.speed + '</dd>\n                        </dl>\n                        <dl>\n                            <dt>\u5E03\u63A7\u5355\u4FE1\u606F</dt>\n                            <dd><span>\u7533\u8BF7\u4EBA\uFF1A</span>' + data.applyUser + '</dd>\n                            <dd><span>\u7535\u8BDD\uFF1A</span>' + data.applyPhone + '</dd>\n                            <dd><span>\u5E03\u63A7\u5355\u53F7\uFF1A</span>' + data.deploySheetID + '</dd>\n                            <dd><span>\u5E03\u63A7\u7C7B\u578B\uFF1A</span>' + data.deployType + '</dd>\n                            <dd><span>\u5E03\u63A7\u539F\u56E0\uFF1A</span>' + data.deployReason + '</dd>\n                        </dl>\n                    </div>\n                    ';
	                }
	                // _this.setPosition(data.lng, data.lat);
	                if (parseInt(data.lng) && parseInt(data.lat)) {
	                    setTimeout(_this.infoWindow(data.lng, data.lat, title, content), 5000);
	                } else {
	                    _this.closeWindow();
	                    // _this.setPosition(data.lng, data.lat);
	                }
	            },

	            /**
	             * 应用：搜索结果页面
	             * 定位
	             * */
	            fixedPosition: function fixedPosition(lng, lat) {

	                if (markerArr) {
	                    map.getOverlayLayer().clear(markerArr);
	                    markerArr = [];
	                }
	                var lnglat = void 0;
	                if (lng && lat) {
	                    lnglat = new IMAP.LngLat(lng, lat);
	                    map.setCenter(lnglat);
	                    map.setZoom(16);
	                } else {
	                    lnglat = options.center;
	                    return;
	                }
	                var opts = new IMAP.MarkerOptions();
	                opts.anchor = IMAP.Constants.BOTTOM_CENTER;
	                opts.icon = new IMAP.Icon(IMAP.MapConfig.API_REALM_NAME + 'images/point_1.png', {
	                    'size': new IMAP.Size(35, 30),
	                    'offset': new IMAP.Pixel(1, 0)
	                });
	                marker = new IMAP.Marker(lnglat, opts);
	                map.getOverlayLayer().addOverlay(marker, true);
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
	                    map.getOverlayLayer().clear();
	                }
	                var _lnglat = void 0,
	                    _zoom = void 0;
	                if (parseInt(lng) && parseInt(lat)) {
	                    _lnglat = new IMAP.LngLat(lng, lat);
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
	             * labelArr: Array
	             * {text,lng,lat,count}
	             * */
	            addLabels: function addLabels(labelArr) {
	                var _this = this;
	                var opts = {
	                    type: IMAP.Constants.OVERLAY_LABEL_DEFAULT,
	                    offset: new IMAP.Pixel(0, 0),
	                    anchor: IMAP.Constants.CENTER,
	                    fontName: '"Microsoft Yahei",Helvetica,Arial,sans-serif',
	                    fontColor: '#fff',
	                    fontBold: false,
	                    editabled: true
	                };

	                var _loop2 = function _loop2(i) {
	                    var labelOpts = Object.assign({}, opts, { position: new IMAP.LngLat(labelArr[i].lng, labelArr[i].lat) });
	                    var label = new IMAP.Label(labelArr[i].text + '<b>' + labelArr[i].count + '</b>', labelOpts);
	                    labels.push(label);
	                    map.getOverlayLayer().addOverlay(label);
	                    label.addEventListener(IMAP.Constants.MOUSE_OVER, function (e) {
	                        _this.cityBoundary(labelArr[i].text);
	                    }, label);
	                    label.addEventListener(IMAP.Constants.MOUSE_OUT, function (e) {
	                        if (boundaryOverlayArr.length > 0) {
	                            for (var b = 0; b < boundaryOverlayArr.length; b++) {
	                                map.getOverlayLayer().removeOverlay(boundaryOverlayArr[b]);
	                            }
	                            boundaryOverlayArr = [];
	                        } else {
	                            setTimeout(function () {
	                                for (var _b = 0; _b < boundaryOverlayArr.length; _b++) {
	                                    map.getOverlayLayer().removeOverlay(boundaryOverlayArr[_b]);
	                                }
	                                boundaryOverlayArr = [];
	                            }, boundaryLoodTime + 50);
	                        }
	                    }, label);
	                    label.addEventListener(IMAP.Constants.CLICK, function (e) {
	                        var _thisLabel = e.target;
	                        var zoomAfterClick = 13;
	                        //移除行政区边界
	                        if (boundaryOverlayArr.length > 0) {
	                            for (var b = 0; b < boundaryOverlayArr.length; b++) {
	                                map.getOverlayLayer().removeOverlay(boundaryOverlayArr[b]);
	                            }
	                            boundaryOverlayArr = [];
	                        } else {
	                            setTimeout(function () {
	                                for (var _b2 = 0; _b2 < boundaryOverlayArr.length; _b2++) {
	                                    map.getOverlayLayer().removeOverlay(boundaryOverlayArr[_b2]);
	                                }
	                                boundaryOverlayArr = [];
	                            }, boundaryLoodTime + 50);
	                        }
	                        // map.setZoom(zoomAfterClick);
	                        map.setCenter(_thisLabel.getPosition());
	                        setTimeout(function () {
	                            map.setZoom(zoomAfterClick);
	                            // map.setCenter(_thisLabel.getPosition());
	                        }, 500);
	                        _this.reLoadViewMarker();
	                    }, label);
	                };

	                for (var i = 0; i < labelArr.length; i++) {
	                    _loop2(i);
	                }
	                $('.imap-overlay-pane .imap-clickable').addClass('label-city');
	                map.getOverlayLayer().addOverlays(labels);
	            },
	            /**
	             * 获取城市边界
	             * 省 市 区(县)
	             * */
	            cityBoundary: function cityBoundary(city) {
	                if (map && sysRegion != '370211') {
	                    //黄岛不显示地区边框
	                    var startTime = new Date().getTime(),
	                        endTime = void 0;
	                    map.plugin(['IMAP.DistrictSearch'], function () {
	                        var boundarySearch = new IMAP.DistrictSearch();
	                        boundarySearch.search(city, function (status, result) {
	                            if (status == 0) {
	                                var paths = result.results,
	                                    pathArray = void 0;
	                                for (var p = 0, l = paths.length; p < l; ++p) {
	                                    // 芜湖市(340200)特殊处理
	                                    if (sysRegion == '340200' && paths[p].name !== city) {
	                                        continue;
	                                    }
	                                    if (paths[p]) {
	                                        pathArray = paths[p].polyline.split('|');
	                                        var path = void 0;
	                                        for (var i = 0, il = pathArray.length; i < il; ++i) {
	                                            var lnglats = [];
	                                            path = pathArray[i].split(';');
	                                            for (var j = 0, j_l = path.length; j < j_l; j++) {
	                                                var lnglat = path[j].split(',');
	                                                lnglat = new IMAP.LngLat(lnglat[0], lnglat[1]);
	                                                lnglats.push(lnglat);
	                                            }
	                                            var polygon = new IMAP.Polygon(lnglats, {
	                                                fillOpacity: 0.5,
	                                                strokeStyle: IMAP.Constants.OVERLAY_LINE_SOLID,
	                                                strokeColor: '#e4393c',
	                                                strokeWeight: 2
	                                            });
	                                            boundaryOverlayArr.push(polygon);
	                                        }
	                                    }
	                                }
	                                map.getOverlayLayer().addOverlays(boundaryOverlayArr, false);
	                            }
	                            endTime = new Date().getTime();
	                            boundaryLoodTime = endTime - startTime;
	                        });
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
	                var lnglat = new IMAP.LngLat(data[0].lng, data[0].lat);
	                map.setBestMap(lnglat);
	                return markerPickedIdArr = _idArr;
	            },
	            /**
	             * 清除地图上的所有点*/
	            clearAllMarker: function clearAllMarker() {
	                map.getOverlayLayer().clear(markerArr);
	                markerArr = [];
	                markerIdArr = [];
	            },
	            /**
	             * 添加文字覆盖图层
	             * */
	            addTextLayer: function addTextLayer() {
	                var _this = this;
	                if (this.bgTileLayer) {
	                    return;
	                }
	                this.bgTileLayer = new IMAP.TileLayer({
	                    minZoom: mapConfig.minZoom,
	                    maxZoom: mapConfig.maxZoom,
	                    tileSize: 256
	                });
	                this.bgTileLayer.setTileUrlFunc(_this.getTileUrl);
	                this.bgTileLayer.setOpacity(0.8);
	                map.addLayer(this.bgTileLayer);
	            },
	            /**
	             * 获取覆盖图层地址
	             * */
	            getTileUrl: function getTileUrl(x, y, z) {
	                return 'http://' + mapConfig.mapStyle.tileUrl + '/v3/tile?z=' + z + '&x=' + x + '&y=' + y;
	            },
	            /**
	             * 批量添加标注点
	             * arr : 坐标集合
	             * */
	            addEquipmentManagerMarker: function addEquipmentManagerMarker(arr, cb) {
	                var _this = this;
	                var thisArr = [];
	                var thisLngLatArr = [];
	                arr.forEach(function (elem) {
	                    var opts = new IMAP.MarkerOptions();
	                    opts.editable = false;
	                    opts.anchor = IMAP.Constants.CENTER;
	                    if (elem.state == '2') {
	                        opts.icon = new IMAP.Icon(staticsUrl + '/images/map/gray.png', size, offset);
	                    } else {
	                        if (parseInt(elem.num) == 0) {
	                            opts.icon = new IMAP.Icon(staticsUrl + '/images/map/orange.png', size, offset);
	                        } else {
	                            opts.icon = new IMAP.Icon(staticsUrl + '/images/map/green.png', size, offset);
	                        }
	                    }
	                    if (parseInt(elem.lng) && parseInt(elem.lat)) {
	                        var lngLat = new IMAP.LngLat(elem.lng, elem.lat);
	                        thisLngLatArr.push(lngLat);
	                        marker = new IMAP.Marker(lngLat, opts);
	                        marker.id = elem.id;
	                        marker.location_id = elem.location_id;
	                        marker.text = elem.text;
	                        marker.type = elem.type;
	                        marker.lng = elem.lng;
	                        marker.lat = elem.lat;
	                        thisArr.push(marker);
	                        marker.addEventListener(IMAP.Constants.CLICK, function (e) {
	                            var _marker = e.target;
	                            if (cb) {
	                                cb(_marker.id, _marker.lng, _marker.lat);
	                            }
	                        });
	                        marker.addEventListener(IMAP.Constants.MOUSE_OVER, function (e) {
	                            var _marker = e.target;
	                            var labelOpts = {
	                                type: IMAP.Constants.OVERLAY_LABEL_HTML,
	                                position: _marker.getPosition(),
	                                offset: new IMAP.Pixel(0, -13),
	                                anchor: IMAP.Constants.BOTTOM_CENTER,
	                                fontColor: '#333'
	                            };
	                            var _text = _marker.text + '<span class="triangle-down"><i></i></span>';
	                            _marker.setLabel(_text, labelOpts);
	                            $('.imap-overlay-pane .imap-clickable').addClass('label-marker-address');
	                            $('.imap-overlay-pane').css('z-index', '800');
	                        });
	                        marker.addEventListener(IMAP.Constants.MOUSE_OUT, function (e) {
	                            var _marker = e.target;
	                            setTimeout(function () {
	                                _marker.removeLabel();
	                            }, 100);
	                        });
	                    }
	                });
	                map.getOverlayLayer().addOverlays(thisArr, false);
	                map.setBestMap(thisLngLatArr);
	            },
	            // 加载窗体信息
	            equipmentManagerInfoWindow: function equipmentManagerInfoWindow(data, lng, lat) {
	                var _this = this;
	                if (map && infowindow) {
	                    map.getOverlayLayer().removeOverlay(infowindow);
	                }
	                var title = '<div>' + data.location_name + '</div>';
	                var content = '';
	                content = '\n          <div class="equipment-manager-infowindow">\n            <table>\n              <tr><th>\u7CFB\u7EDF\u5361\u53E3ID</th><td>' + data.location_id + '</td></tr>\n              <tr><th>\u5382\u5546\u5361\u53E3ID</th><td>' + data.loc_id + '</td></tr>\n              <tr><th>24H\u8FC7\u8F66\u91CF</th><td>' + data.num + '</td></tr>\n              <tr><th>\u7ECF\u7EAC\u5EA6</th><td>' + (data.lng != '' ? data.lng : '') + ',' + (data.lat != '' ? data.lat : '') + '</td></tr>\n              <tr><th>\u6240\u5C5E\u5730\u533A</th><td>' + data.regionName + '</td></tr>\n              <tr><th>\u7BA1\u8F96\u5355\u4F4D</th><td>' + data.section + '</td></tr>\n              <tr><th>\u5361\u53E3\u72B6\u6001</th><td>' + (data.state == '2' ? '停用' : parseInt(data.num) == 0 ? '无数据' : '正常') + '</td></tr>\n              <tr><th>\u5361\u53E3\u7C7B\u578B\u6807\u8BC6</th><td>' + data.location_identify + '</td></tr>\n              <tr><th>\u5361\u53E3\u7EC4</th><td>' + data.device_group + '</td></tr>\n            </table>\n            <div class="footer">\n              <a href="' + data.reviseUrl + '">\u4FEE \u6539</a>\n              <a class="recovery" data-location_id="' + data.location_id + '">\u7EA0 \u9519</a>\n            </div>\n          </div>\n        ';
	                if (parseInt(lng) && parseInt(lat)) {
	                    setTimeout(_this.infoWindow(lng, lat, title, content), 1000);
	                } else {
	                    _this.closeWindow();
	                }
	            },
	            regionCarClear: function regionCarClear() {
	                var _this = this;
	                if (vectorArr.length > 0) {
	                    for (var v = 0; v < vectorArr.length; v++) {
	                        vectorArr[v].clear();
	                    }
	                    vectorArr = [];
	                }
	                if (_this.regionCarInfoWindow != null) {
	                    map.getOverlayLayer().removeOverlay(_this.regionCarInfoWindow);
	                    _this.regionCarInfoWindow = null;
	                }
	                for (var m = 0; m < markerArr.length; m++) {
	                    if ($.inArray(markerArr.id, _this.pickedIdArr) == -1) {
	                        this.iconRecover(markerArr[m]);
	                    }
	                }
	                _this.pickedIdArr = [];
	                setTimeout(function () {
	                    $('#drawClear').removeClass('current');
	                    $('#drawDefault').addClass('current');
	                }, 200);
	            },
	            regionCarDraw: function regionCarDraw(drawType) {
	                var _this = this;
	                if (_this.regionCarInfoWindow != null) {
	                    _this.regionCarClear();
	                }
	                switch (drawType) {
	                    case 'drawCircle':
	                        drawTool = new IMAP.CircleTool();
	                        break;
	                    case 'drawRectangle':
	                        drawTool = new IMAP.RectangleTool();
	                        break;
	                    case 'drawArbitrary':
	                        drawTool = new IMAP.ArbitraryTool();
	                        break;
	                    case 'drawClear':
	                        _this.regionCarClear();
	                        return;
	                    default:
	                        return;
	                }
	                map.addTool(drawTool);
	                drawTool.autoClose = true;
	                drawTool.open();
	                vectorArr.push(drawTool);
	                addOverlayEvt = drawTool.addEventListener(IMAP.Constants.ADD_OVERLAY, function (e) {
	                    var _overlay = e.overlay,
	                        _overlayId = _overlay.getId();
	                    overlayArr[_overlayId] = _overlay;
	                    var tempPicked = [];
	                    if (drawType == 'drawCircle') {
	                        if (_overlay.getRadius() == -1) {
	                            map.getOverlayLayer().removeOverlay(_overlayId);
	                        } else {
	                            var _center = _overlay.getCenter(),
	                                _radius = _overlay.getRadius();
	                            for (var m = 0; m < markerArr.length; m++) {
	                                if (_this.inCircle(_center, _radius, markerArr[m].getPosition()) && $.inArray(markerArr[m].id, _this.pickedIdArr) == -1) {
	                                    _this.pickedIdArr.push(markerArr[m].id);
	                                    tempPicked.push(markerArr[m]);
	                                    _this.iconPicked(markerArr[m]);
	                                }
	                            }
	                            if (tempPicked.length == 0) {
	                                map.getOverlayLayer().removeOverlay(_overlay);
	                                delete overlayArr[_overlayId];
	                                alert('未选择任何标注点');
	                            } else {
	                                _this.regionCarInfoWindow = new IMAP.InfoWindow('<div class="region-car-operation">\n                    <button class="button-show js-operation" data-str="show">\u67E5\u770B\u7EDF\u8BA1</button>\n                    <button class="button-redo js-operation" data-str="redo">\u91CD\u65B0\u9009\u62E9</button>\n                  </div>', {
	                                    position: _overlay.getCenter(),
	                                    anchor: IMAP.Constants.CENTER,
	                                    offset: new IMAP.Pixel(0, 0),
	                                    type: IMAP.Constants.OVERLAY_INFOWINDOW_CUSTOM
	                                });
	                                map.getOverlayLayer().addOverlay(_this.regionCarInfoWindow);
	                            }
	                        }
	                        $('#drawCircle').removeClass('current');
	                        $('#drawDefault').addClass('current');
	                    }
	                    if (drawType == 'drawRectangle') {
	                        if (_overlay.getBounds().northeast.lng == _overlay.getBounds().southwest.lng && _overlay.getBounds().northeast.lat == _overlay.getBounds().southwest.lat) {
	                            map.getOverlayLayer().removeOverlay(_overlayId);
	                        } else {
	                            var _bounds = _overlay.getBounds();
	                            for (var _m5 = 0; _m5 < markerArr.length; _m5++) {
	                                if (_this.inRect(_bounds, markerArr[_m5].getPosition()) && $.inArray(markerArr[_m5].id, _this.pickedIdArr) == -1) {
	                                    _this.pickedIdArr.push(markerArr[_m5].id);
	                                    tempPicked.push(markerArr[_m5]);
	                                    _this.iconPicked(markerArr[_m5]);
	                                }
	                            }
	                            if (tempPicked.length == 0) {
	                                map.getOverlayLayer().removeOverlay(_overlayId);
	                                delete overlayArr[_overlayId];
	                                alert('未选择任何标注点');
	                            } else {
	                                _this.regionCarInfoWindow = new IMAP.InfoWindow('<div class="region-car-operation">\n                    <button class="button-show js-operation" data-str="show">\u67E5\u770B\u7EDF\u8BA1</button>\n                    <button class="button-redo js-operation" data-str="redo">\u91CD\u65B0\u9009\u62E9</button>\n                  </div>', {
	                                    position: tempPicked[0].getPosition(),
	                                    anchor: IMAP.Constants.CENTER,
	                                    offset: new IMAP.Pixel(0, 0),
	                                    type: IMAP.Constants.OVERLAY_INFOWINDOW_CUSTOM
	                                });
	                                map.getOverlayLayer().addOverlay(_this.regionCarInfoWindow);
	                            }
	                        }
	                        $('#drawRectangle').removeClass('current');
	                        $('#drawDefault').addClass('current');
	                    }
	                    if (drawType == 'drawArbitrary') {
	                        if (_overlay.getBounds().northeast.lng == _overlay.getBounds().southwest.lng && _overlay.getBounds().northeast.lat == _overlay.getBounds().southwest.lat) {
	                            map.getOverlayLayer().removeOverlay(_overlayId);
	                        } else {
	                            for (var _m6 = 0; _m6 < markerArr.length; _m6++) {
	                                if (IMAPLib.GeoUtils.isPointInPolygon(markerArr[_m6].getPosition(), _overlay) && $.inArray(markerArr[_m6].id, _this.pickedIdArr) == -1) {
	                                    _this.pickedIdArr.push(markerArr[_m6].id);
	                                    tempPicked.push(markerArr[_m6]);
	                                    _this.iconPicked(markerArr[_m6]);
	                                }
	                            }
	                            if (tempPicked.length == 0) {
	                                map.getOverlayLayer().removeOverlay(_overlayId);
	                                delete overlayArr[_overlayId];
	                                alert('未选择任何标注点');
	                            } else {
	                                _this.regionCarInfoWindow = new IMAP.InfoWindow('<div class="region-car-operation">\n                    <button class="button-show js-operation" data-str="show">\u67E5\u770B\u7EDF\u8BA1</button>\n                    <button class="button-redo js-operation" data-str="redo">\u91CD\u65B0\u9009\u62E9</button>\n                  </div>', {
	                                    position: tempPicked[0].getPosition(),
	                                    anchor: IMAP.Constants.CENTER,
	                                    offset: new IMAP.Pixel(0, 0),
	                                    type: IMAP.Constants.OVERLAY_INFOWINDOW_CUSTOM
	                                });
	                                map.getOverlayLayer().addOverlay(_this.regionCarInfoWindow);
	                            }
	                        }
	                        $('#drawArbitrary').removeClass('current');
	                        $('#drawDefault').addClass('current');
	                    }
	                }, drawTool);
	            },
	            trackContrastAddMarker: function trackContrastAddMarker(arr, color, data) {
	                var _this = this;
	                var resArr = [];
	                var labelOpts = {
	                    type: IMAP.Constants.OVERLAY_LABEL_HTML,
	                    offset: new IMAP.Pixel(0, 0),
	                    anchor: IMAP.Constants.BOTTOM_CENTER,
	                    fontName: '宋体',
	                    fontSize: 14,
	                    fontBold: false,
	                    editable: false
	                };
	                arr.forEach(function (elem, index) {
	                    var content = '\n            <div class="track-contrast-marker marker-' + color + '">\n              <span class="iconfont icon-zuobiao"><i>' + (index + 1) + '</i></span>\n            </div>\n          ';
	                    if (parseInt(elem.lng) && parseInt(elem.lat)) {
	                        var _label = new IMAP.Label(content, Object.assign({}, labelOpts, {
	                            position: new IMAP.LngLat(parseFloat(elem.lng), parseFloat(elem.lat))
	                        }));
	                        _label.pic = elem.pic;
	                        _label.captureTime = elem.captureTime;
	                        _label.locationName = elem.locationName;
	                        _label.type = data.type;
	                        resArr.push(_label);
	                        _label.addEventListener(IMAP.Constants.MOUSE_OVER, function (e) {
	                            // console.log(e.target)
	                            var content = '';
	                            var width = 220;
	                            var height = 50;
	                            if (e.target.type == 'plate') {
	                                content += '<img src="' + e.target.pic + '">';
	                                height = 220;
	                            }
	                            content += '\n                <p title="' + e.target.captureTime + '"><i class="iconfont icon-bigdata-pinfanguoche"></i>' + e.target.captureTime + '</p>\n                <p title="' + e.target.locationName + '"><i class="iconfont icon-zuobiao"></i>' + e.target.locationName + '</p>\n              ';
	                            _this.infoWindow(e.target.getPosition().lng, e.target.getPosition().lat, '', content, width, height);
	                            infowindow.setOffset(new IMAP.Pixel(0, -23));
	                        });
	                    }
	                });
	                map.getOverlayLayer().addOverlays(resArr, false);
	                return resArr;
	            },
	            trackDrawLine: function trackDrawLine(path, color) {
	                // let points = []
	                // if (typeof path[0] == 'string') {
	                //   points = path.join('').slice(0, -1).split(';')
	                //   points = points.map(elem => {
	                //     return new IMAP.LngLat(elem.split(',')[0], elem.split(',')[1])
	                //   })
	                // } else {
	                //   return false
	                // }
	                if (!path.length) {
	                    return false;
	                }
	                var opts = {
	                    strokeColor: '#' + color,
	                    strokeWeight: 3,
	                    strokeOpacity: 1,
	                    strokeStyle: IMAP.Constants.OVERLAY_LINE_SOLID
	                };
	                var polyline = new IMAP.Polyline(path, opts);
	                map.getOverlayLayer().addOverlay(polyline, false);
	                return polyline;
	            },
	            trackContrastBestMap: function trackContrastBestMap(obj) {
	                var arr = [];
	                // console.log(obj)
	                Object.keys(obj).forEach(function (elem) {
	                    if (obj[elem] && obj[elem].list && obj[elem].list.length > 0) {
	                        var list = obj[elem].list;
	                        list.forEach(function (item) {
	                            if (parseInt(item.lng) && parseInt(item.lat)) {
	                                arr.push(new IMAP.LngLat(parseFloat(item.lng), parseFloat(item.lat)));
	                            }
	                        });
	                    }
	                });
	                if (arr.length > 0) {
	                    map.setBestMap(arr);
	                }
	            },
	            trackRemoveOverlay: function trackRemoveOverlay(obj) {
	                // map.getOverlayLayer().removeOverlay
	                this.closeWindow();
	                if (obj.linePolyline) {
	                    map.getOverlayLayer().removeOverlay(obj.linePolyline);
	                }
	                if (obj.carPolyline) {
	                    map.getOverlayLayer().removeOverlay(obj.carPolyline);
	                }
	                if (obj.personPolyline) {
	                    map.getOverlayLayer().removeOverlay(obj.personPolyline);
	                }
	                if (obj.markerArr && obj.markerArr.length > 0) {
	                    obj.markerArr.forEach(function (elem) {
	                        map.getOverlayLayer().removeOverlay(elem);
	                    });
	                }
	                if (obj.runMarker) {
	                    map.getOverlayLayer().removeOverlay(obj.runMarker);
	                }
	                return {};
	            },
	            trackContrastRun: function trackContrastRun(obj, pathType, flag) {
	                if (!obj.runMarker) {
	                    var opts = new IMAP.MarkerOptions();
	                    opts.anchor = IMAP.Constants.BOTTOM_CENTER;
	                    if (obj.data.type == 'plate') {
	                        opts.icon = new IMAP.Icon(staticsUrl + '/images/map/car-red.png', {
	                            size: new IMAP.Size(43, 21)
	                        });
	                    } else {
	                        opts.icon = new IMAP.Icon(staticsUrl + '/images/map/phone.png', {
	                            size: new IMAP.Size(24, 24)
	                        });
	                    }
	                    var lngLat = obj.markerArr[0].getPosition();
	                    var runMarker = new IMAP.Marker(lngLat, opts);
	                    map.getOverlayLayer().addOverlay(runMarker, true);
	                    runMarker.moveAlong(obj[pathType + 'Path'], 30, true, true);
	                    return runMarker;
	                } else {
	                    obj.runMarker.visible(true);
	                    if (flag) {
	                        // run
	                        obj.runMarker.moveAlong(obj[pathType + 'Path'], 30, true, true);
	                    } else {
	                        // stop
	                        obj.runMarker.pauseMove();
	                    }
	                }
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