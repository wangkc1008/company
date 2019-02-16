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

	(function () {
	    if (typeof AMap !== 'undefined') {
	        var size = new AMap.Size(24, 23),
	            offset = new AMap.Pixel(0, 0);
	        var tumengTile = new AMap.TileLayer({
	            // 图块取图地址
	            // getTileUrl: 'http://' + mapConfig.mapTileHost +'/v3/tile?z=[z]&x=[x]&y=[y]'
	            getTileUrl: function getTileUrl(x, y, z) {
	                return 'http://' + mapConfig.mapTileHost + '/v3/tile?z=' + z + '&x=' + x + '&y=' + y;
	            }
	        });
	        var baiduTile = new AMap.TileLayer({
	            // getTileUrl: 'http://' + mapConfig.mapTileHost + '/tile/?qt=tile&z=[z]&x=[x]&y=[y]&styles=pl&scaler=1&udt=20180904'
	            getTileUrl: function getTileUrl(x, y, z) {
	                return 'http://' + mapConfig.mapTileHost + '/tile/?qt=tile&x=' + x + '&y=' + y + '&z=' + z + '&styles=pl&scaler=1&udt=20180904';
	            }
	        });
	        var options = {
	            zoom: mapConfig.zoom,
	            center: new AMap.LngLat(mapConfig.center[0], mapConfig.center[1]),
	            animateEnable: true,
	            layers: [tumengTile]
	            //   layers: [baiduTile]
	        };
	        var options2 = {
	            zoom: mapConfig.zoom,
	            center: new AMap.LngLat(mapConfig.center[0], mapConfig.center[1]),
	            animateEnable: true
	            /**
	             * 高德地图加载图盟卡片
	             * */
	        };var map = null,
	            map2 = null,
	            marker = void 0,
	            marker2 = void 0,
	            carMarker = void 0,
	            markerArr = [],
	            markerArr2 = [],
	            markerIdArr = [],
	            markerPickedIdArr = [],
	            drawTool = null,
	            addOverlayEvt = null,
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
	            _arbitraryDownEvt: null, // 高德地图，自由绘制事件
	            _arbitraryUpEvt: null, // 高德地图，自由绘制事件
	            massMarkerInfoWindow: null,
	            massMarkerInfoWindowFlag: true,
	            _infoWindow: null,
	            _mutipleMass: null,
	            initMap: function initMap(elem) {
	                var _this = this;
	                if (!map) {
	                    window.amap = map = new AMap.Map(elem, options);
	                } else {
	                    return false;
	                }
	                if (options.zoom < 13) {
	                    _this._viewFirst = true;
	                } else {
	                    _this._viewFirst = false;
	                }
	                AMap.event.addListener(map, 'dragstart', function (e) {
	                    // console.log('dragged..')
	                    _this.massMarkerInfoWindowFlag = true;
	                });
	                var listener_zoom_end = AMap.event.addListener(map, 'zoomend', function (e) {
	                    if (e.zoom < 13) {
	                        for (var i in overlayArr) {
	                            overlayArr[i].visible(false); // visible  ??
	                        }
	                    } else {
	                        for (var _i in overlayArr) {
	                            !overlayArr[_i]._visible && overlayArr[_i].visible(true);
	                        }
	                    }
	                    if (_this._mapEvent) {
	                        _this.reLoadViewMarker();
	                    }
	                });
	                var listener_move_end = AMap.event.addListener(map, 'moveend', function (e) {
	                    if (_this._mapEvent) {
	                        _this.reLoadViewMarker();
	                    }
	                });
	                var listener_resize = AMap.event.addListener(map, 'resize', function (e) {
	                    if (_this._mapEvent) {
	                        _this.reLoadViewMarker();
	                    }
	                });
	                map.plugin(['AMap.Scale', 'AMap.ToolBar'], function () {
	                    var _scale = new AMap.Scale({
	                        position: 'RB'
	                    });
	                    // console.log(_scale)
	                    _this._navi = new AMap.ToolBar({
	                        position: 'RT',
	                        offset: new AMap.Pixel(15, 55),
	                        locate: false,
	                        direction: false
	                    });
	                    // console.log(_this._navi)
	                    // 加载比例尺
	                    map.addControl(_scale);
	                    // 加载缩放工具条
	                    map.addControl(_this._navi);
	                });
	                map.setStatus({
	                    scrollWheel: _this._scrollWheel,
	                    dragEnable: _this._dragged,
	                    resizeEnable: true
	                });
	            },
	            initMap2: function initMap2(elem) {
	                var _this = this;
	                console.log(elem);
	                if (!map2) {
	                    window.amap2 = map2 = new AMap.Map(elem, options2);
	                } else {
	                    return false;
	                }
	            },
	            clearAll: function clearAll() {
	                if (carMarker) {
	                    carMarker = null;
	                }
	                map.clearMap();
	            },
	            /*detail添加一个文本标签*/
	            addLabel: function addLabel(lng, lat, loc) {
	                map.clearMap();
	                // 高德地图没有label，需要先添加一个marker，再设置label
	                console.log('addLabel () {}');
	            },
	            getAllMarkers: function getAllMarkers() {
	                var os = map.getAllOverlays('marker');
	                var re = {};
	                for (var i in os) {
	                    re[os[i].id] = os[i].getPosition().getLng() + ',' + os[i].getPosition().getLat();
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
	                        var opts = {};
	                        if ($.inArray(arr[a].id, markerPickedIdArr) == -1) {
	                            opts.icon = new AMap.Icon({
	                                size: size,
	                                imageOffset: offset,
	                                image: staticsUrl + '/images/map/' + arr[a].type + '.png'
	                            });
	                        } else {
	                            opts.icon = new AMap.Icon({
	                                size: size,
	                                imageOffset: offset,
	                                image: staticsUrl + '/images/map/' + arr[a].type + 'h.png'
	                            });
	                        }
	                        var lngLat = new AMap.LngLat(arr[a].lng, arr[a].lat);
	                        if (lngLat) {
	                            opts.position = lngLat;
	                            opts.map = map;
	                            marker = new AMap.Marker(opts); // 加载到地图上
	                            marker.id = arr[a].id;
	                            marker.type = arr[a].type;
	                            marker.text = arr[a].text;
	                            markerArr.push(marker);
	                            markerIdArr.push(marker.id);
	                            if (_this._markerEvent) {
	                                marker.on('click', function (e) {
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
	                                });
	                            }
	                            // 鼠标移入 显示标注点 位置
	                            marker.on('mouseover', function (e) {
	                                var _marker = e.target;
	                                var labelOpts = {
	                                    offset: new AMap.Pixel(-10, -25),
	                                    content: '<div class="imap-label">' + _marker.text + '<span class="triangle-down"><i></i></span></div>'
	                                };
	                                _marker.setLabel(labelOpts);
	                                $('.amap-marker .amap-marker-label').addClass('label-marker-address');
	                                // $('.imap-overlay-pane').css('z-index', '800')
	                                _marker.setTop(true);
	                            });
	                            // 鼠标移除 移除标注点 位置
	                            marker.on('mouseout', function (e) {
	                                var _marker = e.target;
	                                setTimeout(function () {
	                                    _marker.setLabel({});
	                                    _marker.setTop(false);
	                                }, 100);
	                            });
	                        }
	                    }
	                }
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
	                            var opts = {};
	                            opts.icon = staticsUrl + '/images/map/' + arr[a].type + 'h.png';
	                            // opts.icon = new AMap.Icon({
	                            //   size: size,
	                            //   imageOffset: offset,
	                            //   image: `${staticsUrl}/images/map/${arr[a].type}h.png`
	                            // })
	                            var lngLat = new AMap.LngLat(arr[a].lng, arr[a].lat);
	                            if (lngLat) {
	                                opts.position = lngLat;
	                                opts.map = map; // 加载到地图上
	                                marker = new AMap.Marker(opts);
	                                marker.id = arr[a].id;
	                                marker.type = arr[a].type;
	                                marker.text = arr[a].text;
	                                markerArr.push(marker);
	                                markerIdArr.push(marker.id);
	                                if (_this._markerEvent) {
	                                    marker.on('click', function (e) {
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
	                                // 鼠标移入 显示标注点 位置
	                                marker.on('mouseover', function (e) {
	                                    var _marker = e.target;
	                                    var labelOpts = {
	                                        offset: new AMap.Pixel(0, -13),
	                                        content: _marker.text + '<span class="triangle-down"><i></i></span>'
	                                    };
	                                    _marker.setLabel(labelOpts);
	                                    $('.amap-marker .amap-marker-label').addClass('label-marker-address');
	                                    $('.imap-overlay-pane').css('z-index', '800');
	                                });
	                                // 鼠标移除 移除标注点 位置
	                                marker.on('mouseout', function (e) {
	                                    var _marker = e.target;
	                                    setTimeout(function () {
	                                        _marker.setLabel({});
	                                    }, 100);
	                                });
	                            }
	                        }
	                    }
	                }
	            },
	            /**
	             * 添加所有点，每个点位有经过次数
	             * */
	            addAllMarkerWithNum: function addAllMarkerWithNum(data) {
	                var _this = this;
	                if (map) {
	                    _this.clearAllMarker();
	                    for (var d = 0; d < data.length; d++) {
	                        var opts = {};
	                        opts.icon = new AMap.Icon({
	                            size: new AMap.Size(29, 37),
	                            imageOffset: offset,
	                            image: staticsUrl + '/images/map/bubble.png'
	                        });
	                        opts.position = new AMap.LngLat(data[d].lng, data[d].lat);
	                        opts.map = map; // 加载到地图上
	                        opts.title = '' + data[d].text;
	                        marker = new AMap.Marker(opts);
	                        markerArr.push(marker);
	                        marker.setLabel({
	                            offset: new AMap.Pixel(0, 0),
	                            content: '<div class="imap-label">' + data[d].num + '</div>'
	                        });
	                        $('.amap-marker .amap-marker-label').addClass('label-with-num');
	                        $('.imap-overlay-pane').css('z-index', '800');
	                    }
	                }
	            },
	            /**
	             * 用label代替marker，不同label用不同颜色区分
	             * data [{category, location, num(time[], sum'', num'',), lng, lat}]
	             * */
	            addLabelAsMarker: function addLabelAsMarker(data) {
	                // 首先清除所有覆盖物
	                map.clearMap();
	                // let _arr = []
	                // for (let i = 0; i < data.length; i++) {
	                //   _arr.push(data[i].category)
	                // }
	                // let _category = Array.from(new Set(_arr))
	                for (var j = 0; j < data.length; j++) {
	                    var _num = '';
	                    if (data[j].time) {
	                        _num = data[j].time.length;
	                    } else if (data[j].sum) {
	                        _num = data[j].sum;
	                    } else if (data[j].num) {
	                        _num = data[j].num;
	                    }
	                    // let _index = _category.findIndex(function (value) {
	                    //   return value === data[j].category
	                    // })
	                    var _content = '\n          <div class="gaode-category-marker category-marker color_' + data[j].categoryId + '" title="' + data[j].location + '">\n            <span>' + _num + '</span>\n          </div>\n        ';
	                    marker = new AMap.Marker({
	                        map: map,
	                        position: new AMap.LngLat(data[j].lng, data[j].lat)
	                    });
	                    marker.setLabel({
	                        offset: new AMap.Pixel(-4, -5),
	                        content: _content
	                    });
	                }
	                // 添加不上 ？？
	                // console.log($('.amap-marker .amap-marker-label'))
	                // $('.amap-marker .amap-marker-label').addClass('label-as-marker')
	            },
	            addLabelAsMarker2: function addLabelAsMarker2(data) {
	                // 首先清除所有覆盖物
	                map2.clearMap();
	                // let _arr = []
	                // for (let i = 0; i < data.length; i++) {
	                //   _arr.push(data[i].category)
	                // }
	                // let _category = Array.from(new Set(_arr))
	                for (var j = 0; j < data.length; j++) {
	                    var _num = '';
	                    if (data[j].time) {
	                        _num = data[j].time.length;
	                    } else if (data[j].sum) {
	                        _num = data[j].sum;
	                    } else if (data[j].num) {
	                        _num = data[j].num;
	                    }
	                    // let _index = _category.findIndex(function (value) {
	                    //   return value === data[j].category
	                    // })
	                    var _content = '\n          <div class="gaode-category-marker category-marker color_' + data[j].categoryId + '" title="' + data[j].location + '">\n            <span>' + _num + '</span>\n          </div>\n        ';
	                    marker = new AMap.Marker({
	                        map: map2,
	                        position: new AMap.LngLat(data[j].lng, data[j].lat)
	                    });
	                    marker.setLabel({
	                        offset: new AMap.Pixel(-8, -8),
	                        content: _content
	                    });
	                }
	                // 添加不上 ？？
	                // console.log($('.amap-marker .amap-marker-label'))
	                // $('.amap-marker .amap-marker-label').addClass('label-as-marker')
	            },
	            /* 添加一个marker，如果传入con，显示infowindow */
	            addMarkerOne: function addMarkerOne(lng, lat, locid, con) {
	                var icon = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 'stop-marker';
	                var edit = arguments[5];
	                var label = arguments[6];
	                var obj = arguments[7];

	                if (map) {
	                    var _this = this;
	                    var opts = {};
	                    var _size = '';
	                    var _offset = new AMap.Pixel(0, 0);
	                    var _mapOffset = '';
	                    if (icon == 1 || icon == 'phone') {
	                        // opts.icon = `${staticsUrl}/images/map/${icon}.png`
	                        opts.icon = new AMap.Icon({
	                            size: new AMap.Size(24, 23),
	                            imageOffset: _offset,
	                            image: staticsUrl + '/images/map/' + icon + '.png'
	                        });
	                        _mapOffset = new AMap.Pixel(-12, -23);
	                    } else if (icon == 'type_phone' || icon == 'type_car') {
	                        // opts.icon = `${staticsUrl}/images/map/${icon}.png`
	                        opts.icon = new AMap.Icon({
	                            size: new AMap.Size(25, 37),
	                            imageOffset: _offset,
	                            image: staticsUrl + '/images/map/' + icon + '.png'
	                        });
	                        _mapOffset = new AMap.Pixel(-12, -37);
	                    } else {
	                        if (icon == 'stop-icon') {
	                            _size = new AMap.Size(11, 11);
	                            _mapOffset = new AMap.Pixel(-5, -11);
	                        } else if (icon == 'map-start' || icon == 'map-end') {
	                            _size = new AMap.Size(25, 37);
	                            _mapOffset = new AMap.Pixel(-12, -37);
	                        } else {
	                            _size = new AMap.Size(24, 23);
	                            _mapOffset = new AMap.Pixel(-12, -23);
	                        }
	                        opts.icon = new AMap.Icon({
	                            size: _size,
	                            imageOffset: _offset,
	                            image: staticsUrl + '/images/map/' + icon + 'h.png'
	                        });
	                        // opts.icon = `${staticsUrl}/images/map/${icon}h.png`
	                    }
	                    opts.offset = _mapOffset;
	                    if (edit) {
	                        opts.draggable = true;
	                    }
	                    opts.position = new AMap.LngLat(lng, lat);
	                    opts.map = map;
	                    var _marker2 = new AMap.Marker(opts);
	                    _marker2.id = locid;
	                    _marker2.type = icon;
	                    _marker2.text = label;

	                    if (con) {
	                        _marker2.on('click', function (e) {
	                            _this.infoWindow(lng, lat, '', con, 200, 170);
	                        });
	                    }
	                    if (label) {
	                        _marker2.on('mouseover', function (e) {
	                            var _marker = e.target;
	                            var _text = '';
	                            if (obj) {
	                                _text = '\u51FA\u73B0\u65F6\u95F4\uFF1A' + obj.captureTime + ' \u4F4D\u7F6E\uFF1A' + obj.locationName + '<span class="triangle-down"><i></i></span>';
	                            } else {
	                                _text = _marker.text + '<span class="triangle-down"><i></i></span>';
	                            }
	                            _marker.setLabel({
	                                offset: new AMap.Pixel(0, -13),
	                                content: _text
	                            });
	                            $('.amap-marker .amap-marker-label').addClass('label-marker-address2');
	                        });
	                        _marker2.on('mouseout', function (e) {
	                            var _marker = e.target;
	                            setTimeout(function () {
	                                _marker.setLabel({});
	                            }, 100);
	                        });
	                    }
	                    this._markerAll.push(_marker2);
	                    return _marker2;
	                }
	            },
	            /*gb-手机wifi设备采集信息卡口点击事件*/
	            markerOneClick: function markerOneClick(marker, checkedMarkerIdArr) {
	                var _this = this;
	                var allChecked = [];
	                allChecked = checkedMarkerIdArr;
	                if (_this._markerEvent) {
	                    var flag = true;
	                    marker.on('click', function (e) {
	                        var _marker = e.target;
	                        if ($.inArray(_marker.id, allChecked) == -1) {
	                            _this.iconPicked(_marker);
	                            $('#associate-point').multiselect('select', _marker.id);
	                            $('#associate-equip').multiselect('select', _marker.id);
	                            allChecked.push(_marker.id);
	                        } else {
	                            _this.iconRecover(_marker);
	                            $('#associate-point').multiselect('deselect', _marker.id);
	                            $('#associate-equip').multiselect('deselect', _marker.id);
	                            if (allChecked) {
	                                $.each(allChecked, function (index, item) {
	                                    if (item == _marker.id) {
	                                        allChecked.splice(index, 1);
	                                    }
	                                });
	                            }
	                        }
	                    });
	                }
	            },
	            /*添加temArr中的marker*/
	            warningAddMakers: function warningAddMakers(tempArr, flag, carry) {
	                var _this = this;
	                var opts = {};
	                opts.icon = new AMap.Icon({
	                    size: new AMap.Size(24, 23),
	                    imageOffset: new AMap.Pixel(0, 0),
	                    image: staticsUrl + '/images/map/1.png'
	                });
	                opts.map = map;
	                // 超过20个点位在数组中移除
	                var len = warningMarkerArr.length;
	                if (len + tempArr.length > 20) {
	                    for (var i = 0; i < len + tempArr.length - 20; i++) {
	                        warningMarkerArr.pop();
	                    }
	                }
	                flag ? warningMarkerArr = tempArr.concat(warningMarkerArr) : warningMarkerArr = warningMarkerArr.concat(tempArr);
	                map.clearMap();
	                warningMarkerArr.forEach(function (item) {
	                    var lnglat = new AMap.LngLat(item.lng, item.lat);
	                    opts.position = lnglat;
	                    var marker = new AMap.Marker(opts);
	                    marker.id = item.locationID;
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
	                _this.clearArbitrary();
	                map.plugin(["AMap.MouseTool"], function () {
	                    drawTool = new AMap.MouseTool(map);
	                    switch (drawType) {
	                        case 'drawCircle':
	                            drawTool.circle();
	                            break;
	                        case 'drawRectangle':
	                            drawTool.rectangle();
	                            break;
	                        case 'drawArbitrary':
	                            _this.arbitraryFunc();
	                            break;
	                        case 'drawClear':
	                            _this.drawClear();
	                            return;
	                        default:
	                            return;
	                    }
	                    if (addOverlayEvt) {
	                        AMap.event.removeListener(addOverlayEvt);
	                        addOverlayEvt = null;
	                    }
	                    addOverlayEvt = AMap.event.addListener(drawTool, 'draw', function (e) {
	                        // console.log(e) // {type: String, obj: Object}
	                        var _overlay = e.obj;
	                        var tempPicked = [];
	                        if (drawType == 'drawCircle' || drawType == 'drawRectangle') {
	                            for (var m = 0; m < markerArr.length; m++) {
	                                if ($.inArray(markerArr[m].id, markerPickedIdArr) == -1 && _overlay.contains(markerArr[m].getPosition())) {
	                                    markerPickedIdArr.push(markerArr[m].id);
	                                    _this.iconPicked(markerArr[m]);
	                                    tempPicked.push(markerArr[m]);
	                                }
	                            }
	                            // 列表勾选
	                            yisaTree.check(markerPickedIdArr);
	                            if (tempPicked.length == 0) {
	                                drawTool.close(true);
	                                alert('未选择任何标注点');
	                            } else {
	                                vectorArr.push(drawTool);
	                            }
	                            map.remove(e.obj);
	                        }
	                        if (drawType == 'drawArbitrary') {
	                            // console.log(_overlay.getPath())
	                            // let tempArr = [[118.683928, 36.865883], [118.743323, 36.86451], [118.701095, 36.852973], [118.667449, 36.861488]]
	                            // _overlay.setPath(tempArr)
	                            console.log('绘制完成');
	                        }

	                        $('#drawManager').find('.current').removeClass('current');
	                        $('#drawDefault').addClass('current');
	                        _this.drawClose();
	                    });
	                });
	            },
	            /**
	             * Arbitrary 自由绘制函数
	             * */
	            arbitraryFunc: function arbitraryFunc() {
	                var _this = this;
	                map.setStatus({
	                    dragEnable: false
	                });
	                var moveEvt = null;
	                var tempArr = [];
	                var _polyline = new AMap.Polyline({
	                    map: map,
	                    strokeWeight: 2,
	                    strokeColor: '#4169D3',
	                    fillColor: '#99FFCC',
	                    bubble: true
	                });
	                var _polygon = new AMap.Polygon({
	                    map: map,
	                    strokeWeight: 2,
	                    strokeColor: '#4169D3',
	                    fillColor: '#99FFCC',
	                    fillOpacity: 0.6,
	                    bubble: true
	                });

	                _this._arbitraryDownEvt = AMap.event.addListener(map, 'mousedown', function (e) {
	                    _this._markerEvent = false;
	                    tempArr.push(e.lnglat);

	                    moveEvt = AMap.event.addListener(map, 'mousemove', function (evt) {
	                        tempArr.push(evt.lnglat);
	                        _polyline.setPath(tempArr);
	                    });
	                });
	                var markerArrEvt = [];
	                markerArr.forEach(function (item, index) {
	                    item.on('mouseup', function (e) {
	                        if (!moveEvt) {
	                            return false;
	                        } else {
	                            map.remove(_polyline);
	                            _polyline = null;
	                            AMap.event.removeListener(moveEvt);
	                            moveEvt = null;
	                        }
	                        tempArr.push(e.lnglat);
	                        _polygon.setPath(tempArr);

	                        setTimeout(function () {
	                            // 判断
	                            var _overlay = _polygon;
	                            var tempPicked = [];
	                            for (var m = 0; m < markerArr.length; m++) {
	                                if ($.inArray(markerArr[m].id, markerPickedIdArr) == -1 && _overlay.contains(markerArr[m].getPosition())) {
	                                    markerPickedIdArr.push(markerArr[m].id);
	                                    _this.iconPicked(markerArr[m]);
	                                    tempPicked.push(markerArr[m]);
	                                }
	                            }
	                            // 列表勾选
	                            yisaTree.check(markerPickedIdArr);
	                            if (tempPicked.length == 0) {
	                                alert('未选择任何标注点');
	                                map.remove(_polygon);
	                            } else {
	                                vectorArr.push(_polygon);
	                            }
	                            map.remove(_polygon);
	                            $('#drawManager').find('.current').removeClass('current');
	                            $('#drawDefault').addClass('current');
	                            _this.drawClose();

	                            // 关闭事件监听
	                            AMap.event.removeListener(_this._arbitraryDownEvt);
	                            AMap.event.removeListener(_this._arbitraryUpEvt);
	                            _this._arbitraryDownEvt = null;
	                            _this._arbitraryUpEvt = null;
	                            map.setStatus({
	                                dragEnable: true
	                            });
	                            _this._markerEvent = true;
	                        }, 200);
	                    });
	                    /**
	                    markerArrEvt.push(
	                      AMap.addListener(item, 'mouseup', function (e) {
	                        console.log('marker的鼠标抬起动作')
	                        if (moveEvt) {
	                          map.remove(_polyline)
	                          _polyline = null
	                          AMap.event.removeListener(moveEvt)
	                          moveEvt = null
	                        }
	                        tempArr.push(e.lnglat)
	                        _polygon.setPath(tempArr)
	                          setTimeout(function () {
	                          // 判断
	                          let _overlay = _polygon
	                          let tempPicked = []
	                          for (let m = 0; m < markerArr.length; m++) {
	                            if ($.inArray(markerArr[m].id, markerPickedIdArr) == -1 && _overlay.contains(markerArr[m].getPosition())) {
	                              markerPickedIdArr.push(markerArr[m].id)
	                              _this.iconPicked(markerArr[m])
	                              tempPicked.push(markerArr[m])
	                            }
	                          }
	                          // 列表勾选
	                          yisaTree.check(markerPickedIdArr)
	                          if (tempPicked.length == 0) {
	                            alert('未选择任何标注点')
	                            map.remove(_polygon)
	                          } else {
	                            vectorArr.push(_polygon)
	                          }
	                          map.remove(_polygon)
	                          $('#drawManager').find('.current').removeClass('current')
	                          $('#drawDefault').addClass('current')
	                          _this.drawClose()
	                            // 关闭事件监听
	                          AMap.event.removeListener(_this._arbitraryDownEvt)
	                          AMap.event.removeListener(_this._arbitraryUpEvt)
	                          // markerArr.forEach((item, index) => {
	                          //   AMap.event.removeListener(markerArrEvt[index])
	                          //   markerArrEvt[index] = null
	                          // })
	                          _this._arbitraryDownEvt = null
	                          _this._arbitraryUpEvt = null
	                          map.setStatus({
	                            dragEnable: true
	                          })
	                          _this._markerEvent = true
	                        }, 200)
	                      })
	                    )
	                     */
	                });
	                _this._arbitraryUpEvt = AMap.event.addListener(map, 'mouseup', function (e) {
	                    if (moveEvt) {
	                        map.remove(_polyline);
	                        _polyline = null;
	                        AMap.event.removeListener(moveEvt);
	                        moveEvt = null;
	                    }
	                    tempArr.push(e.lnglat);
	                    _polygon.setPath(tempArr);

	                    setTimeout(function () {
	                        // 判断
	                        var _overlay = _polygon;
	                        var tempPicked = [];
	                        for (var m = 0; m < markerArr.length; m++) {
	                            if ($.inArray(markerArr[m].id, markerPickedIdArr) == -1 && _overlay.contains(markerArr[m].getPosition())) {
	                                markerPickedIdArr.push(markerArr[m].id);
	                                _this.iconPicked(markerArr[m]);
	                                tempPicked.push(markerArr[m]);
	                            }
	                        }
	                        // 列表勾选
	                        yisaTree.check(markerPickedIdArr);
	                        if (tempPicked.length == 0) {
	                            alert('未选择任何标注点');
	                            map.remove(_polygon);
	                        } else {
	                            vectorArr.push(_polygon);
	                        }
	                        map.remove(_polygon);
	                        $('#drawManager').find('.current').removeClass('current');
	                        $('#drawDefault').addClass('current');
	                        _this.drawClose();

	                        // 关闭事件监听
	                        AMap.event.removeListener(_this._arbitraryDownEvt);
	                        AMap.event.removeListener(_this._arbitraryUpEvt);
	                        _this._arbitraryDownEvt = null;
	                        _this._arbitraryUpEvt = null;
	                        map.setStatus({
	                            dragEnable: true
	                        });
	                        _this._markerEvent = true;
	                    }, 200);
	                });
	            },
	            /**
	             * 清除自由绘制函数的事件监听
	             * */
	            clearArbitrary: function clearArbitrary() {
	                var _this = this;
	                if (_this._arbitraryDownEvt) {
	                    AMap.event.removeListener(_this._arbitraryDownEvt);
	                    _this._arbitraryDownEvt = null;
	                }
	                if (_this._arbitraryUpEvt) {
	                    AMap.event.removeListener(_this._arbitraryUpEvt);
	                    _this._arbitraryUpEvt = null;
	                }
	                map.setStatus({
	                    dragEnable: true
	                });
	            },
	            /*轨迹重现：绘制线路 */
	            drawLine: function drawLine(points, c, id) {
	                if (typeof points[0] == 'string') {
	                    points = points.map(function (item, v) {
	                        return new AMap.LngLat(item.split(',')[0], item.split(',')[1]);
	                    });
	                }
	                var opts = {
	                    map: map,
	                    path: points,
	                    id: id,
	                    strokeColor: c,
	                    strokeWeight: 5,
	                    strokeOpacity: 1
	                };
	                if (c == 'red') {
	                    Object.assign(opts, {
	                        strokeWeight: 6
	                    });
	                } else if (c == 'blue') {
	                    Object.assign(opts, {
	                        strokeStyle: 'dashed'
	                    });
	                }
	                var _polyline = new AMap.Polyline(opts);
	            },
	            /**
	             * @param point 每组车牌号的point数组
	             * @param c     颜色
	             * @param count 车牌号的索引值
	             * */
	            drawDriving: function drawDriving(point, c, count) {
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
	                                allPoints.push(new AMap.LngLat(points[i][0], points[i][1]));
	                                allPoints.push(new AMap.LngLat(points[i + 1][0], points[i + 1][1]));
	                            } else {
	                                var steps = res.result.routes[0].steps;
	                                var path = '';
	                                for (var _i2 = 0; _i2 < steps.length; _i2++) {
	                                    path += steps[_i2].path;
	                                }
	                                var pathArr = path.slice(0, -1).split(';');
	                                for (var _i3 = 0; _i3 < pathArr.length; _i3++) {
	                                    allPoints.push(new AMap.LngLat(pathArr[_i3].split(',')[0], pathArr[_i3].split(',')[1]));
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
	            /**
	             * 运行轨迹
	             * @param array paths 所有的点 array
	             * @param string car   车的颜色颜色
	             * @param stop [0,1]  是否暂停播放
	             * */
	            runCar: function runCar(paths, car, stop) {
	                if (typeof paths[0] == 'string') {
	                    paths = paths.map(function (item, v) {
	                        return new AMap.LngLat(item.split(',')[0], item.split(',')[1]);
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
	                            var opts = {};
	                            opts.icon = staticsUrl + '/images/map/' + car + '.png';
	                            var lnglat = paths[0];
	                            opts.position = lnglat;
	                            opts.map = map;
	                            if (lnglat) {
	                                carMarker = new AMap.Marker(opts);
	                            }
	                        } else {
	                            var icon = void 0;
	                            icon = staticsUrl + '/images/map/' + car + '.png';
	                            carMarker.setIcon(icon);
	                        }
	                        map.setCenter(paths[0]);
	                        // map.setZoom(16)
	                        carMarker.moveAlong(paths, 1000);
	                    }
	                }
	            },
	            /**
	             * 运行轨迹
	             * 驾车路线
	             * 步行路线
	             * 骑行路线
	             * 公交路线
	             **/
	            runRoute: function runRoute(path, lineColor, type, callback) {
	                var _this = this;
	                var runing = '';
	                var transOptions = {
	                    map: map,
	                    city: '青岛市',
	                    autoFitView: true,
	                    showTraffic: false,
	                    hideMarkers: true
	                };
	                var opt = {
	                    waypoints: path[1].slice().split(',')
	                };
	                var pushArr = []; //经过点
	                for (var i = 1; i < path.length - 1; i++) {
	                    pushArr.push(path[i].slice().split(','));
	                }
	                var moveArr = [path[0]]; //返回的路线
	                //只有驾车和货车有途径点
	                switch (type) {
	                    case 'Driving':
	                        AMap.service('AMap.Driving', function () {
	                            //回调函数
	                            runing = new AMap.Driving(transOptions);
	                            runing.search(path[0].slice().split(','), path[path.length - 1].slice().split(','), { waypoints: pushArr }, function (status, result) {
	                                $.each(result.routes[0].steps, function (i, value) {
	                                    $.each(value.path, function (j, val) {
	                                        moveArr.push(val.lng + ',' + val.lat);
	                                    });
	                                });
	                                moveArr.push(path[path.length - 1]);
	                                _this.drawLine(moveArr, lineColor);
	                                callback(moveArr);
	                            });
	                        });
	                        break;
	                    case 'Walking':
	                        AMap.service('AMap.Walking', function () {
	                            //回调函数
	                            runing = new AMap.Walking(transOptions);
	                            runing.search(path[0].slice().split(','), path[path.length - 1].slice().split(','), function (status, result) {
	                                $.each(result.routes[0].steps, function (i, value) {
	                                    $.each(value.path, function (j, val) {
	                                        moveArr.push(val.lng + ',' + val.lat);
	                                    });
	                                });
	                                moveArr.push(path[path.length - 1]);
	                                _this.drawLine(moveArr, lineColor);
	                                callback(moveArr);
	                            });
	                        });
	                        break;
	                    default:
	                        alert('路线规划类型错误！');
	                }
	            },

	            /* 关闭绘制 */
	            drawClose: function drawClose() {
	                if (drawTool) {
	                    // if (addOverlayEvt) {
	                    //   drawTool.removeEventListener(addOverlayEvt)
	                    // }
	                    drawTool.close(false);
	                    drawTool = null;
	                }
	            },
	            /* 清除绘制，清除绘制选中的标注点的效果 */
	            drawClear: function drawClear() {
	                var _this = this;
	                if (vectorArr.length > 0) {
	                    for (var v = 0; v < vectorArr.length; v++) {
	                        if (vectorArr[v].CLASS_NAME == 'AMap.MouseTool') {
	                            vectorArr[v].close(true);
	                        } else {
	                            map.remove(vectorArr[v]);
	                        }
	                    }
	                    vectorArr = [];
	                }
	                if (markerPickedIdArr.length > 0) {
	                    for (var m = 0; m < markerArr.length; m++) {
	                        if ($.inArray(markerArr[m].id, markerPickedIdArr) != -1) {
	                            _this.iconRecover(markerArr[m]);
	                            // 单选取消勾选
	                            // yisaTree.checkOne(markerArr[m].id, false)
	                        }
	                    }
	                    markerPickedIdArr = [];
	                    // 列表勾选
	                    yisaTree.check(markerPickedIdArr);
	                }
	            },
	            /* 判断是否在圆圈内 */
	            inCircle: function inCircle(center, radius, lngLat) {},
	            /* 判断是否在矩形内 */
	            inRect: function inRect(bounds, lngLat) {},
	            /* 标注点被选中后的样式 */
	            iconPicked: function iconPicked(m) {
	                var iconPic = void 0;
	                var _size = void 0,
	                    _offset = void 0;
	                if (m.type && m.type == 'stop-icon') {
	                    _size = new AMap.Size(14, 14);
	                    _offset = new AMap.Pixel(3, 3);
	                } else {
	                    _size = new AMap.Size(24, 23);
	                    _offset = new AMap.Pixel(1, 0);
	                }
	                iconPic = new AMap.Icon({
	                    size: _size,
	                    imageOffset: _offset,
	                    image: staticsUrl + '/images/map/' + m.type + 'h.png'
	                });
	                m.setIcon(iconPic);
	            },
	            /* 恢复标注点样式 */
	            iconRecover: function iconRecover(m) {
	                var icon = void 0;
	                var _size = void 0,
	                    _offset = void 0;
	                if (m.type && m.type == 'stop-icon') {
	                    _size = new AMap.Size(14, 14);
	                    _offset = new AMap.Pixel(3, 3);
	                } else {
	                    _size = new AMap.Size(24, 23);
	                    _offset = new AMap.Pixel(1, 0);
	                }
	                icon = new AMap.Icon({
	                    size: _size,
	                    imageOffset: _offset,
	                    image: staticsUrl + '/images/map/' + m.type + '.png'
	                });
	                m.setIcon(icon);
	            },
	            reLoadViewMarker: function reLoadViewMarker() {
	                var _this = this;
	                var _currentZoom = map.getZoom();
	                // 没有树形结构的时候
	                if (typeof yisaTree != 'undefined' && yisaTree.treeObj != '' && _currentZoom < 13) {
	                    //应该缩放前全部清除，暂时做法，判断zoom级别后再进行是否清除选择
	                    // //删除所有点图标
	                    if (markerArr.length > 0) {
	                        map.remove(markerArr);
	                        markerArr = [];
	                    }
	                    if (labels.length == 0) {
	                        _this.loadCity();
	                        _this._viewFirst = true;
	                        $('#map-pannel').hide();
	                        // console.log(_this._navi)
	                        // _this._navi.setOffset(new AMap.Pixel(15, 15))
	                    }
	                } else {
	                    if (labels.length > 0) {
	                        map.remove(labels);
	                        labels = [];
	                        // $('#map-pannel').show();
	                    }
	                    //移除行政区边界，防止鼠标在圆圈上缩放引起的bug
	                    if (boundaryOverlayArr.length > 0) {
	                        for (var b = 0; b < boundaryOverlayArr.length; b++) {
	                            map.remove(boundaryOverlayArr[b]);
	                        }
	                        boundaryOverlayArr = [];
	                    }
	                    _this.showViewMarker();
	                }
	            },
	            /**
	             *  显示地图可视区域内的点
	             *  */
	            showViewMarker: function showViewMarker() {
	                var _this = this;
	                var loadType = _this._markerLoadType || 'all';
	                if (typeof yisaTree != 'undefined' && yisaTree.treeObj != '' && map.getZoom() < 13) {
	                    _this.loadCity();
	                    // 隐藏设备图标说明面板
	                    $('#map-pannel').hide();
	                    // console.log(_this._navi)
	                    // _this._navi.setOffset(new AMap.Pixel(15, 15))
	                } else {
	                    // 显示设备图标说明面板
	                    $('#map-pannel').show();
	                    // _this._navi.setOffset(new AMap.Pixel(15, 55))
	                    if (_this._viewFirst) {
	                        map.panBy(-120, 0);
	                        _this._viewFirst = false;
	                    }
	                    var _bounds = map.getBounds(),
	                        _sw = _bounds.southwest.lng + ',' + _bounds.southwest.lat,
	                        _ne = _bounds.northeast.lng + ',' + _bounds.northeast.lat;
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
	            //arr是一个包含point的数组,每个point包含纬度,经度,地址id,卡口名称
	            peerAddMarker: function peerAddMarker(arr) {},
	            peerShowViewMarker: function peerShowViewMarker(arr) {},
	            /* 定义窗体信息 */
	            infoWindow: function infoWindow(lng, lat, title, content, w, h) {
	                var _this = this;
	                var width = 500,
	                    height = 250;
	                var infowindowOpts = {};
	                // if (w && h) {
	                //   infowindowOpts.size = new AMap.Size(w, h)
	                // } else {
	                //   infowindowOpts.size = new AMap.Size(width || 0, height || 0)
	                // }
	                // infowindowOpts.offset = new AMap.Pixel(0, 0)
	                infowindowOpts.position = new AMap.LngLat(lng, lat);
	                infowindowOpts.autoMove = true;
	                // infowindowOpts.isCustom = true
	                // infowindowOpts.content = createInfoWindow(title, content)
	                infowindowOpts.content = content;
	                infowindow = new AMap.InfoWindow(infowindowOpts);
	                infowindow.open(map, new AMap.LngLat(lng, lat));
	                map.setCenter(new AMap.LngLat(lng, lat));
	            },
	            closeWindow: function closeWindow() {
	                map.clearInfoWindow();
	                if (map && infowindow) {
	                    map.clearInfoWindow();
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
	                    map.clearInfoWindow();
	                }
	                var title = '\u8F66\u8F86\u544A\u8B66\uFF08<span>' + data.deployType + '</span>\uFF09';
	                var content = '';
	                if (aom) {
	                    content = '\n                      <div class="winInfo-txt aom-winInfo">\n                          <dl>\n                              <dt>\u624B\u673A\u4FE1\u606F</dt>\n                              <dd><span>\u53F7\u7801\u7C7B\u578B\uFF1A</span>' + data.numberType + '</dd>\n                              <dd><span>\u5E03\u63A7\u53F7\u7801\uFF1A</span>' + data.number + '</dd>\n                          </dl>\n                          <dl>\n                              <dt>\u544A\u8B66\u4FE1\u606F</dt>\n                              <dd><span>\u51FA\u73B0\u5730\u70B9\uFF1A</span>' + data.locationName + '</dd>\n                              <dd><span>\u51FA\u73B0\u65F6\u95F4\uFF1A</span>' + data.captureTime + '</dd>\n                              <dd style="display: none"><span>\u884C\u9A76\u65B9\u5411\uFF1A</span>' + data.directionName + '</dd>\n                          </dl>\n                          <dl>\n                              <dt>\u5E03\u63A7\u5355\u4FE1\u606F</dt>\n                              <dd><span>\u7533\u8BF7\u4EBA\uFF1A</span>' + data.applyUser + '</dd>\n                              <dd><span>\u7535\u8BDD\uFF1A</span>' + data.applyPhone + '</dd>\n                              <dd><span>\u5E03\u63A7\u5355\u53F7\uFF1A</span>' + data.deploySheetID + '</dd>\n                              <dd><span>\u5E03\u63A7\u7C7B\u578B\uFF1A</span>' + data.deployType + '</dd>\n                              <dd><span>\u5E03\u63A7\u539F\u56E0\uFF1A</span>' + data.deployReason + '</dd>\n                          </dl>                    \n                      </div>\n                      ';
	                } else {
	                    content = '\n                  <div class="winInfo-img">\n                      <img src="' + data.bigPic + '" atl="">\n                  </div>\n                  <div class="winInfo-txt">\n                      <dl>\n                          <dt>\u8F66\u8F86\u4FE1\u606F</dt>\n                          <dd><span>\u8F66\u724C\u53F7\uFF1A</span>' + data.plate + '</dd>\n                          <dd><span>\u8F66\u8EAB\u989C\u8272\uFF1A</span>' + data.colorName + '</dd>\n                          <dd><span>\u8F66\u578B\uFF1A</span>' + data.yearName + '</dd>\n                      </dl>\n                      <dl>\n                          <dt>\u544A\u8B66\u4FE1\u606F</dt>\n                          <dd><span>\u53D1\u73B0\u5730\u70B9\uFF1A</span>' + data.locationName + '</dd>\n                          <dd><span>\u53D1\u73B0\u65F6\u95F4\uFF1A</span>' + data.captureTime + '</dd>\n                          <dd><span>\u884C\u9A76\u65B9\u5411\uFF1A</span>' + data.directionName + '</dd>\n                          <dd><span>\u8F66\u901F\uFF1A</span>' + data.speed + '</dd>\n                      </dl>\n                      <dl>\n                          <dt>\u5E03\u63A7\u5355\u4FE1\u606F</dt>\n                          <dd><span>\u7533\u8BF7\u4EBA\uFF1A</span>' + data.applyUser + '</dd>\n                          <dd><span>\u7535\u8BDD\uFF1A</span>' + data.applyPhone + '</dd>\n                          <dd><span>\u5E03\u63A7\u5355\u53F7\uFF1A</span>' + data.deploySheetID + '</dd>\n                          <dd><span>\u5E03\u63A7\u7C7B\u578B\uFF1A</span>' + data.deployType + '</dd>\n                          <dd><span>\u5E03\u63A7\u539F\u56E0\uFF1A</span>' + data.deployReason + '</dd>\n                      </dl>\n                  </div>\n                  ';
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
	                    map.remove(markerArr);
	                    markerArr = [];
	                }
	                var lnglat = void 0;
	                if (lng && lat) {
	                    lnglat = new AMap.LngLat(lng, lat);
	                    map.setCenter(lnglat);
	                    map.setZoom(15);
	                } else {
	                    lnglat = options.center;
	                    return;
	                }
	                var opts = {};
	                opts.icon = staticsUrl + '/images/map/stop-markerh.png';
	                // opts.icon = new AMap.Icon({
	                //   size: new AMap.Size(18, 23),
	                //   imageOffset: new AMap.Pixel(0, 0),
	                //   image: `${staticsUrl}/images/map/stop-markerh.png`
	                // })
	                opts.position = lnglat;
	                opts.map = map;
	                marker = new AMap.Marker(opts);
	                markerArr.push(marker);
	            },
	            /**
	             * 应用：地图map2搜索结果页面
	             * 定位
	             * */
	            fixedPosition2: function fixedPosition2(lng, lat) {
	                if (markerArr2) {
	                    map2.remove(markerArr2);
	                    markerArr2 = [];
	                }
	                var lnglat = void 0;
	                if (lng && lat) {
	                    lnglat = new AMap.LngLat(lng, lat);
	                    map2.setCenter(lnglat);
	                    map2.setZoom(15);
	                } else {
	                    lnglat = options2.center;
	                    return;
	                }
	                var opts = {};
	                opts.icon = staticsUrl + '/images/map/stop-markerh.png';
	                // opts.icon = new AMap.Icon({
	                //   size: new AMap.Size(18, 23),
	                //   imageOffset: new AMap.Pixel(0, 0),
	                //   image: `${staticsUrl}/images/map/stop-markerh.png`
	                // })
	                opts.position = lnglat;
	                opts.map = map2;
	                marker2 = new AMap.Marker(opts);
	                markerArr2.push(marker2);
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
	                    map.clearMap();
	                }
	                var _lnglat = void 0,
	                    _zoom = void 0;
	                if (parseInt(lng) && parseInt(lat)) {
	                    _lnglat = new AMap.LngLat(lng, lat);
	                } else {
	                    _lnglat = options.center;
	                }
	                if (zoom) {
	                    _zoom = zoom;
	                } else {
	                    _zoom = options.zoom;
	                }
	                map.setCenter(_lnglat);
	                setTimeout(function () {
	                    map.setZoom(_zoom);
	                }, 300);
	            },
	            /**
	             * 设置地图map2中心位置，及缩放级别
	             * 无参数返回初始状态
	             * */
	            setPosition2: function setPosition2(lng, lat, zoom) {
	                if (!lng && !lat && !zoom) {
	                    map2.clearMap();
	                }
	                var _lnglat = void 0,
	                    _zoom = void 0;
	                if (parseInt(lng) && parseInt(lat)) {
	                    _lnglat = new AMap.LngLat(lng, lat);
	                } else {
	                    _lnglat = options.center;
	                }
	                if (zoom) {
	                    _zoom = zoom;
	                } else {
	                    _zoom = options.zoom;
	                }
	                map2.setCenter(_lnglat);
	                setTimeout(function () {
	                    map2.setZoom(_zoom);
	                }, 300);
	            },
	            setPositionWithInfo: function setPositionWithInfo(lng, lat, zoom, text) {
	                var _this = this;
	                if (!lng && !lat && !zoom) {
	                    return true;
	                }
	                var _lnglat = void 0,
	                    _zoom = void 0;
	                if (parseInt(lng) && parseInt(lat)) {
	                    _lnglat = new AMap.LngLat(lng, lat);
	                } else {
	                    return true;
	                }
	                if (zoom) {
	                    _zoom = zoom;
	                } else {
	                    _zoom = options.zoom;
	                }
	                if (!_this._infoWindow) {
	                    _this._infoWindow = new AMap.InfoWindow({
	                        content: '',
	                        offset: new AMap.Pixel(0, -36)
	                    });
	                } else {
	                    _this._infoWindow.close();
	                    map.setCenter(_lnglat);
	                    setTimeout(function () {
	                        map.setZoom(_zoom);
	                        _this._infoWindow.setContent(text);
	                        _this._infoWindow.open(map, _lnglat);
	                    }, 300);
	                }
	            },
	            setlocation: function setlocation(lng, lat, zoom, text) {
	                var _this = this;
	                if (!lng && !lat && !zoom) {
	                    return true;
	                }
	                var _lnglat = void 0,
	                    _zoom = void 0;
	                if (parseInt(lng) && parseInt(lat)) {
	                    _lnglat = new AMap.LngLat(lng, lat);
	                } else {
	                    return true;
	                }
	                if (zoom) {
	                    _zoom = zoom;
	                } else {
	                    _zoom = options.zoom;
	                }
	                if (!_this._infoWindow) {
	                    _this._infoWindow = new AMap.InfoWindow({
	                        content: '',
	                        offset: new AMap.Pixel(0, -36)
	                    });
	                } else {
	                    _this._infoWindow.close();
	                    map.setCenter(_lnglat);
	                    setTimeout(function () {
	                        map.setZoom(_zoom);
	                        _this._infoWindow.setContent(text);
	                        _this._infoWindow.open(map, _lnglat);
	                    }, 300);
	                }
	            },
	            closeInfoWindow: function closeInfoWindow() {
	                var _this = this;
	                if (_this._infoWindow) {
	                    _this._infoWindow.close();
	                }
	            },
	            /**
	             * 加载区县级的点，以实现类似点标注的效果，点击后改变地图缩放等级，加载可视区域的点
	             * labelArr: Array
	             * {text,lng,lat,count}
	             * */
	            addLabels: function addLabels(labelArr) {
	                var _this = this;
	                var opts = {
	                    map: map,
	                    offset: new AMap.Pixel(0, 0),
	                    draggable: false,
	                    icon: "http://" + mapConfig.mapApiHost + "/theme/v1.3/mark_b.png"
	                };

	                var _loop2 = function _loop2(i) {
	                    var labelOpts = Object.assign({}, opts, {
	                        position: new AMap.LngLat(labelArr[i].lng, labelArr[i].lat),
	                        content: '<div class="marker-label-city"><span>' + labelArr[i].text + '</span><span>' + labelArr[i].count + '</span></div>'
	                    });
	                    var label = new AMap.Marker(labelOpts);
	                    labels.push(label);
	                    label.on('mouseover', function (e) {
	                        _this.cityBoundary(labelArr[i].text);
	                    });
	                    label.on('mouseout', function (e) {
	                        if (boundaryOverlayArr.length > 0) {
	                            for (var b = 0; b < boundaryOverlayArr.length; b++) {
	                                map.remove(boundaryOverlayArr[b]);
	                            }
	                            boundaryOverlayArr = [];
	                        } else {
	                            setTimeout(function () {
	                                for (var _b = 0; _b < boundaryOverlayArr.length; _b++) {
	                                    map.remove(boundaryOverlayArr[_b]);
	                                }
	                                boundaryOverlayArr = [];
	                            }, boundaryLoodTime + 50);
	                        }
	                    });
	                    label.on('click', function (e) {
	                        var _thisLabel = e.target;
	                        var zoomAfterClick = 13;
	                        // 移除行政区边界
	                        if (boundaryOverlayArr.length > 0) {
	                            for (var b = 0; b < boundaryOverlayArr.length; b++) {
	                                map.remove(boundaryOverlayArr[b]);
	                            }
	                            boundaryOverlayArr = [];
	                        } else {
	                            setTimeout(function () {
	                                for (var _b2 = 0; _b2 < boundaryOverlayArr.length; _b2++) {
	                                    map.remove(boundaryOverlayArr[_b2]);
	                                }
	                                boundaryOverlayArr = [];
	                            }, boundaryLoodTime + 50);
	                        }
	                        map.setCenter(_thisLabel.getPosition());
	                        setTimeout(function () {
	                            map.setZoom(zoomAfterClick);
	                        }, 500);
	                        _this.reLoadViewMarker();
	                    });
	                    $('.imap-overlay-pane .imap-clickable').addClass('label-city');
	                };

	                for (var i = 0; i < labelArr.length; i++) {
	                    _loop2(i);
	                }
	            },
	            /**
	             * 获取城市边界
	             * 省 市 区(县)
	             * */
	            cityBoundary: function cityBoundary(city) {
	                var startTime = new Date().getTime();
	                var endTime = 0;
	                // 黄岛不显示 区域地图
	                if (map && sysRegion != '370211') {
	                    var district = null;
	                    AMap.service(['AMap.DistrictSearch'], function () {
	                        var opts = {
	                            subdistrict: 1,
	                            extensions: 'all',
	                            level: 'district'
	                            // 实例化 DistrictSearch
	                        };district = new AMap.DistrictSearch(opts);
	                        // district.setLevel('district')
	                        // 行政区查询
	                        district.search(city, function (status, result) {
	                            if (status === 'no_data' || status === 'error') {
	                                console.log('无法获取行政区域边界');
	                                return false;
	                            }
	                            var bounds = result.districtList[0].boundaries;
	                            var polygons = [];
	                            if (bounds) {
	                                for (var i = 0; i < bounds.length; i++) {
	                                    // 生成行政区划 polygon
	                                    var polygon = new AMap.Polygon({
	                                        map: map,
	                                        strokeWeight: 1,
	                                        path: bounds[i],
	                                        fillOpacity: 0.7,
	                                        fillColor: '#ccf3ff',
	                                        strokeColor: '#cc66cc'
	                                    });
	                                    boundaryOverlayArr.push(polygon);
	                                }
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
	                    if (typeof yisaTree !== 'undefined' && yisaTree.treeObj != '') {
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
	                // let lnglat = new AMap.LngLat(data[0].lng, data[0].lat)
	                // map.setCenter(lnglat)
	                return markerPickedIdArr = _idArr;
	            },
	            /**
	             * 清除地图上的所有点*/
	            clearAllMarker: function clearAllMarker() {
	                map.remove(markerArr);
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
	            resetMap: function resetMap() {
	                map = null;
	            },
	            /**
	             * 海量点
	             * */
	            massMarkerFun: function massMarkerFun(data, cb) {
	                var _this = this;
	                // 窗体信息部分
	                _this.massMarkerInfoWindow = new AMap.InfoWindow({
	                    content: '',
	                    offset: new AMap.Pixel(176, 230),
	                    isCustom: true
	                });
	                // 点位部分
	                var massMarkerArr = [];
	                var iconOpts = {
	                    anchor: new AMap.Pixel(0, 0),
	                    size: new AMap.Size(30, 30)
	                };
	                var iconStyle = [];
	                for (var icon = 1; icon <= 15; icon++) {
	                    iconStyle.push(Object.assign({}, iconOpts, {
	                        url: staticsUrl + '/images/map/r_a_' + icon + '.png'
	                    }));
	                }
	                // console.log(iconStyle)
	                for (var i = 0; i < data.length; i++) {
	                    var item = data[i];
	                    var styleIndex = 0;
	                    if (isNaN(parseInt(item.categoryId))) {
	                        switch (item.categoryId) {
	                            case 'A':
	                                styleIndex = 9;
	                                break;
	                            case 'B':
	                                styleIndex = 10;
	                                break;
	                            case 'C':
	                                styleIndex = 11;
	                                break;
	                            case 'D':
	                                styleIndex = 12;
	                                break;
	                            case 'E':
	                                styleIndex = 13;
	                                break;
	                            case 'W':
	                                styleIndex = 14;
	                                break;
	                            default:
	                                break;
	                        }
	                    } else {
	                        styleIndex = parseInt(item.categoryId) - 1;
	                    }
	                    if (parseInt(item.lng) && parseInt(item.lat)) {
	                        var obj = {
	                            lnglat: [parseFloat(item.lng), parseFloat(item.lat)],
	                            style: styleIndex,
	                            location: item.location,
	                            locationId: item.locationId,
	                            equipId: item.equipId,
	                            equipMac: item.equipMac,
	                            equipType: item.equipType
	                            // opts.icon = `${staticsUrl}/images/map/r_a_${item.categoryId}.png`
	                        };massMarkerArr.push(obj);
	                    }
	                }
	                console.log(massMarkerArr);
	                var mass = new AMap.MassMarks(massMarkerArr, {
	                    cursor: 'pointer',
	                    style: iconStyle
	                });
	                // 监听mass
	                mass.on('mouseover', function (e) {
	                    // console.log(e) // e.data.lnglat
	                    _this.massMarkerInfoWindowFlag = true;
	                    var infoTemplate = '\n          <div class="realtime-audit-infowindow">\n              <div class="bg"></div>\n              <div class="title">' + e.data.location + '</div>\n              <ul>\n                  <li>\u8BBE\u5907\u7F16\u53F7\uFF1A' + e.data.equipId + '</li>\n                  <li>\u8BBE\u5907MAC\uFF1A' + e.data.equipMac + '</li>\n                  <li>\u7ECF\u5EA6\uFF1A' + e.data.lnglat.getLng() + '</li>\n                  <li>\u7EAC\u5EA6\uFF1A' + e.data.lnglat.getLat() + '</li>\n              </ul>\n          </div>\n        ';
	                    _this.massMarkerInfoWindow.setContent(infoTemplate);
	                    _this.massMarkerInfoWindow.open(map, e.data.lnglat);
	                    // cb(e.data.locationId, e.data.location)
	                }).on('mouseout', function (e) {
	                    _this.massMarkerInfoWindow.close();
	                }).on('click', function (e) {
	                    cb(e.data.locationId, e.data.location, e.data.equipType);
	                });
	                // 挂载到地图上
	                mass.setMap(map);
	            },
	            //数据考核加载海量点
	            assessmentmass: function assessmentmass(citys) {
	                var style = [{
	                    url: staticsUrl + '/images/map/audit.png',
	                    anchor: new AMap.Pixel(6, 6),
	                    size: new AMap.Size(19, 19)
	                }, {
	                    url: staticsUrl + '/images/map/audit2.png',
	                    anchor: new AMap.Pixel(6, 6),
	                    size: new AMap.Size(19, 19)
	                }];
	                var mass = new AMap.MassMarks(citys, {
	                    opacity: 1,
	                    zIndex: 111,
	                    cursor: 'pointer',
	                    style: style
	                });
	                var marker = void 0;
	                mass.on('mouseover', function (e) {
	                    marker = new AMap.Marker({ content: ' ', map: map });
	                    marker.setPosition(e.data.lnglat);
	                    marker.setLabel({ content: e.data.name });
	                });
	                mass.on('mouseout', function (e) {
	                    map.remove(marker);
	                });
	                mass.setMap(map);
	            },
	            assessmentmass2: function assessmentmass2(citys) {
	                var style = [{
	                    url: staticsUrl + '/images/map/audith.png',
	                    anchor: new AMap.Pixel(6, 6),
	                    size: new AMap.Size(19, 19)
	                }, {
	                    url: staticsUrl + '/images/map/audith2.png',
	                    anchor: new AMap.Pixel(6, 6),
	                    size: new AMap.Size(19, 19)
	                }];
	                var mass = new AMap.MassMarks(citys, {
	                    opacity: 1,
	                    zIndex: 111,
	                    cursor: 'pointer',
	                    style: style
	                });
	                var marker = void 0;
	                mass.on('mouseover', function (e) {
	                    marker = new AMap.Marker({ content: ' ', map: map });
	                    marker.setPosition(e.data.lnglat);
	                    marker.setLabel({ content: e.data.name });
	                });
	                mass.on('mouseout', function (e) {
	                    map.remove(marker);
	                });
	                mass.setMap(map);
	            },
	            /**
	             * 警务云图海量点
	             */
	            multipleMass: function multipleMass(cb) {
	                var _this = mapCtrl;
	                // 窗体信息
	                if (!_this._infoWindow) {
	                    _this._infoWindow = new AMap.InfoWindow({
	                        content: '',
	                        offset: new AMap.Pixel(12, 10)
	                    });
	                }
	                // 海量点
	                var iconStyle = [{
	                    url: staticsUrl + '/images/map/multiple_car.png',
	                    anchor: new AMap.Pixel(0, 0),
	                    size: new AMap.Size(30, 30)
	                }, {
	                    url: staticsUrl + '/images/map/multiple_aom.png',
	                    anchor: new AMap.Pixel(0, 0),
	                    size: new AMap.Size(30, 30)
	                }, {
	                    url: staticsUrl + '/images/map/multiple_face.png',
	                    anchor: new AMap.Pixel(0, 0),
	                    size: new AMap.Size(30, 30)
	                }];
	                _this._mutipleMass = new AMap.MassMarks([], {
	                    cursor: 'pointer',
	                    style: iconStyle
	                });
	                // _this._mutipleMass.on('mouseover', e => {
	                //   console.log('mouseover...')
	                // })
	                // _this._mutipleMass.on('mouseout', e => {
	                //   console.log('mouseout...')
	                // })
	                _this._mutipleMass.on('click', function (e) {
	                    // e.stopPropagation()
	                    map.setCenter(e.data.lnglat);
	                    setTimeout(function () {
	                        map.setZoom(14);
	                        _this._infoWindow.setContent(e.data.name);
	                        _this._infoWindow.open(map, e.data.lnglat);
	                    }, 500);
	                    cb(e.data);
	                });
	                _this._mutipleMass.setMap(map);
	            },
	            multipleMassSet: function multipleMassSet(arr) {
	                var _this = mapCtrl;
	                if (_this._mutipleMass) {
	                    var massMarkerArr = [];
	                    for (var i = 0, len = arr.length; i < len; i++) {
	                        var item = arr[i];
	                        if (parseInt(item.lng) && parseInt(item.lat)) {
	                            var styleIndex = 0;
	                            var thisType = '';
	                            // 1神眼 2手机围栏 3视频 4人脸 5app 6车辆库 7车联网 8网络围栏 9立体布控
	                            if (item.type == '1') {
	                                styleIndex = 0;
	                                thisType = 'car';
	                            } else if (item.type == '8') {
	                                styleIndex = 1;
	                                thisType = 'aom';
	                            } else if (item.type == '4') {
	                                styleIndex = 2;
	                                thisType = 'face';
	                            }
	                            massMarkerArr.push({
	                                lnglat: [parseFloat(item.lng), parseFloat(item.lat)],
	                                name: item.text,
	                                style: styleIndex,
	                                dataId: item.id,
	                                locationId: item.pid,
	                                type: thisType
	                            });
	                        }
	                    }
	                    _this._mutipleMass.setData(massMarkerArr);
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