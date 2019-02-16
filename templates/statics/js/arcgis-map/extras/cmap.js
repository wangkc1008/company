// arcgis 自定义方法实现  
// 此文件不会编译 请用ES5编写
define([
    "esri/map", "esri/SpatialReference", "esri/Color", "esri/graphic", "esri/InfoTemplate",
    "esri/layers/GraphicsLayer", "esri/layers/ArcGISTiledMapServiceLayer", "esri/layers/ArcGISDynamicMapServiceLayer",
    "esri/dijit/Scalebar", "esri/dijit/Popup", "extras/InfoWindow", "extras/PGISLayer", "extras/TMapLayer", "extras/BMapLayer",
    "esri/symbols/Font", "esri/symbols/PictureMarkerSymbol", "esri/symbols/TextSymbol", "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol",
    "esri/geometry/Point", "esri/geometry/Polyline", "esri/geometry/Polygon",
    "esri/toolbars/draw", "esri/toolbars/edit",
    "dojo/on", "dojo/dom-class", "dojo/dom-construct", "dojo/dom", "dojo/domReady!"
], function (
    Map, SpatialReference, Color, Graphic, InfoTemplate,
    GraphicsLayer, ArcGISTiledMapServiceLayer, ArcGISDynamicMapServiceLayer,
    Scalebar, Popup, InfoWindow, PGISLayer, TMapLayer, BMapLayer,
    Font, PictureMarkerSymbol, TextSymbol, SimpleFillSymbol, SimpleLineSymbol,
    Point, Polyline, Polygon,
    Draw, Edit,
    on, domClass, domConstruct, dom
) {
    /**
     * markerArr - 地图上所有点的marker集合 ， markerIdArr - 地图上所有点的id集合
     * markerPickedIdArr - 地图上所有被选中的点的id集合
     * drawTool - 绘制工具 , overlayArr - 绘制的图形集合
     * labels - label集合 , boundaryOverlayArr - 行政区域边界线集合，用于形成边界
     **/
    var map, mapPlace, marker, carMarker, markerArr = [], markerIdArr = [], markerPickedIdArr = [], drawTool = null, editTool = null,
        overlayArr = {}, dataCluster;
    var labels = [], label, boundaryOverlayArr = [];
    var warningMarkerArr = []; // 实时预警地图点集合
    var boundaryLoodTime = 0;
    var cityLayer; // 区县点图层
    var drawFillSymbol = new SimpleFillSymbol(
        SimpleFillSymbol.STYLE_SOLID,
        new SimpleLineSymbol(
            SimpleLineSymbol.STYLE_SOLID,
            new Color([65, 105, 211, 1]),
            2
        ),
        new Color([153, 255, 204, 0.6])
    ); // draw 样式
    var infoWindow = new InfoWindow({
        domNode: domConstruct.create('div', {class: 'myInfoWindow'}, dom.byId('map'))
    });
    var options = {
        // basemap: "streets",
        center: mapConfig.center,
        zoom: mapConfig.zoom,
        minZoom: mapConfig.minZoom,
        maxZoom: mapConfig.maxZoom,
        fadeOnZoom: true,
        sliderPosition: "top-right",
        logo: false,
        infoWindow: infoWindow
    }
    return {
        _ScaleNavi: true,// 是否启用比例尺和缩放按钮
        _mapEvent: true,   // 是否启用地图map事件，获取可视区域标注点
        _markerEvent: true,    // 是否启用标注点marker事件
        _scrollWheel: true,  // 是否启用鼠标缩放地图
        _dragged: true,  // 是否启用鼠标拖放地图
        _markerAll: [],
        _drivingAll: {},//所有车牌号行驶路线
        _onePick: false, // 地图只允许选择一个标注点
        _markerLoadType: '', // 地图标注点加载的类型  默认加载全部，'picked'只加载被选中的图标
        _navi: '',
        _viewFirst: true, // 是否是第一次加载可视的点，即从城市变为加载可视点
        /**
         * 初始化地图
         ***/
        initMap: function (elem) {
            var _this = this
            esri.config.defaults.io.corsDetection=false
            if (!map) {
                window.cmap = map = new Map(elem, options);
                if (arcBaseLayer === 'pgis') {
                    var pgisLayer = new PGISLayer('http://10.51.82.51:8000/GetSDDitu');
                    map.addLayer(pgisLayer);
                } else if (arcBaseLayer === 'tumeng') {
                    var tMapLayer = new TMapLayer('http://114.215.146.210:25003/v3/tile');
                    map.addLayer(tMapLayer);
                } else if (arcBaseLayer === 'baidu') {
                    var bMapLayer = new BMapLayer();
                    map.addLayer(bMapLayer);
                } else if (arcBaseLayer === 'custom') {
                    var tiledMapServiceLayer = new ArcGISTiledMapServiceLayer("http://192.168.18.125:7080/PBS/rest/services/MyPBSService1/MapServer");
                    map.addLayer(tiledMapServiceLayer, 2);
                    var dynamicMapServiceLayer = new ArcGISDynamicMapServiceLayer("http://192.168.18.125/ArcGIS/rest/services/working/MapServer");
                    map.addLayer(dynamicMapServiceLayer, 4);
                }
            } else if (!mapPlace) {
                //一车一档两个地图
                window.cmap = mapPlace = new Map(elem, options);
                // var tiledMapServiceLayer = new ArcGISTiledMapServiceLayer("http://192.168.18.125:7080/PBS/rest/services/MyPBSService1/MapServer");
                // mapPlace.addLayer(tiledMapServiceLayer, 2);
                // var dynamicMapServiceLayer = new ArcGISDynamicMapServiceLayer("http://192.168.18.125/ArcGIS/rest/services/working/MapServer");
                // mapPlace.addLayer(dynamicMapServiceLayer, 4);
            } else {
                return
            }

            cityLayer = new GraphicsLayer({id: 'cityLayer'});
            map.disableDoubleClickZoom();
            map.addLayer(cityLayer, 6);
            if (options.zoom < 12) {
                _this._viewFirst = true
            } else {
                _this._viewFirst = false
            }
            if (_this._mapEvent) {
                _this.reLoadViewMarker()
            }
            //缩放开始前全部清除，缩放结束后加载
            map.on('zoom-end', function (e) {
                if (e.level < 12) {
                    for (var i in overlayArr) {
                        overlayArr[i].hide()
                    }
                } else {
                    for (var i in overlayArr) {
                        !overlayArr[i].visible && overlayArr[i].show()
                    }
                }
                if (_this._mapEvent) {
                    _this.reLoadViewMarker()
                }
            })
            map.on('pan-end', function (e) {
                if (_this._mapEvent) {
                    _this.reLoadViewMarker()
                }
            })
            map.on('resize', function (e) {
                if (_this._mapEvent) {
                    _this.reLoadViewMarker()
                }
            })
            map.on('extent-change', function(e) {
                if (dojo.byId('textLayer')) {
                    dojo.byId('map_root').removeChild(dojo.byId('textLayer'))
                }
            })
            // 兼容性问题
            // 添加动态图层需要等加载完成执行
            // 添加其他已知地图的底图，在加载底图的时候已经load完成
            if (arcBaseLayer === 'custom') {
                map.on('load', function() {
                    // 点击事件 IE下CLICK事件不触发，改用判断按下鼠标左键
                    if (_this._markerEvent) {
                        map.graphics.on('mouse-down', function(e) {
                            e.stopPropagation();
                            if(e.button == 0) {
                                if(e.graphic.attributes.sort && e.graphic.attributes.sort === 'marker') {
                                    var _marker = e.graphic;
                                    if ($.inArray(_marker.attributes.id, markerPickedIdArr) == -1) {
                                        // 只允许地图选这一个标注点的时候
                                        if(_this._onePick) {
                                            for (var m = 0; m < markerArr.length; m++) {
                                                if (markerArr[m].attributes.id == markerPickedIdArr[0]) {
                                                    _this.iconRecover(markerArr[m])
                                                }
                                            }
                                            markerPickedIdArr = [];
                                        }
                                        markerPickedIdArr.push(_marker.attributes.id);
                                        _this.iconPicked(_marker);
                                        yisaTree.check(markerPickedIdArr);
                                    } else {
                                        markerPickedIdArr = markerPickedIdArr.filter(function (f) {
                                            return f != _marker.attributes.id
                                        });
                                        _this.iconRecover(_marker);
                                        yisaTree.check(markerPickedIdArr);
                                    }
                                } else if (e.graphic.attributes.sort && e.graphic.attributes.sort === 'oneMarker') {
                                    var attr = e.graphic.attributes;
                                    if (attr.con) {
                                        _this.infoWindow(attr.lng, attr.lat, '', attr.con, 200, 170)
                                    }
                                } else if (e.graphic.attributes.sort && e.graphic.attributes.sort === 'warningMarker') {
                                    var attr = e.graphic.attributes;
                                    if (attr.carry) {
                                        _this.infoWindow(attr.lng, attr.lat, attr.title, attr.con, 200, 220)
                                    } else {
                                        _this.infoWindow(attr.lng, attr.lat, attr.title, attr.con)
                                    }
                                }
                            }
                        })
                    } else {
                        map.graphics.on('mouse-down', function(e) {
                            e.stopPropagation();
                            if(e.button == 0) {
                                if (e.graphic.attributes.sort && e.graphic.attributes.sort === 'oneMarker') {
                                    var attr = e.graphic.attributes;
                                    if (attr.con) {
                                        _this.infoWindow(attr.lng, attr.lat, '', attr.con, 200, 170)
                                    }
                                } else if (e.graphic.attributes.sort && e.graphic.attributes.sort === 'warningMarker') {
                                    var attr = e.graphic.attributes;
                                    if (attr.carry) {
                                        _this.infoWindow(attr.lng, attr.lat, attr.title, attr.con, 200, 220)
                                    } else {
                                        _this.infoWindow(attr.lng, attr.lat, attr.title, attr.con)
                                    }
                                }
                            }
                        })
                    }
                    // 鼠标移入移出事件
                    map.graphics.on('mouse-over', function(e) {
                        e.stopPropagation();
                        if(dojo.byId('textLayer')) {
                            map.setMapCursor('default');
                            dojo.byId('map_root').removeChild(dojo.byId('textLayer'));
                        }
                        if (e.graphic.attributes && e.graphic.attributes.sort === 'marker') {
                            map.setMapCursor('pointer');
                            var _marker = e.graphic;
                            // 转化为屏幕坐标  添加div
                            var scrPt = map.toScreen(_marker.geometry);
                            var textDiv = dojo.doc.createElement('div');
                            dojo.attr(textDiv,{
                                'id':'textLayer'
                            });
                            dojo.style(textDiv, {
                                "left": scrPt.x + 14 + "px",
                                "top": scrPt.y - 10 + "px",
                                "position": "absolute",
                                "z-index": 99,
                                "background":"#fff",
                                "padding": "2px 5px 2px 5px",
                                "font-size": "11px",
                                "border-radius": "3px",
                                "box-shadow": "0 0 0.75em #777777"
                            });
                            textDiv.innerHTML = _marker.attributes.text;
                            dojo.byId('map_root').appendChild(textDiv);
                        } else if (e.graphic.attributes && e.graphic.attributes.sort === 'oneMarker') {
                            map.setMapCursor('pointer');
                            var _marker = e.graphic;
                            if (_marker.attributes.text) {
                                // 转化为屏幕坐标  添加div
                                var scrPt = map.toScreen(_marker.geometry);
                                var textDiv = dojo.doc.createElement('div');
                                dojo.attr(textDiv,{
                                    'id':'textLayer'
                                });
                                dojo.style(textDiv, {
                                    "left": scrPt.x + 14 + "px",
                                    "top": scrPt.y - 10 + "px",
                                    "position": "absolute",
                                    "z-index":99,
                                    "background":"#fff",
                                    "padding": "2px 5px 2px 5px",
                                    "font-size": "11px",
                                    "border-radius": "3px",
                                    "box-shadow": "0 0 0.75em #777777"
                                });
                                textDiv.innerHTML = _marker.attributes.text;
                                dojo.byId('map_root').appendChild(textDiv);
                            }
                        }
                    });
                    map.graphics.on('mouse-out', function(e) {
                        e.stopPropagation();
                        if (e.graphic.attributes && e.graphic.attributes.sort === 'marker') {
                            map.setMapCursor('default');
                            dojo.byId('map_root').removeChild(dojo.byId('textLayer'));
                        } else if (e.graphic.attributes && e.graphic.attributes.sort === 'oneMarker') {
                            map.setMapCursor('default');
                            if (e.graphic.attributes.text && dojo.byId('textLayer')) {
                                dojo.byId('map_root').removeChild(dojo.byId('textLayer'))
                            }
                        }
                    });
                });
            } else {
                // 点击事件 IE下CLICK事件不触发，改用判断按下鼠标左键
                if (_this._markerEvent) {
                    map.graphics.on('mouse-down', function(e) {
                        e.stopPropagation();
                        if(e.button == 0) {
                            if(e.graphic.attributes.sort && e.graphic.attributes.sort === 'marker') {
                                var _marker = e.graphic;
                                if ($.inArray(_marker.attributes.id, markerPickedIdArr) == -1) {
                                    // 只允许地图选这一个标注点的时候
                                    if(_this._onePick) {
                                        for (var m = 0; m < markerArr.length; m++) {
                                            if (markerArr[m].attributes.id == markerPickedIdArr[0]) {
                                                _this.iconRecover(markerArr[m])
                                            }
                                        }
                                        markerPickedIdArr = [];
                                    }
                                    markerPickedIdArr.push(_marker.attributes.id);
                                    _this.iconPicked(_marker);
                                    yisaTree.check(markerPickedIdArr);
                                } else {
                                    markerPickedIdArr = markerPickedIdArr.filter(function (f) {
                                        return f != _marker.attributes.id
                                    });
                                    _this.iconRecover(_marker);
                                    yisaTree.check(markerPickedIdArr);
                                }
                            } else if (e.graphic.attributes.sort && e.graphic.attributes.sort === 'oneMarker') {
                                var attr = e.graphic.attributes;
                                if (attr.con) {
                                    _this.infoWindow(attr.lng, attr.lat, '', attr.con, 200, 170)
                                }
                            } else if (e.graphic.attributes.sort && e.graphic.attributes.sort === 'warningMarker') {
                                var attr = e.graphic.attributes;
                                if (attr.carry) {
                                    _this.infoWindow(attr.lng, attr.lat, attr.title, attr.con, 200, 220)
                                } else {
                                    _this.infoWindow(attr.lng, attr.lat, attr.title, attr.con)
                                }
                            }
                        }
                    })
                } else {
                    map.graphics.on('mouse-down', function(e) {
                        e.stopPropagation();
                        if(e.button == 0) {
                            if (e.graphic.attributes.sort && e.graphic.attributes.sort === 'oneMarker') {
                                var attr = e.graphic.attributes;
                                if (attr.con) {
                                    _this.infoWindow(attr.lng, attr.lat, '', attr.con, 200, 170)
                                }
                            } else if (e.graphic.attributes.sort && e.graphic.attributes.sort === 'warningMarker') {
                                var attr = e.graphic.attributes;
                                if (attr.carry) {
                                    _this.infoWindow(attr.lng, attr.lat, attr.title, attr.con, 200, 220)
                                } else {
                                    _this.infoWindow(attr.lng, attr.lat, attr.title, attr.con)
                                }
                            }
                        }
                    })
                }
                // 鼠标移入移出事件
                map.graphics.on('mouse-over', function(e) {
                    e.stopPropagation();
                    if(dojo.byId('textLayer')) {
                        map.setMapCursor('default');
                        dojo.byId('map_root').removeChild(dojo.byId('textLayer'));
                    }
                    if (e.graphic.attributes && e.graphic.attributes.sort === 'marker') {
                        map.setMapCursor('pointer');
                        var _marker = e.graphic;
                        // 转化为屏幕坐标  添加div
                        var scrPt = map.toScreen(_marker.geometry);
                        var textDiv = dojo.doc.createElement('div');
                        dojo.attr(textDiv,{
                            'id':'textLayer'
                        });
                        dojo.style(textDiv, {
                            "left": scrPt.x + 14 + "px",
                            "top": scrPt.y - 10 + "px",
                            "position": "absolute",
                            "z-index": 99,
                            "background":"#fff",
                            "padding": "2px 5px 2px 5px",
                            "font-size": "11px",
                            "border-radius": "3px",
                            "box-shadow": "0 0 0.75em #777777"
                        });
                        textDiv.innerHTML = _marker.attributes.text;
                        dojo.byId('map_root').appendChild(textDiv);
                    } else if (e.graphic.attributes && e.graphic.attributes.sort === 'oneMarker') {
                        map.setMapCursor('pointer');
                        var _marker = e.graphic;
                        if (_marker.attributes.text) {
                            // 转化为屏幕坐标  添加div
                            var scrPt = map.toScreen(_marker.geometry);
                            var textDiv = dojo.doc.createElement('div');
                            dojo.attr(textDiv,{
                                'id':'textLayer'
                            });
                            dojo.style(textDiv, {
                                "left": scrPt.x + 14 + "px",
                                "top": scrPt.y - 10 + "px",
                                "position": "absolute",
                                "z-index":99,
                                "background":"#fff",
                                "padding": "2px 5px 2px 5px",
                                "font-size": "11px",
                                "border-radius": "3px",
                                "box-shadow": "0 0 0.75em #777777"
                            });
                            textDiv.innerHTML = _marker.attributes.text;
                            dojo.byId('map_root').appendChild(textDiv);
                        }
                    }
                });
                map.graphics.on('mouse-out', function(e) {
                    e.stopPropagation();
                    if (e.graphic.attributes && e.graphic.attributes.sort === 'marker') {
                        map.setMapCursor('default');
                        dojo.byId('map_root').removeChild(dojo.byId('textLayer'));
                    } else if (e.graphic.attributes && e.graphic.attributes.sort === 'oneMarker') {
                        map.setMapCursor('default');
                        if (e.graphic.attributes.text && dojo.byId('textLayer')) {
                            dojo.byId('map_root').removeChild(dojo.byId('textLayer'))
                        }
                    }
                });
            }

            // 区县大圈的事件集合
            cityLayer.on('mouse-over', function(e) {
                e.stopPropagation();
                if (e.graphic.attributes && e.graphic.attributes.sort === 'cityCircle') {
                    map.setMapCursor('pointer');
                    for (var i = 0; i < labels.length; i++) {
                        if (labels[i].symbol.id == ('picturemarkersymbol' + e.graphic.attributes.index)) {
                            var symbol = labels[i].symbol;
                            symbol.setUrl(arcStaticUrl + '/images/map/label-red.png');
                            labels[i].setSymbol(symbol);
                        }
                    }
                }
            })
            cityLayer.on('mouse-out', function(e) {
                e.stopPropagation();
                if (e.graphic.attributes && e.graphic.attributes.sort === 'cityCircle') {
                    map.setMapCursor('default');
                    for (var i = 0; i < labels.length; i++) {
                        if (labels[i].symbol.id == ('picturemarkersymbol' + e.graphic.attributes.index)) {
                            var symbol = labels[i].symbol;
                            symbol.setUrl(arcStaticUrl + '/images/map/label-green.png');
                            labels[i].setSymbol(symbol);
                        }
                    }
                }
            })
            cityLayer.on('click', function(e) {
                e.stopPropagation();
                if (e.graphic.attributes && e.graphic.attributes.sort === 'cityCircle') {
                    for (var i = 0; i < labels.length; i++) {
                        if (labels[i].symbol.id == ('picturemarkersymbol' + e.graphic.attributes.index)) {
                            var zoomAfterClick = 13;
                            map.centerAt(new Point(labels[i].attributes.lng, labels[i].attributes.lat, new SpatialReference({wkid: 4326})));
                            setTimeout(function () {
                                map.setZoom(zoomAfterClick);
                            }, 500);
                            _this.reLoadViewMarker();
                        }
                    }
                }
            })
            // drawTool 绘制事件
            drawTool = new Draw(map, { showTooltips: false });
            drawTool.on('draw-complete', function (e) {
                drawTool.deactivate();
                var _overlayId = 'o' + new Date().getTime();
                var overlay = new Graphic(e.geometry, drawFillSymbol, {oid: _overlayId});
                map.graphics.add(overlay);
                overlayArr[_overlayId] = overlay;
                var tempPicked = [];
                var polygon = new Polygon({
                    rings: e.geometry.rings,
                    spatialReference: e.geometry.spatialReference
                })
                for (var m = 0; m < markerArr.length; m++) {
                    if (polygon.contains(markerArr[m].geometry) && $.inArray(markerArr[m].attributes.id, markerPickedIdArr) == -1) {
                        markerPickedIdArr.push(markerArr[m].attributes.id);
                        _this.iconPicked(markerArr[m]);
                        tempPicked.push(markerArr[m]);
                    }
                }
                // 列表勾选
                yisaTree.check(markerPickedIdArr);
                if (tempPicked.length == 0) {
                    map.graphics.remove(overlay);
                    delete overlayArr[_overlayId];
                    alert('未选择任何标注点');
                }
                $('#drawDefault').addClass('current').siblings().removeClass('current');
            })
            if (_this._ScaleNavi) {
                map.showZoomSlider();
                new Scalebar({
                    map: map,
                    scalebarUnit: "dual",
                    attachTo: "bottom-right"
                })
            } else {
                map.hideZoomSlider();
            }
            if (_this._scrollWheel) {
                map.enableScrollWheelZoom();
            } else {
                map.disableScrollWheelZoom();
            }
        },
        /**
         * 显示地图可视区域内的点
         ***/
        showViewMarker: function () {
            var _this = this
            var loadType = _this._markerLoadType || 'all'
            if (typeof(yisaTree) != 'undefined' && map.getZoom() < 12) {
                _this.loadCity();
                // 隐藏设备图标说明面板
                $('#map-pannel').hide();
            } else {
                // 显示设备图标说明面板
                $('#map-pannel').show();
                if (_this._viewFirst) {
                    // map.panRight()
                    _this._viewFirst = false;
                }
                var _bounds = map.geographicExtent,
                    _sw = _bounds.xmin + ',' + _bounds.ymin,
                    _ne = _bounds.xmax + ',' + _bounds.ymax;
                // 清除地图所有点
                _this.clearAllMarker();
                $.ajax({
                    async: false,
                    url: mapConfig.getLocationsUrl,
                    data: {'sw': _sw, 'ne': _ne},
                    dataType: 'json'
                }).done(function (e) {
                    // var {status, message, data} = e
                    var status = e.status;
                    var message = e.message;
                    var data = e.data;
                    if (!status) {
                        if (typeof(data) !== 'undefined') {
                            switch (loadType) {
                                case 'sd':
                                    _this.sdaddMarker(data);
                                    break
                                case 'all':
                                    _this.addMarker(data);
                                    break
                                case 'picked':
                                    _this.addPickedMarker(data);
                                    break
                                default:
                                    alert('Error：未知加载类型！');
                                    return
                            }
                        }
                    } else {
                        alert(message);
                    }
                }).fail(function () {
                    alert('数据请求失败!');
                })
            }
        },
        /**
         * 重新加载marker
         ***/
        reLoadViewMarker: function () {
            var _this = this,
                _currentZoom = map.getZoom();
            if (typeof(yisaTree) != 'undefined' && _currentZoom < 12) {
                // 判断zoom级别后再进行是否清除选择
                // 删除所有点图标
                if (markerArr.length > 0) {
                    for (var i = 0; i < markerArr.length; i++) {
                        map.graphics.remove(markerArr[i]);
                    }
                    markerArr = [];
                }
                if (labels.length == 0) {
                    _this.loadCity();
                    _this._viewFirst = true;
                    $('#map-pannel').hide();
                }
            } else {
                if (labels.length > 0) {
                    cityLayer.clear();
                    labels = [];
                }
                //移除行政区边界，防止鼠标在圆圈上缩放引起的bug
                if (boundaryOverlayArr.length > 0) {
                    for (var b = 0; b < boundaryOverlayArr.length; b++) {
                        // map.removeLayer(boundaryOverlayArr[b])
                        map.graphics.remove(boundaryOverlayArr[b]);
                    }
                    boundaryOverlayArr = [];
                }
                _this.showViewMarker();
            }
        },
        /**
         * 批量添加标注点
         ***/
        addMarker: function (arr) {
            var _this = this;
            if (map) {
                for (var a = 0; a < arr.length; a++) {
                    var opts = {}
                    if ($.inArray(arr[a].id, markerPickedIdArr) == -1) {
                        opts.url = arcStaticUrl + '/images/map/' + arr[a].type + '.png';
                    } else {
                        opts.url = arcStaticUrl + '/images/map/' + arr[a].type + 'h.png';
                    }
                    opts.width = 18;
                    opts.height = 17;
                    opts.xoffset = 0;
                    opts.yoffset = 0;
                    opts.type = 'picturemarkersymbol';
                    var symbol = new PictureMarkerSymbol(opts);
                    if (arr[a].lng && arr[a].lat) {
                        var point = new Point(arr[a].lng, arr[a].lat, new SpatialReference({wkid:4326}));
                        var attr = {
                            id: arr[a].id,
                            type: arr[a].type,
                            text: arr[a].text,
                            lng: arr[a].lng,
                            lat: arr[a].lat,
                            sort: 'marker' // 分类marker
                        };
                        marker = new Graphic(point, symbol, attr, null);
                        markerArr.push(marker);
                        markerIdArr.push(arr[a].id);
                        map.graphics.add(marker);
                    }
                }

            }
        },
        /**
         * 添加temArr中的marker
         * */
        warningAddMakers: function (tempArr, flag, carry) {
            var _this = this;
            var opts = {};
            opts.url = arcStaticUrl + '/images/map/1.png';
            opts.width = 18;
            opts.height = 17;
            opts.xoffset = 0;
            opts.yoffset = 0;
            var symbol = new PictureMarkerSymbol(opts);
            // 超过20个点位在数组中移除
            var len = warningMarkerArr.length;
            if (len + tempArr.length > 20) {
                for (var i = 0; i < len + tempArr.length - 20; i++) {
                    warningMarkerArr.pop();
                }
            }
            flag ? warningMarkerArr = tempArr.concat(warningMarkerArr) : warningMarkerArr = warningMarkerArr.concat(tempArr);
            map.graphics.clear();
            warningMarkerArr.forEach(function(item){
                var point = new Point(item.lng, item.lat, new SpatialReference({wkid: 4326}));
                var attr = {
                    id: item.locationID,
                    lng: item.lng,
                    lat: item.lat,
                    title: item.title,
                    con: item.con,
                    carry: carry,
                    sort: 'warningMarker' // 分类marker
                };
                var marker = new Graphic(point, symbol, attr, null);
                map.graphics.add(marker);
                if (item.con) {
                    // 默认显示第一个
                    if (parseInt(item.lng) != 0 && parseInt(item.lat) != 0) {
                        if (item.index === 0) {
                            if (carry) {
                                _this.infoWindow(item.lng, item.lat, item.title, item.con, 200, 220);
                            } else {
                                _this.infoWindow(item.lng, item.lat, item.title, item.con);
                            }
                            map.centerAt(point);
                        }
                    }
                }
            })
        },
        /**
         * 标注点被选中后的样式
         ***/
        iconPicked: function (m) {
            var iconPic = {};
            iconPic.url = arcStaticUrl + '/images/map/'+ m.attributes.type + 'h.png';
            if (m.attributes && m.attributes.type == 'stop-icon') {
                iconPic.width = 14;
                iconPic.height = 14;
                iconPic.xoffset = 3;
                iconPic.yoffset = 3;
            } else {
                iconPic.width = 18;
                iconPic.height = 17;
                iconPic.xoffset = 0;
                iconPic.yoffset = 0;
            }
            var symbol = new PictureMarkerSymbol(iconPic);
            m.setSymbol(symbol);
        },
        /**
         * 恢复标注点样式
         ***/
        iconRecover: function (m) {
            var iconPic = {};
            iconPic.url = arcStaticUrl + '/images/map/'+ m.attributes.type + '.png';
            if (m.attributes && m.attributes.type == 'stop-icon') {
                iconPic.width = 14;
                iconPic.height = 14;
                iconPic.xoffset = 3;
                iconPic.yoffset = 3;
            } else {
                iconPic.width = 18;
                iconPic.height = 17;
                iconPic.xoffset = 0;
                iconPic.yoffset = 0;
            }
            var symbol = new PictureMarkerSymbol(iconPic);
            m.setSymbol(symbol);
        },
        /**
         * 加载区县点
         ***/
        loadCity: function () {
            var _this = this;
            if (map) {
                if (typeof (yisaTree) !== 'undefined') {
                    if (yisaTree instanceof Object) {
                        var labelArr = yisaTree.getCounty();
                        _this.addLabels(labelArr);
                    }
                }
            }
        },
        /**
         * 加载区县级的点，以实现类似点标注的效果，点击后改变地图缩放等级，加载可视区域的点
         * labelArr: Array
         * {text,lng,lat,count}
         ***/
        addLabels: function (labelArr) {
            var _this = this;
            for (var i = 0; i < labelArr.length; i++) {
                var point = new Point(labelArr[i].lng, labelArr[i].lat, new SpatialReference({wkid: 4326}));
                var opts = {
                    url: arcStaticUrl + '/images/map/label-green.png',
                    width: 47,
                    height: 47,
                    type: 'picturemarkersymbol',
                    id: 'picturemarkersymbol' + i
                };
                var attr = {
                    lng: labelArr[i].lng,
                    lat: labelArr[i].lat,
                    sort: 'cityCircle', // 分类 区县大圆点
                    index: i
                };
                // 背景
                var cityBg = new PictureMarkerSymbol(opts);
                var cityBgGraphic = new Graphic(point, cityBg, attr);
                // 区县名称
                var cityText = new TextSymbol(labelArr[i].text, new Font('10pt', Font.STYLE_NORMAL, Font.VARIANT_NORMAL, Font.WEIGHT_NORMAL, '微软雅黑'), new Color('#fff')).setOffset(0, 5);
                var cityTextGraphic = new Graphic(point, cityText, attr);
                // 点位数量
                var cityCount = new TextSymbol(labelArr[i].count, new Font('10pt', Font.STYLE_NORMAL, Font.VARIANT_NORMAL, Font.WEIGHT_NORMAL, '微软雅黑'), new Color('#fff')).setOffset(0, -15);
                var cityCountGraphic = new Graphic(point, cityCount, attr);
                cityLayer.add(cityBgGraphic);
                cityLayer.add(cityTextGraphic);
                cityLayer.add(cityCountGraphic);
                labels.push(cityBgGraphic);
            }
        },
        /**
         * 鼠标移动显示label
         ***/
        addLabel: function (marker, cb) {
            var point = marker.geometry;
            var text = '';
            if (cb) {
                text = cb(marker) //如果回调函数存在就修改text的内容
            }
            var scrPt = map.toScreen(point);
            var textDiv = dojo.doc.createElement('div');
            dojo.attr(textDiv,{
                'id':'titleLayer'
            });
            dojo.style(textDiv, {
                "left": scrPt.x + 14 + "px",
                "top": scrPt.y - 10 + "px",
                "position": "absolute",
                "z-index":99,
                "background":"#fff",
                "padding": "2px 5px 2px 5px",
                "font-size": "11px",
                "border-radius": "3px",
                "box-shadow": "0 0 0.75em #777777"
            });
            textDiv.innerHTML = text;
            dojo.byId('map_root').appendChild(textDiv);
        },
        /**
         * 鼠标移出 移除label
         ***/
        RemoveLabel: function (marker) {
            if (dojo.byId('titleLayer')) {
                dojo.byId('map_root').removeChild(dojo.byId('titleLayer'))
            }
        },
        /**
         * 清除所有叠加对象
         ***/
        clearAll: function () {
            if (carMarker) {
                carMarker = null
            }
            // map.removeAllLayers()
            if(map.graphics) {
                map.graphics.clear();
            }
            cityLayer.clear();
        },
        /**
         * 清除地图上的所有点
         ***/
        clearAllMarker: function () {
            // 清空graphics
            for (var i = 0; i < markerArr.length; i++) {
                map.graphics.remove(markerArr[i]);
            }
            markerArr = [];
            markerIdArr = [];
        },
        /**
         * drawTool圈选工具
         * drawCircle圆形  drawRectangle矩形  drawArbitrary多边形  drawClear删除
         ***/
        draw: function (drawType) {
            var _this = this;
            _this.drawClose();
            switch (drawType) {
                case 'drawCircle':
                    drawTool.activate(Draw.CIRCLE);
                    break;
                case 'drawRectangle':
                    drawTool.activate(Draw.RECTANGLE);
                    break;
                case 'drawArbitrary':
                    drawTool.activate(Draw.FREEHAND_POLYGON);
                    break;
                case 'drawDefault':
                    drawTool.deactivate();
                    break;
                case 'drawClear':
                    _this.drawClear();
                    return;
                default:
                    return;
            }
        },
        /**
         * 关闭绘制
         ***/
        drawClose: function () {
            if (drawTool) {
                // drawTool.finishDrawing()
                drawTool.deactivate();
            }
        },
        /**
         * 清除绘制，清除绘制选中的标注点的效果
         ***/
        drawClear: function () {
            var _this = this
            for (var i in overlayArr) {
                map.graphics.remove(overlayArr[i]);
            }
            overlayArr = {};
            if (markerPickedIdArr.length > 0) {
                for (var m = 0; m < markerArr.length; m++) {
                    if ($.inArray(markerArr[m].attributes.id, markerPickedIdArr) != -1) {
                        _this.iconRecover(markerArr[m]);
                        // 单选取消勾选
                        yisaTree.checkOne(markerArr[m].attributes.id, false);
                    }
                }
                markerPickedIdArr = [];
                // 列表勾选
                yisaTree.check(markerPickedIdArr);
            }
        },
        /**
         * 搜索结果页  定位
         * */
        fixedPosition: function (lng, lat) {
            if (markerArr.length > 0) {
                map.graphics.remove(markerArr[0]);
                markerArr = [];
            }
            var point;
            if (lng && lat) {
                point = new Point(lng, lat, new SpatialReference({wkid: 4326}));
                map.centerAt(point);
                map.setZoom(12);
            } else {
                point = new Point(options.center[0], options.center[1], new SpatialReference({wkid: 4326}));
                return
            }
            var opts = {};
            opts.url = arcStaticUrl + '/images/map/stop-markerh.png';
            opts.width = 13;
            opts.height = 17;
            opts.xoffset = 0;
            opts.yoffset = 8;
            var symbol = new PictureMarkerSymbol(opts);
            marker = new Graphic(point, symbol);
            map.graphics.add(marker);
            markerArr.push(marker);
        },
        /**
         * 设置地图中心位置，及缩放级别
         * 无参数返回初始状态
         * */
        setPosition: function (lng, lat, zoom) {
            if (!lng && !lat && !zoom) {
                map.graphics.clear()
            }
            var _lnglat, _zoom;
            if (parseInt(lng) && parseInt(lat)) {
                _lnglat = new Point(lng, lat, new SpatialReference({wkid: 4326}));
            } else {
                _lnglat =  new Point(options.center[0], options.center[1], new SpatialReference({wkid: 4326}));
            }
            if (zoom) {
                _zoom = zoom;
            } else {
                _zoom = 14;
            }
            map.centerAt(_lnglat);
            setTimeout(function () {
                map.setZoom(_zoom)
            }, 600);
        },
        /**
         * 添加选中标注点
         * arr : 坐标集合
         * */
        addPickedMarker: function (arr) {
            var _this = this;
            if (map) {
                for (var a = 0; a < arr.length; a++) {
                    if ($.inArray(arr[a].id, markerPickedIdArr) !== -1) {
                        var opts = {};
                        opts.url = arcStaticUrl + '/images/map/' + arr[a].type + 'h.png';
                        opts.width = 18;
                        opts.height = 17;
                        opts.xoffset = 0;
                        opts.yoffset = 0;
                        opts.type = 'picturemarkersymbol';
                        var symbol = new PictureMarkerSymbol(opts);
                        if (arr[a].lng && arr[a].lat) {
                            var point = new Point(arr[a].lng, arr[a].lat, new SpatialReference({wkid:4326}));
                            var attr = {
                                id: arr[a].id,
                                type: arr[a].type,
                                text: arr[a].text,
                                lng: arr[a].lng,
                                lat: arr[a].lat,
                                sort: 'marker' // 分类marker
                            };
                            marker = new Graphic(point, symbol, attr, null);
                            markerArr.push(marker);
                            markerIdArr.push(arr[a].id);
                            map.graphics.add(marker);
                        }
                    }
                }
            }
        },
        /**
         * 设置选中的标注点
         * 应用：加载布控区域
         * 模块功能单独使用
         * */
        setMarkerPicked: function (data) {
            this.clearAllMarker();
            var idArr = [];
            for (var i = 0; i < data.length; i++) {
                _idArr.push(data[i].id)
            }
            var lnglat = new Point(data[0].lng, data[0].lat, new SpatialReference({wkid: 4326}));
            map.centerAndZoom(lnglat, 13);
        },
        /**
         * 列表与地图交互
         * */
        listControlMap: function (id, str) {
            var _this = this;
            if (str == 'del') {
                for (var m = 0; m < markerArr.length; m++) {
                    if (markerArr[m].attributes.id == id) {
                        _this.iconRecover(markerArr[m]);
                    }
                }
                markerPickedIdArr = markerPickedIdArr.filter(function (f) {
                    return f != id
                })
            } else if (str == 'add') {
                markerPickedIdArr.push(id);
                for (var m = 0; m < markerArr.length; m++) {
                    if (markerArr[m].attributes.id == id) {
                        _this.iconPicked(markerArr[m]);
                    }
                }
            } else {
                alert('勾选状态error');
            }
        },
        /**
         * 添加一个marker,如果传入con，显示infowindow
         * */
        addMarkerOne: function (lng, lat, locid, con, icon, edit, label) {
            icon = icon || 'stop-marker';
            if (map) {
                var _this = this;
                var opts = {};
                if (icon == 1) {
                    opts.url = arcStaticUrl + '/images/map/' + icon + '.png';
                    opts.width = 18;
                    opts.height = 17;
                    opts.xoffset = 0;
                    opts.yoffset = 0;
                } else {
                    if (icon == 'stop-icon') {
                        opts.width = 8.25;
                        opts.height = 8.25;
                        opts.xoffset = 0;
                        opts.yoffset = 0;
                    } else if (icon == 'map-start' || icon == 'map-end') {
                        opts.width = 18.75;
                        opts.height = 28;
                        opts.xoffset = 0;
                        opts.yoffset = 14;
                    } else {
                        opts.width = 18;
                        opts.height = 17;
                        opts.xoffset = 0;
                        opts.yoffset = 0;
                    }
                    opts.url = arcStaticUrl + '/images/map/' + icon + 'h.png';
                }
                var symbol = new PictureMarkerSymbol(opts);
                var point = new Point(lng, lat, new SpatialReference({wkid: 4326}));
                var attr = {
                    id: locid,
                    type: icon,
                    text: label,
                    lng: lng,
                    lat: lat,
                    con: con,
                    sort: 'oneMarker'
                };
                marker = new Graphic(point, symbol, attr, null);
                map.graphics.add(marker);

                if (edit) {
                    editTool = new Edit(map);
                    editTool.activate(Edit.MOVE | Edit.SCALE, marker);
                    editTool.on('graphic-move-stop', function (e) {
                        $('#editLocationForm').find('input[name="lng"]').val(e.graphic.geometry.x);
                        $('#editLocationForm').find('input[name="lat"]').val(e.graphic.geometry.y);
                    });
                }

                this._markerAll.push(marker);
                return marker;
            }
        },
        /**
         * 轨迹重现：绘制线路
         * */
        drawLine: function (points, c, id) {
            if (typeof points[0] == 'string') {
                points = points.map(function(item, v){
                    return new Point(item.split(',')[0], item.split(',')[1], new SpatialReference({wkid: 4326}));
                })
            }
            var polyline = new Polyline(new SpatialReference({wkid: 4326}));
            polyline.addPath(points);
            var simpleLineSymbol = new SimpleLineSymbol(
                SimpleLineSymbol.STYLE_SOLID,
                new Color(c),
                3
            );
            var _overlay = new Graphic(polyline, simpleLineSymbol, {id: id});
            map.graphics.add(_overlay);
        },
        /**
         * 轨迹重现：添加marker
         * */
        addMarkerAll: function (arr) {
            var _this = this;
            if (map) {
                for (var a = 0; a < arr.length; a++) {
                    if (!parseInt(arr[a][0])) continue;
                    _this.addMarkerOne(arr[a][0], arr[a][1], arr[a][2], '', 'stop-icon');
                }
            }
        },
        /**
         * 定义窗体信息
         * */
        infoWindow: function (lng, lat, title, content, w, h) {
            var width = 500, height = 250;
            if (w && h) {
                map.infoWindow.resize(parseFloat(w), parseFloat(h));
            } else {
                map.infoWindow.resize(width || 0, height || 0);
            }
            var point = new Point(lng, lat, new SpatialReference({wkid: 4326}));
            if (title) {
                map.infoWindow.setTitle(title);
            }
            map.infoWindow.setContent(content);
            map.centerAt(point);
            map.infoWindow.show(point, InfoWindow.ANCHOR_LOWERLEFT);
        },
        /**
         * 关闭窗体信息
         * */
        closeWindow: function () {
            if (map) {
                map.infoWindow.hide();
            }
        },
        /**
         * 清除页面infowindow，添加制定infowindow
         * */
        warningHoverWindow: function (lng, lat, title, content, carry) {
            this.closeWindow();
            if (parseInt(lng) != 0 && parseInt(lat) != 0) {
                if (carry) {
                    this.infoWindow(lng, lat, title, content, 200, 220);
                } else {
                    this.infoWindow(lng, lat, title, content);
                }
                var point = new Point(lng, lat, new SpatialReference({wkid: 4326}));
                map.centerAt(point);
            }

        },
        /**
         * 加载窗体信息
         * */
        alarmInfoWindow: function (data, aom) {
            var _this = this
            if (map) {
                map.infoWindow.hide()
            }
            var title = '车辆告警（<span>' + data.deployType + '</span>）';
            var content = ''
            if (aom) {
                content = '<div class="winInfo-txt"><dl><dt>告警信息</dt><dd><span>布控号码：</span>' + data.number + '</dd><dd><span>布控类型：</span>' + data.deployType + '</dd><dd><span>发现地点：</span>' + data.locationName + '</dd><dd><span>发现时间：</span>' + data.captureTime + '</dd><dd><span>行驶方向：</span>' + data.directionName + '</dd></dl><dl><dt>布控单信息</dt><dd><span>申请人：</span>' + data.applyUser + '</dd><dd><span>电话：</span>' + data.applyPhone + '</dd><dd><span>布控单号：</span>' + data.deploySheetID + '</dd><dd><span>布控原因：</span>' + data.deployReason + '</dd></dl></div>';
            } else {
                content = '<div class="winInfo-img"><img src="' + data.bigPic + '" alt=""></div><div class="winInfo-txt"><dl><dt>车辆信息</dt><dd><span>车牌号：</span>' + data.plate + '</dd><dd><span>车身颜色：</span>' + data.colorName + '</dd><dd><span>车型：</span>' + data.yearName + '</dd></dl><dl><dt>告警信息</dt><dd><span>发现地点：</span>' + data.locationName + '</dd><dd><span>发现时间：</span>' + data.captureTime + '</dd><dd><span>行驶方向：</span>' + data.directionName + '</dd><dd><span>车速：</span>' + data.speed + '</dd></dl><dl><dt>布控单信息</dt><dd><span>申请人：</span>' + data.applyUser + '</dd><dd><span>电话：</span>' + data.applyPhone + '</dd><dd><span>布控单号：</span>' + data.deploySheetID + '</dd><dd><span>布控类型：</span>' + data.deployType + '</dd><dd><span>布控原因：</span>' + data.deployReason + '</dd></dl></div>';
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
         * 一车一档加载全部点
         * */
        placeDataEvt: function (data) {
            // 此部分页面公安部一所无需展示，未完善
        },
        /**
         * @param point 每组车牌号的point数组
         * @param c     颜色
         * @param count 车牌号的索引值
         * */
        drawDriving: function(point, c, count) {
            var _this = this;
            var points = point.map(function(item) {
                return item.slice(0, 2);
            })
            mapCtrl._drivingAll[count] = [];
            if (points.length > 1) {
                for (var i = 0; i < points.length - 1; i++) {
                    if (!parseInt(points[i][0]) || !parseInt(points[i+1][0])) continue;
                    // todo
                }
            }
        },
        navDrivingPoints: function (origin, destination) {
            // todo
        },
        /**
         * 批量修改标注点用到
         * */
        getAllMarkers: function () {
            var os = map.graphics.graphics;
            var re = {};
            for (var i in os) {
                re[os[i].attributes.id] = os[i].geometry.x + ',' + os[i].geometry.y;
            }
            return re;
        },
    };
})