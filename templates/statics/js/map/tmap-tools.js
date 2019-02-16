/**
 * @namespace IMAP的所有library类均放在IMAPLib命名空间下
 */
var IMAPLib = window.IMAPLib = IMAPLib || {};
(function() {

    /**
     * 地球半径
     */
    var EARTHRADIUS = 6370996.81;

    /**
     * @exports GeoUtils as IMAPLib.GeoUtils
     */
    var GeoUtils =
        /**
         * GeoUtils类，静态类，勿需实例化即可使用
         * @class GeoUtils类的<b>入口</b>。
         * 该类提供的都是静态方法，勿需实例化即可使用。
         */
        IMAPLib.GeoUtils = function(){

        }

    /**
     * 判断点是否在矩形内
     * @param {Point} point 点对象
     * @param {Bounds} bounds 矩形边界对象
     * @returns {Boolean} 点在矩形内返回true,否则返回false
     */
    GeoUtils.isPointInRect = function(point, bounds){
        //检查类型是否正确
        if (!(point instanceof IMAP.LngLat) ||
            !(bounds instanceof IMAP.LngLatBounds)) {
            return false;
        }
        var sw = bounds.getSouthWest(); //西南脚点
        var ne = bounds.getNorthEast(); //东北脚点
        return (point.lng >= sw.lng && point.lng <= ne.lng && point.lat >= sw.lat && point.lat <= ne.lat);
    }

    /**
     * 判断点是否在圆形内
     * @param {Point} point 点对象
     * @param {Circle} circle 圆形对象
     * @returns {Boolean} 点在圆形内返回true,否则返回false
     */
    GeoUtils.isPointInCircle = function(point, circle){
        //检查类型是否正确
        if (!(point instanceof IMAP.LngLat) ||
            !(circle instanceof IMAP.Circle)) {
            return false;
        }

        //point与圆心距离小于圆形半径，则点在圆内，否则在圆外
        var c = circle.getCenter();
        var r = circle.getRadius();

        var dis = GeoUtils.getDistance(point, c);
        if(dis <= r){
            return true;
        } else {
            return false;
        }
    }

    /**
     * 判断点是否在折线上
     * @param {Point} point 点对象
     * @param {Polyline} polyline 折线对象
     * @returns {Boolean} 点在折线上返回true,否则返回false
     */
    GeoUtils.isPointOnPolyline = function(point, polyline){
        //检查类型
        if(!(point instanceof IMAP.LngLat) ||
            !(polyline instanceof IMAP.Polyline)){
            return false;
        }

        //首先判断点是否在线的外包矩形内，如果在，则进一步判断，否则返回false
        var lineBounds = polyline.getBounds();
        if(!this.isPointInRect(point, lineBounds)){
            return false;
        }

        //判断点是否在线段上，设点为Q，线段为P1P2 ，
        //判断点Q在该线段上的依据是：( Q - P1 ) × ( P2 - P1 ) = 0，且 Q 在以 P1，P2为对角顶点的矩形内
        var pts = polyline.getPath();
        for(var i = 0; i < pts.length - 1; i++){
            var curPt = pts[i];
            var nextPt = pts[i + 1];
            //首先判断point是否在curPt和nextPt之间，即：此判断该点是否在该线段的外包矩形内
            if (point.lng >= Math.min(curPt.lng, nextPt.lng) && point.lng <= Math.max(curPt.lng, nextPt.lng) &&
                point.lat >= Math.min(curPt.lat, nextPt.lat) && point.lat <= Math.max(curPt.lat, nextPt.lat)){
                //判断点是否在直线上公式
                var precision = (curPt.lng - point.lng) * (nextPt.lat - point.lat) -
                    (nextPt.lng - point.lng) * (curPt.lat - point.lat);
                if(precision < 2e-10 && precision > -2e-10){//实质判断是否接近0
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * 判断点是否多边形内
     * @param {Point} point 点对象
     * @param {Polyline} polygon 多边形对象
     * @returns {Boolean} 点在多边形内返回true,否则返回false
     */
    GeoUtils.isPointInPolygon = function(point, polygon){
        //检查类型
        if(!(point instanceof IMAP.LngLat) ||
            !(polygon instanceof IMAP.Polygon)){
            return false;
        }

        //首先判断点是否在多边形的外包矩形内，如果在，则进一步判断，否则返回false
        var polygonBounds = polygon.getBounds();
        if(!this.isPointInRect(point, polygonBounds)){
            return false;
        }

        var pts = polygon.getPath();//获取多边形点

        //下述代码来源：http://paulbourke.net/geometry/insidepoly/，进行了部分修改
        //基本思想是利用射线法，计算射线与多边形各边的交点，如果是偶数，则点在多边形外，否则
        //在多边形内。还会考虑一些特殊情况，如点在多边形顶点上，点在多边形边上等特殊情况。

        var N = pts.length;
        var boundOrVertex = true; //如果点位于多边形的顶点或边上，也算做点在多边形内，直接返回true
        var intersectCount = 0;//cross points count of x
        var precision = 2e-10; //浮点类型计算时候与0比较时候的容差
        var p1, p2;//neighbour bound vertices
        var p = point; //测试点

        p1 = pts[0];//left vertex
        for(var i = 1; i <= N; ++i){//check all rays
            if(p.equals(p1)){
                return boundOrVertex;//p is an vertex
            }

            p2 = pts[i % N];//right vertex
            if(p.lat < Math.min(p1.lat, p2.lat) || p.lat > Math.max(p1.lat, p2.lat)){//ray is outside of our interests
                p1 = p2;
                continue;//next ray left point
            }

            if(p.lat > Math.min(p1.lat, p2.lat) && p.lat < Math.max(p1.lat, p2.lat)){//ray is crossing over by the algorithm (common part of)
                if(p.lng <= Math.max(p1.lng, p2.lng)){//x is before of ray
                    if(p1.lat == p2.lat && p.lng >= Math.min(p1.lng, p2.lng)){//overlies on a horizontal ray
                        return boundOrVertex;
                    }

                    if(p1.lng == p2.lng){//ray is vertical
                        if(p1.lng == p.lng){//overlies on a vertical ray
                            return boundOrVertex;
                        }else{//before ray
                            ++intersectCount;
                        }
                    }else{//cross point on the left side
                        var xinters = (p.lat - p1.lat) * (p2.lng - p1.lng) / (p2.lat - p1.lat) + p1.lng;//cross point of lng
                        if(Math.abs(p.lng - xinters) < precision){//overlies on a ray
                            return boundOrVertex;
                        }

                        if(p.lng < xinters){//before ray
                            ++intersectCount;
                        }
                    }
                }
            }else{//special case when ray is crossing through the vertex
                if(p.lat == p2.lat && p.lng <= p2.lng){//p crossing over p2
                    var p3 = pts[(i+1) % N]; //next vertex
                    if(p.lat >= Math.min(p1.lat, p3.lat) && p.lat <= Math.max(p1.lat, p3.lat)){//p.lat lies between p1.lat & p3.lat
                        ++intersectCount;
                    }else{
                        intersectCount += 2;
                    }
                }
            }
            p1 = p2;//next ray left point
        }

        if(intersectCount % 2 == 0){//偶数在多边形外
            return false;
        } else { //奇数在多边形内
            return true;
        }
    }

    /**
     * 将度转化为弧度
     * @param {degree} Number 度
     * @returns {Number} 弧度
     */
    GeoUtils.degreeToRad =  function(degree){
        return Math.PI * degree/180;
    }

    /**
     * 将弧度转化为度
     * @param {radian} Number 弧度
     * @returns {Number} 度
     */
    GeoUtils.radToDegree = function(rad){
        return (180 * rad) / Math.PI;
    }

    /**
     * 将v值限定在a,b之间，纬度使用
     */
    function _getRange(v, a, b){
        if(a != null){
            v = Math.max(v, a);
        }
        if(b != null){
            v = Math.min(v, b);
        }
        return v;
    }

    /**
     * 将v值限定在a,b之间，经度使用
     */
    function _getLoop(v, a, b){
        while( v > b){
            v -= b - a
        }
        while(v < a){
            v += b - a
        }
        return v;
    }

    /**
     * 计算两点之间的距离,两点坐标必须为经纬度
     * @param {point1} Point 点对象
     * @param {point2} Point 点对象
     * @returns {Number} 两点之间距离，单位为米
     */
    GeoUtils.getDistance = function(point1, point2){
        //判断类型
        if(!(point1 instanceof IMAP.LngLat) ||
            !(point2 instanceof IMAP.LngLat)){
            return 0;
        }

        point1.lng = _getLoop(point1.lng, -180, 180);
        point1.lat = _getRange(point1.lat, -74, 74);
        point2.lng = _getLoop(point2.lng, -180, 180);
        point2.lat = _getRange(point2.lat, -74, 74);

        var x1, x2, y1, y2;
        x1 = GeoUtils.degreeToRad(point1.lng);
        y1 = GeoUtils.degreeToRad(point1.lat);
        x2 = GeoUtils.degreeToRad(point2.lng);
        y2 = GeoUtils.degreeToRad(point2.lat);

        return EARTHRADIUS * Math.acos((Math.sin(y1) * Math.sin(y2) + Math.cos(y1) * Math.cos(y2) * Math.cos(x2 - x1)));
    }

    /**
     * 计算折线或者点数组的长度
     * @param {Polyline|Array<Point>} polyline 折线对象或者点数组
     * @returns {Number} 折线或点数组对应的长度
     */
    GeoUtils.getPolylineDistance = function(polyline){
        //检查类型
        if(polyline instanceof IMAP.Polyline ||
            polyline instanceof Array){
            //将polyline统一为数组
            var pts;
            if(polyline instanceof IMAP.Polyline){
                pts = polyline.getPath();
            } else {
                pts = polyline;
            }

            if(pts.length < 2){//小于2个点，返回0
                return 0;
            }

            //遍历所有线段将其相加，计算整条线段的长度
            var totalDis = 0;
            for(var i =0; i < pts.length - 1; i++){
                var curPt = pts[i];
                var nextPt = pts[i + 1]
                var dis = GeoUtils.getDistance(curPt, nextPt);
                totalDis += dis;
            }

            return totalDis;

        } else {
            return 0;
        }
    }

    /**
     * 计算多边形面或点数组构建图形的面积,注意：坐标类型只能是经纬度，且不适合计算自相交多边形的面积
     * @param {Polygon|Array<Point>} polygon 多边形面对象或者点数组
     * @returns {Number} 多边形面或点数组构成图形的面积
     */
    GeoUtils.getPolygonArea = function(polygon){
        //检查类型
        if(!(polygon instanceof IMAP.Polygon) &&
            !(polygon instanceof Array)){
            return 0;
        }
        var pts;
        if(polygon instanceof IMAP.Polygon){
            pts = polygon.getPath();
        }else{
            pts = polygon;
        }

        if(pts.length < 3){//小于3个顶点，不能构建面
            return 0;
        }

        var totalArea = 0;//初始化总面积
        var LowX = 0.0;
        var LowY = 0.0;
        var MiddleX = 0.0;
        var MiddleY = 0.0;
        var HighX = 0.0;
        var HighY = 0.0;
        var AM = 0.0;
        var BM = 0.0;
        var CM = 0.0;
        var AL = 0.0;
        var BL = 0.0;
        var CL = 0.0;
        var AH = 0.0;
        var BH = 0.0;
        var CH = 0.0;
        var CoefficientL = 0.0;
        var CoefficientH = 0.0;
        var ALtangent = 0.0;
        var BLtangent = 0.0;
        var CLtangent = 0.0;
        var AHtangent = 0.0;
        var BHtangent = 0.0;
        var CHtangent = 0.0;
        var ANormalLine = 0.0;
        var BNormalLine = 0.0;
        var CNormalLine = 0.0;
        var OrientationValue = 0.0;
        var AngleCos = 0.0;
        var Sum1 = 0.0;
        var Sum2 = 0.0;
        var Count2 = 0;
        var Count1 = 0;
        var Sum = 0.0;
        var Radius = EARTHRADIUS; //6378137.0,WGS84椭球半径
        var Count = pts.length;
        for (var i = 0; i < Count; i++) {
            if (i == 0) {
                LowX = pts[Count - 1].lng * Math.PI / 180;
                LowY = pts[Count - 1].lat * Math.PI / 180;
                MiddleX = pts[0].lng * Math.PI / 180;
                MiddleY = pts[0].lat * Math.PI / 180;
                HighX = pts[1].lng * Math.PI / 180;
                HighY = pts[1].lat * Math.PI / 180;
            }
            else if (i == Count - 1) {
                LowX = pts[Count - 2].lng * Math.PI / 180;
                LowY = pts[Count - 2].lat * Math.PI / 180;
                MiddleX = pts[Count - 1].lng * Math.PI / 180;
                MiddleY = pts[Count - 1].lat * Math.PI / 180;
                HighX = pts[0].lng * Math.PI / 180;
                HighY = pts[0].lat * Math.PI / 180;
            }
            else {
                LowX = pts[i - 1].lng * Math.PI / 180;
                LowY = pts[i - 1].lat * Math.PI / 180;
                MiddleX = pts[i].lng * Math.PI / 180;
                MiddleY = pts[i].lat * Math.PI / 180;
                HighX = pts[i + 1].lng * Math.PI / 180;
                HighY = pts[i + 1].lat * Math.PI / 180;
            }
            AM = Math.cos(MiddleY) * Math.cos(MiddleX);
            BM = Math.cos(MiddleY) * Math.sin(MiddleX);
            CM = Math.sin(MiddleY);
            AL = Math.cos(LowY) * Math.cos(LowX);
            BL = Math.cos(LowY) * Math.sin(LowX);
            CL = Math.sin(LowY);
            AH = Math.cos(HighY) * Math.cos(HighX);
            BH = Math.cos(HighY) * Math.sin(HighX);
            CH = Math.sin(HighY);
            CoefficientL = (AM * AM + BM * BM + CM * CM) / (AM * AL + BM * BL + CM * CL);
            CoefficientH = (AM * AM + BM * BM + CM * CM) / (AM * AH + BM * BH + CM * CH);
            ALtangent = CoefficientL * AL - AM;
            BLtangent = CoefficientL * BL - BM;
            CLtangent = CoefficientL * CL - CM;
            AHtangent = CoefficientH * AH - AM;
            BHtangent = CoefficientH * BH - BM;
            CHtangent = CoefficientH * CH - CM;
            AngleCos = (AHtangent * ALtangent + BHtangent * BLtangent + CHtangent * CLtangent) / (Math.sqrt(AHtangent * AHtangent + BHtangent * BHtangent + CHtangent * CHtangent) * Math.sqrt(ALtangent * ALtangent + BLtangent * BLtangent + CLtangent * CLtangent));
            AngleCos = Math.acos(AngleCos);
            ANormalLine = BHtangent * CLtangent - CHtangent * BLtangent;
            BNormalLine = 0 - (AHtangent * CLtangent - CHtangent * ALtangent);
            CNormalLine = AHtangent * BLtangent - BHtangent * ALtangent;
            if (AM != 0)
                OrientationValue = ANormalLine / AM;
            else if (BM != 0)
                OrientationValue = BNormalLine / BM;
            else
                OrientationValue = CNormalLine / CM;
            if (OrientationValue > 0) {
                Sum1 += AngleCos;
                Count1++;
            }
            else {
                Sum2 += AngleCos;
                Count2++;
            }
        }
        var tempSum1, tempSum2;
        tempSum1 = Sum1 + (2 * Math.PI * Count2 - Sum2);
        tempSum2 = (2 * Math.PI * Count1 - Sum1) + Sum2;
        if (Sum1 > Sum2) {
            if ((tempSum1 - (Count - 2) * Math.PI) < 1)
                Sum = tempSum1;
            else
                Sum = tempSum2;
        }
        else {
            if ((tempSum2 - (Count - 2) * Math.PI) < 1)
                Sum = tempSum2;
            else
                Sum = tempSum1;
        }
        totalArea = (Sum - (Count - 2) * Math.PI) * Radius * Radius;

        return totalArea; //返回总面积
    }

})();//闭包结束


(function () {
    IMAP.Tool = IMAP.Class(IMAP.Events, IMAP.DOMEvents, {
        _mapDragable: !1,
        _mapDblclickZoom: !1,
        initialize: function () {
            this._id = '_ld_tool_' + IMAP.Function.createUniqueID();
            IMAP.Events.prototype.initialize.apply(this, [
            ]);
            IMAP.DOMEvents.prototype.initialize.apply(this, [
            ]);
            this._overlays = {
            };
            this._opened = !1
        },
        removeById: function (a) {
            this._map && this._overlays[a] && (this._overlayLayer.removeOverlay(this._overlays[a]), this._overlays[a] = null)
        },
        clear: function () {
            if (this._map) for (var a in this._overlays) this._overlayLayer.removeOverlay(this._overlays[a]),
                this._overlays[a] = null
        },
        setMap: function (a) {
            a instanceof IMAP.Map ? (this._map = a, this._overlayLayer = a.getOverlayLayer())  : (this._destroy(), this._map = this._overlayLayer = null)
        },
        open: function () {
            this._opened = !0
        },
        close: function () {
            this._opened = !1
        },
        _executeOpen: function () {
            var a = this._map;
            if (a) {
                var b = a.cTool;
                b && b._opened ? b._id !== this._id ? this.injectId != b.getId() && (a.cTool = this, b.close(0))  : (b.close(), a.cTool = null)  : a.cTool = this;
                a._toolOpened = !0;
                this._closeMapOper(a);
                this._opened = !0
            }
        },
        _executeClose: function () {
            var a = this,
                b = a._map;
            a._opened = !1;
            a.triggerEvent(IMAP.Constants._REMOVE_TOOL, {
                type: IMAP.Constants._REMOVE_TOOL,
                target: a
            });
            b && (b._toolOpened = !1, a._closeEditting(!0), b.getOptions(), setTimeout(function () {
                a._mapDragable && (b.dragged(!0), a._mapDragable = !1);
                a._mapDblclickZoom && (b.dblclickZoom(!0), a._mapDblclickZoom = !1)
            }, 5));
            b.cTool = null
        },
        _closeMapOper: function (a) {
            var b = a.getOptions();
            b.dragable && (a.dragged(!1), this._mapDragable = !0);
            b.dblclickZoom && (a.dblclickZoom(!1), this._mapDblclickZoom = !0)
        },
        _closeEditting: function (a) {
        },
        getId: function () {
            return this._id
        },
        _destroy: function () {
            this.close();
            this.clearListener()
        },
        _createToolTitle: function (a, b) {
            var c = document.createElement('div');
            c.style.cssText = 'background-color: #FFFFFF;border: 1px solid #4B4B4B;border-radius: 3px 3px 3px 3px;box-shadow: 2px 2px 8px #999999;font-size: 12px;line-height: 15px;opacity: 1;padding: 2px 7px;white-space: nowrap;';
            var d = document.createElement('span');
            d.innerHTML = b;
            c.appendChild(d);
            return new IMAP.Label(c, {
                type: IMAP.Constants.OVERLAY_LABEL_HTML,
                position: a,
                offset: {
                    x: 10,
                    y: 20
                },
                anchor: IMAP.Constants.LEFT_TOP
            })
        },
        getMap: function () {
            return this._map
        }
    });
    IMAP.MarkerTool = IMAP.Class(IMAP.Tool, {
        _mapMMEvt: null,
        _mapMCEvt: null,
        _mapMCMEvt: null,
        _followMarker: null,
        _followTitle: null,
        initialize: function (a) {
            IMAP.Tool.prototype.initialize.apply(this, [
            ]);
            this._icon = a;
            this.follow = !0;
            this.title = '点击左键标记位置，右键退出';
            this.editabled = !1;
            this.autoClose = !0
        },
        open: function () {
            var a = this,
                b = a._map;
            !a._opened && b && (IMAP.Tool.prototype._executeOpen.apply(a, [
            ]), !a.follow && !a.title || a._mapMMEvt || (a._mapMMEvt = b.addEventListener(IMAP.Constants.MOUSE_MOVE, function (b) {
                var d = b.lnglat;
                a._pixel = b.pixel;
                a.follow && (a._followMarker ? a._followMarker.setPosition(d)  : a._createToolMarker(d, !0));
                a.title && (a._followTitle ? a._followTitle.setPosition(d)  : (a._followTitle = a._createToolTitle(d, a.title), a._overlayLayer.addOverlay(a._followTitle, !1)))
            }, a), a._mapMMIEvt = b.addEventListener(IMAP.Constants.MOVING, function (c) {
                a._pixel && (c = b.pixelToLnglat(a._pixel), a._followMarker && a._followMarker.setPosition(c), a._followTitle && a._followTitle.setPosition(c))
            })), a._mapMCEvt || (a._mapMCEvt = b.addEventListener(IMAP.Constants.MOUSE_DOWN, function (c) {
                b && (a._createToolMarker(c.lnglat, !1), a.autoClose && (b.editEvt = null, a.close()))
            }, a), a._mapMCMEvt = b.addEventListener(IMAP.Constants.MOUSE_CONTEXTMENU, a.close, a)))
        },
        close: function () {
            var a = this._map;
            a && (delete this._pixel, this._mapMMEvt && (a.removeEventListener(this._mapMMEvt), a.removeEventListener(this._mapMMIEvt), this._mapMMIEvt = this._mapMMEvt = null), this._mapMCEvt && (a.removeEventListener(this._mapMCEvt), a.removeEventListener(this._mapMCMEvt), this._mapMCEvt = this._mapMCMEvt = null), this._followMarker && (this._overlayLayer.removeOverlay(this._followMarker), this._followMarker = null), this._followTitle && (this._overlayLayer.removeOverlay(this._followTitle), this._followTitle = null));
            IMAP.Tool.prototype._executeClose.apply(this)
        },
        editable: function (a) {
            this.editabled = a;
            for (var b in this._overlays) this._overlays[b].editable(a)
        },
        _createToolMarker: function (a, b) {
            var c = new IMAP.Marker(a, {
                editabled: this.editabled,
                icon: this._icon,
                markerColor: 'blue',
                offset: {
                    x: 0,
                    y: - 10
                }
            });
            this._overlayLayer.addOverlay(c, !1);
            b ? this._followMarker = c : (this._overlays[c.getId()] = c, this.triggerEvent(IMAP.Constants.ADD_OVERLAY, {
                type: IMAP.Constants.ADD_OVERLAY,
                target: this,
                overlay: c
            }))
        }
    });
    IMAP.PolygonTool = IMAP.Class(IMAP.Tool, {
        _mapCMEvt: null,
        _mapDBLEvt: null,
        _mapMMEvt: null,
        _editing: !1,
        _editPolygon: null,
        _tempPolyLine: null,
        _followTitle: null,
        initialize: function () {
            IMAP.Tool.prototype.initialize.apply(this, [
            ]);
            this.autoClose = !0;
            this.strokeWeight = 3;
            this.strokeOpacity = 1;
            this.editabled = !1;
            this.strokeColor = '#4169D3';
            this.fillColor = '#99FFCC';
            this.fillOpacity = 0.6;
            this.intersect = !0;
            this.title = '左键双击结束绘制'
        },
        open: function () {
            var a = this._map;
            !this._opened && a && (IMAP.Tool.prototype._executeOpen.apply(this, [
            ]), this._mapCMEvt || (this._mapCMEvt = a.addEventListener(IMAP.Constants.MOUSE_DOWN, this._mapClickEvt, this)))
        },
        _mapClickEvt: function (a) {
            var b = this,
                c = b._map;
            if (c) {
                if (b._editing) {
                    var d = c.pixelToLnglat(b._toCalculatePixel(a.pixel));
                    a = b._paths[b._paths.length - 1];
                    if (a.lng == d.lng && a.lat == d.lat) return;
                    if (!b.intersect && 2 < b._paths.length && !b._isIntersectLngLat(b._paths, d, c)) {
                        alert('多边形不能够相交，请重新选择位置。');
                        return
                    }
                    b._tempPolyLine && b._tempPolyLine.visible(!1);
                    b._paths.push(d);
                    b._editPolygon.setPath(b._paths);
                    b._tempPaths[2] = d
                } else d = a.lnglat,
                    b._mouseX = a.pixel.x,
                    b._mouseY = a.pixel.y,
                    b._editing = !0,
                    b._paths = [
                        d
                    ],
                    b._tempPaths = [
                        d
                    ],
                    b._editPolygon = b._createToolPolygon([d]),
                    b._overlayLayer.addOverlay(b._editPolygon, !1),
                b.title && (b._followTitle = b._createToolTitle(d, IMAP.Function.checkFieldLength(b.title, 40)), b._overlayLayer.addOverlay(b._followTitle, !1)),
                    a = b._createToolTempPolyline([d]),
                    b._tempPolyLine = a,
                    b._overlayLayer.addOverlay(a, !1),
                b._mapMMEvt || (b._mapMMEvt = c.addEventListener(IMAP.Constants.MOUSE_MOVE, function (a) {
                    var d = a.lnglat;
                    b._editing && (d = c.pixelToLnglat(b._toCalculatePixel(a.pixel)), b._tempPaths[1] = d, b._tempPolyLine.setPath(b._tempPaths), b._tempPolyLine.visible(!0), b._followTitle && b._followTitle.setPosition(d))
                }, b)),
                b._mapDBLEvt || (b._mapDBLEvt = c.addEventListener(IMAP.Constants.DBLCLICK, function (a) {
                    (a = b._editPolygon) && 2 < a.getPath().length ? (b._editPolygon = null, b._overlays[a.getId()] = a, a.editable(b.editabled), b.triggerEvent(IMAP.Constants.ADD_OVERLAY, {
                        type: IMAP.Constants.ADD_OVERLAY,
                        target: b,
                        overlay: a
                    }))  : b.triggerEvent(IMAP.Constants.ERROR, {
                        type: IMAP.Constants.ERROR,
                        target: b
                    });
                    b.autoClose ? b.close()  : b._closeEditting()
                }, b));
                b.triggerEvent(IMAP.Constants.ADD_NODE_END, {
                    type: IMAP.Constants.ADD_NODE_END,
                    target: b,
                    lnglat: d
                })
            }
        },
        close: function () {
            var a = this._map;
            a && (this._mapCMEvt && (a.removeEventListener(this._mapCMEvt), this._mapCMEvt = null), IMAP.Tool.prototype._executeClose.apply(this))
        },
        editable: function (a) {
            this.editabled = a;
            for (var b in this._overlays) this._overlays[b].editable(a)
        },
        _closeEditting: function (a) {
            var b = this._map;
            b && (this._followTitle && (this._overlayLayer.removeOverlay(this._followTitle), this._followTitle = null), a && (this._mapMMEvt && (b.removeEventListener(this._mapMMEvt), this._mapMMEvt = null), this._mapDBLEvt && (b.removeEventListener(this._mapDBLEvt), this._mapDBLEvt = null)));
            this._editPolygon && this._overlayLayer.removeOverlay(this._editPolygon);
            this._editPolygon = null;
            this._tempPolyLine && (this._overlayLayer.removeOverlay(this._tempPolyLine), this._tempPolyLine = null);
            this._paths = this._mouseX = this._mouseY = null;
            this._editing = !1
        },
        _toCalculatePixel: function (a) {
            var b = this.strokeWeight;
            a.x = 0 < a.x - this._mouseX ? a.x - b : a.x + b;
            a.y = 0 < a.y - this._mouseY ? a.y - b : a.y + b;
            return a
        },
        _createToolPolygon: function (a) {
            return new IMAP.Polygon(a, {
                editabled: !1,
                strokeColor: this.strokeColor,
                strokeOpacity: this.strokeOpacity,
                strokeWeight: this.strokeWeight,
                fillColor: this.fillColor,
                fillOpacity: this.fillOpacity
            })
        },
        _createToolTempPolyline: function (a) {
            return new IMAP.Polyline(a, {
                editabled: !1,
                strokeColor: '#26F50F',
                strokeOpacity: this.strokeOpacity,
                strokeWeight: this.strokeWeight,
                strokeStyle: 'nosolid'
            })
        },
        _isIntersectLngLat: function (a, b, c) {
            var d = c.lnglatToPixel(b);
            b = d.x;
            for (var e = d.y, f = [
            ], g = [
            ], k = 0; k < a.length; k++) d = c.lnglatToPixel(a[k]),
                f.push(d.x),
                g.push(d.y);
            a = f.length - 1;
            if (this._isIntersectPixel(f[0], g[0], f[1], g[1], f[a], g[a], b, e)) return !1;
            for (c = 2; c < a; c++) if (this._isIntersectPixel(f[c -
                1], g[c - 1], f[c], g[c], f[0], g[0], b, e) || this._isIntersectPixel(f[c - 1], g[c - 1], f[c], g[c], f[a], g[a], b, e)) return !1;
            return this._isIntersectPixel(f[a - 1], g[a - 1], f[a], g[a], f[0], g[0], b, e) ? !1 : !0
        },
        _isIntersectPixel: function (a, b, c, d, e, f, g, k) {
            var l = 0,
                h = 0,
                h = this._getIntersectPoi;
            return 0 != (d - b) * (g - e) - (k - f) * (c - a) ? (l = e + (g - e) * h(a, b, e, f, c, d) / (h(a, b, e, f, c, d) + h(a, b, c, d, g, k)), h = f + (k - f) * h(a, b, e, f, c, d) / (h(a, b, e, f, c, d) + h(a, b, c, d, g, k)), 0 >= (l - a) * (l - c) && 0 >= (l - e) * (l - g) && 0 >= (h - b) * (h - d) && 0 >= (h - f) * (h - k) ? !0 : !1)  : !1
        },
        _getIntersectPoi: function (a, b, c, d, e, f) {
            return (a - e) * (d - f) - (b - f) * (c - e)
        }
    });
    IMAP.AreaTool = IMAP.Class(IMAP.Tool, {
        _polygonTool: null,
        _path: [
        ],
        _labels: {
        },
        _tempLabel: null,
        _polygon: null,
        _btnEvts: {
        },
        _toolAddEvt: null,
        initialize: function () {
            IMAP.Tool.prototype.initialize.apply(this, [
            ]);
            this.autoClose = !0;
            this.title = '双击结束测面';
            this.strokeWeight = 3;
            this.strokeOpacity = 1;
            this.strokeColor = '#4169D3';
            this.fillColor = '#99FFCC';
            this.fillOpacity = 0.6
        },
        open: function () {
            var a = this,
                b = a._map;
            if (!a._opened && b) {
                var c = a._polygonTool;
                c || (c = new IMAP.PolygonTool, c.intersect = !1, c.injectId = a.getId(), b.addTool(c), a._polygonTool = c);
                IMAP.Tool.prototype._executeOpen.apply(a, [
                ]);
                a._toolAddEvt || (a._toolAddEvt = c.addEventListener(IMAP.Constants.ADD_OVERLAY, function (b) {
                    a._polygon = b.overlay;
                    a.triggerEvent(IMAP.Constants.ADD_OVERLAY, {
                        type: IMAP.Constants.ADD_OVERLAY,
                        target: a,
                        polygonId: a._polygon.getId()
                    });
                    a.autoClose ? a.close()  : a._closeEditting()
                }, a), a._toolAddErrorEvt = c.addEventListener(IMAP.Constants.ERROR, function (b) {
                    a.autoClose ? a.close()  : a._closeEditting()
                }), a._toolAddNodeEvt = c.addEventListener(IMAP.Constants.ADD_NODE_END, function (b) {
                    var c = a._path;
                    c.push(b.lnglat);
                    var f = 2 >= c.length ? 0 : IMAP.Function.calculateArea(c);
                    2 < c.length && (a._tempLabel ? (a._tempLabel.setPosition(b.lnglat), a._tempLabel.setContent(a._getLabelContent(f)))  : (a._tempLabel = a._createAreaLabel(b.lnglat, f), a._overlayLayer.addOverlay(a._tempLabel)))
                }, a));
                c.strokeWeight = a.strokeWeight;
                c.strokeOpacity = a.strokeOpacity;
                c.strokeColor = a.strokeColor;
                c.fillColor = a.fillColor;
                c.fillOpacity = a.fillOpacity;
                c.autoClose = a.autoClose;
                c.title = a.title;
                c.open()
            }
        },
        close: function () {
            var a = this._polygonTool;
            a && (a.close(), this._toolAddEvt && (a.removeEventListener(this._toolAddEvt), a.removeEventListener(this._toolAddNodeEvt), a.removeEventListener(this._toolAddErrorEvt), this._toolAddEvt = this._toolAddErrorEvt = this._toolAddNodeEvt = null), IMAP.Tool.prototype._executeClose.apply(this))
        },
        removeById: function (a) {
            this._map && (this._polygonTool && this._polygonTool.removeById(a), this._labels[a] && (this._overlayLayer.removeOverlay(this._labels[a]), this._labels[a] = null), this._btnEvts[a] && (this._btnEvts[a].onclick = null, this._btnEvts[a] = null), this.triggerEvent(IMAP.Constants.DELETE_END, {
                type: IMAP.Constants.DELETE_END,
                target: this,
                areaId: a
            }))
        },
        clear: function () {
            if (this._map) {
                this._polygonTool && this._polygonTool.clear();
                var a = this._labels,
                    b;
                for (b in a) this._overlayLayer.removeOverlay(a[b]);
                this.detachToElement(this._btnEvts);
                this._btnEvts = {
                };
                this._labels = {
                }
            }
        },
        _closeEditting: function (a) {
            this._tempLabel && (this._polygon ? (a = this._polygon.getId(), this._tempLabel.setContent(this._getLabelContent(IMAP.Function.calculateArea(this._path), a)), this._labels[a] = this._tempLabel)  : this._overlayLayer.removeOverlay(this._tempLabel), this._tempLabel = null);
            this._polygon = null;
            this._path = [
            ]
        },
        _destroy: function () {
            this._polygonTool && (this._map.removeTool(this._polygonTool), this._polygonTool = null)
        },
        _createAreaLabel: function (a, b) {
            return new IMAP.Label(this._getLabelContent(b, !1), {
                type: IMAP.Constants.OVERLAY_LABEL_HTML,
                position: a,
                offset: {
                    x: 0,
                    y: - 5
                },
                anchor: IMAP.Constants.LEFT_BOTTOM
            })
        },
        _getLabelContent: function (a, b) {
            var c = this,
                d = document.createElement('div');
            d.style.cssText = 'background-color: #FFFFFF;border: 1px solid #4B4B4B;border-radius: 3px 3px 3px 3px;box-shadow: 2px 2px 8px #999999;font-size: 12px;line-height: 15px;opacity: 1;padding: 2px 7px;white-space: nowrap;';
            var e = document.createElement('span');
            e.innerHTML = 1 > a ? (1000000 * a).toFixed(2) + '平方米' : a.toFixed(2) + '平方公里';
            d.appendChild(e);
            b && (e = document.createElement('img'), e.style.cssText = 'margin-left:3px;', e.src = IMAP.MapConfig.API_REALM_NAME + IMAP.MapConfig._MAP_CLOSE2_URL, c._addBtnEvent(e, function (a) {
                a.stop && IMAP.Event.stop(a);
                c._opened || c.removeById(b)
            }, b), d.appendChild(e));
            return d
        },
        _addBtnEvent: function (a, b, c) {
            a = {
                name: IMAP.Constants.CLICK,
                element: a,
                callback: b,
                object: this,
                stop: !0
            };
            this._btnEvts[c] = a;
            this.attachToElement([a])
        }
    });
    IMAP.CircleTool = IMAP.Class(IMAP.Tool, {
        _editing: !1,
        _editCircle: null,
        _circleToolMMEvt: null,
        _mapCircleToolMDEvt: null,
        initialize: function () {
            IMAP.Tool.prototype.initialize.apply(this, [
            ]);
            this.autoClose = !0;
            this.strokeWeight = 3;
            this.strokeOpacity = 1;
            this.strokeColor = '#4169D3';
            this.fillColor = '#99FFCC';
            this.fillOpacity = 0.6;
            this.editabled = !1;
            this.title = '左键双击结束绘制'
        },
        open: function () {
            var a = this._map;
            !this._opened && a && (IMAP.Tool.prototype._executeOpen.apply(this, [
            ]), a.isCapture = !1, this._mapCircleToolMDEvt || (this._mapCircleToolMDEvt = a.addEventListener(IMAP.Constants.MOUSE_DOWN, this._onMapPolygonToolMM, this)), a.getOptions().dragable && (a.dragged(!1), this._mapDrag = !0))
        },
        close: function () {
            var a = this._map;
            a && (a.isCapture = !0, this._mapDrag && (a.dragged(!0), this._mapDrag = null), this._mapCircleToolMDEvt && (a.removeEventListener(this._mapCircleToolMDEvt), this._mapCircleToolMDEvt = null), IMAP.Tool.prototype._executeClose.apply(this))
        },
        editable: function (a) {
            this.editabled = a;
            for (var b in this._overlays) this._overlays[b].editable(a)
        },
        _onMapPolygonToolMM: function (a) {
            var b = this._map;
            b && !this._editing && (this._circleToolMMEvt || (this._circleToolMMEvt = b.addEventListener(IMAP.Constants.MOUSE_MOVE, this._toEditCircle, this), this._circleToolMUEvt = b.addEventListener(IMAP.Constants.MOUSE_UP, this._toConfirmCircle, this)), this._editCircle = this._createToolCircle(a.lnglat, 0), this._overlayLayer.addOverlay(this._editCircle, !1), this._mouseX = a.pixel.x, this._mouseY = a.pixel.y, this._editing = !0)
        },
        _toEditCircle: function (a) {
            var b = this._map;
            this._editing && b && (a = b.pixelToLnglat(this._toCalculatePixel(a.pixel)), a = IMAP.Function.distanceByLngLat(a, this._editCircle.getCenter()), this._editCircle.setRadius(a))
        },
        _toCalculatePixel: function (a) {
            var b = this.strokeWeight + 1;
            a.x = 0 < a.x - this._mouseX ? a.x - b : a.x + b;
            a.y = 0 < a.y - this._mouseY ? a.y - b : a.y +
                b;
            return a
        },
        _toConfirmCircle: function (a) {
            a = this._map;
            var b = this._editCircle;
            this._editing = !1;
            a && b && (this._editCircle = null, this._overlays[b.getId()] = b, b.editable(this.editabled), this.triggerEvent(IMAP.Constants.ADD_OVERLAY, {
                type: IMAP.Constants.ADD_OVERLAY,
                target: this,
                overlay: b
            }), this.autoClose ? this.close()  : this._closeEditting())
        },
        _closeEditting: function (a) {
            var b = this._map;
            b && a && this._circleToolMMEvt && (b.removeEventListener(this._circleToolMMEvt), b.removeEventListener(this._circleToolMUEvt), this._circleToolMUEvt = this._circleToolMMEvt = null);
            this._editCircle && this._overlayLayer.removeOverlay(this._editCircle);
            this._mouseY = this._mouseX = this._editCircle = null;
            this._editing = !1
        },
        _createToolCircle: function (a, b) {
            return new IMAP.Circle(a, b, {
                editabled: this.editabled,
                strokeColor: this.strokeColor,
                strokeOpacity: this.strokeOpacity,
                strokeWeight: this.strokeWeight,
                fillColor: this.fillColor,
                fillOpacity: this.fillOpacity
            })
        }
    });
    IMAP.PolylineTool = IMAP.Class(IMAP.Tool, {
        initialize: function () {
            IMAP.Tool.prototype.initialize.apply(this, [
            ]);
            this.autoClose = !0;
            this.strokeWeight = 3;
            this.strokeOpacity = 1;
            this.strokeColor = '#4169D3';
            this.arrow = this.editabled = !1;
            this._cursor = null;
            this.title = '左键双击结束绘制';
            this._mapDBLEvt = this._mapMMEvt = this._mapCEvt = null;
            this._initend = !1
        },
        open: function () {
            var a = this._map;
            a && !this._opened && (IMAP.Tool.prototype._executeOpen.apply(this, [
            ]), this._initend || (this._initend = !0, this._overlays = {
            }, delete this._editLine, delete this._tempLine, delete this._followTitle, this._editing = !1), this._mapCEvt || (this._mapCEvt = a.addEventListener(IMAP.Constants.MOUSE_DOWN, this._mapClickEvt, this)))
        },
        setCursor: function (a) {
            this._cursor = a
        },
        close: function () {
            var a = this._map;
            a && (this._mapCEvt && (a.removeEventListener(this._mapCEvt), delete this._mapCEvt), delete this._mapCursor, IMAP.Tool.prototype._executeClose.apply(this))
        },
        getPolylineById: function (a) {
            return this._overlays[a]
        },
        getPolylines: function () {
            return this._overlays
        },
        removeById: function (a) {
            this._map && this._overlays[a] && (this._overlayLayer.removeOverlay(this._overlays[a]), delete this._overlays[a])
        },
        clear: function () {
            if (this._map) for (var a in this._overlays) this._overlayLayer.removeOverlay(this._overlays[a]),
                delete this._overlays[a]
        },
        editable: function (a) {
            this.editabled = a;
            for (var b in this._overlays) this._overlays[b].editable(a)
        },
        _mapClickEvt: function (a) {
            var b = this,
                c = b._map;
            if (c && a.pixel) {
                if (b._editing) {
                    var d = c.pixelToLnglat(b._toCalculatePixel(a.pixel));
                    if (b._tempSLngLat.lng == d.lng && b._tempSLngLat.lat == d.lat) return;
                    b._tempLine && b._tempLine.visible(!1);
                    b._tempSLngLat = d;
                    a = b._editLine.getPath();
                    a.push(d);
                    b._editLine.setPath(a)
                } else d = a.lnglat,
                    b._tempSLngLat = d,
                    b._editing = !0,
                    b._mouseX = a.pixel.x,
                    b._mouseY = a.pixel.y,
                    b._editLine = b._createToolPolyline([d], b.strokeColor),
                    b._overlayLayer.addOverlay(b._editLine),
                b.title && (b._followTitle = b._createToolTitle(d, IMAP.Function.checkFieldLength(b.title, 40)), b._overlayLayer.addOverlay(b._followTitle)),
                    a = b._createToolPolyline([d], '#26F50F'),
                    a.addEventListener(IMAP.Constants.CLICK, b._mapClickEvt, b),
                    b._tempLine = a,
                    b._overlayLayer.addOverlay(a),
                b._mapMMEvt || (b._mapMMEvt = c.addEventListener(IMAP.Constants.MOUSE_MOVE, function (a) {
                    b._editing && (a = c.pixelToLnglat(b._toCalculatePixel(a.pixel)), b._tempLine.setPath([b._tempSLngLat,
                        a]), b._tempLine.visible(!0), b._followTitle && b._followTitle.setPosition(a))
                }, b)),
                b._mapDBLEvt || (b._mapDBLEvt = c.addEventListener(IMAP.Constants.DBLCLICK, function (a) {
                    (a = b._editLine) ? (delete b._editLine, b._overlays[a.getId()] = a, a.editable(b.editabled), b.triggerEvent(IMAP.Constants.ADD_OVERLAY, {
                        type: IMAP.Constants.ADD_OVERLAY,
                        target: b,
                        overlay: a
                    }))  : b.triggerEvent(IMAP.Constants.ERROR, {
                        type: IMAP.Constants.ERROR,
                        target: b
                    });
                    b.autoClose ? b.close()  : b._closeEditting()
                }, b));
                b.triggerEvent(IMAP.Constants.ADD_NODE_END, {
                    type: IMAP.Constants.ADD_NODE_END,
                    target: b,
                    lineId: b._editLine.getId(),
                    lnglat: d
                })
            }
        },
        _closeEditting: function (a) {
            var b = this._map;
            b && (this._followTitle && (this._overlayLayer.removeOverlay(this._followTitle), delete this._followTitle), a && (this._mapMMEvt && (b.removeEventListener(this._mapMMEvt), delete this._mapMMEvt), this._mapDBLEvt && (b.removeEventListener(this._mapDBLEvt), delete this._mapDBLEvt)), this._tempLine && (this._overlayLayer.removeOverlay(this._tempLine), delete this._tempLine));
            this._editLine && (this._overlayLayer.removeOverlay(this._editLine), delete this._editLine, this.triggerEvent(IMAP.Constants.ERROR, {
                type: IMAP.Constants.ERROR,
                target: this
            }));
            delete this._tempSLngLat;
            this._editing = !1
        },
        _toCalculatePixel: function (a) {
            var b = this.strokeWeight;
            a.x = 0 < a.x - this._mouseX ? a.x - b : a.x + b;
            a.y = 0 < a.y - this._mouseY ? a.y - b : a.y + b;
            return a
        },
        _createToolPolyline: function (a, b) {
            b || (b = this.strokeColor);
            return new IMAP.Polyline(a, {
                editabled: !1,
                arrow: this.arrow,
                strokeColor: b,
                strokeOpacity: this.strokeOpacity,
                strokeWeight: this.strokeWeight
            })
        }
    });
    IMAP.DistanceTool = IMAP.Class(IMAP.Tool, {
        _dragging: !1,
        _btnEvts: {
        },
        _lineTool: null,
        _toolAddEvt: null,
        _toolAddNodeEvt: null,
        _nodes: {
        },
        _tips: {
        },
        _start: !1,
        _editing: !1,
        _moveMonitor: null,
        _tNode: null,
        initialize: function () {
            IMAP.Tool.prototype.initialize.apply(this, [
            ]);
            this.autoClose = !0;
            this.strokeWeight = 3;
            this.strokeOpacity = 1;
            this.strokeColor = '#4169D3';
            this.title = '左键双击结束测距'
        },
        open: function () {
            var a = this,
                b = a._map;
            if (b && !a._opened) {
                var c = a._lineTool;
                c || (c = new IMAP.PolylineTool, c.injectId = a.getId(), a._lineTool = c, b.addTool(c));
                var d = [
                    ],
                    e = - 1,
                    f = [
                    ],
                    g = [
                    ],
                    k = 0;
                a._start = !0;
                c.autoClose = a.autoClose;
                c.strokeWeight = a.strokeWeight;
                c.strokeOpacity = a.strokeOpacity;
                c.strokeColor = a.strokeColor;
                a._toolAddEvt || (a._toolAddEvt = c.addEventListener(IMAP.Constants.ADD_OVERLAY, function (b) {
                    if (b.overlay) {
                        b = b.overlay.getId();
                        a._nodes[b] = d;
                        a._tips[b] = f;
                        if (2 > d.length) a.removeById(b);
                        else {
                            var c = f[f.length - 1];
                            c && c.setContent(a._getLabelContent(c._length, !0, b, c._index));
                            a._bindNodesEvt(d);
                            a.triggerEvent(IMAP.Constants.ADD_OVERLAY, {
                                type: IMAP.Constants.ADD_OVERLAY,
                                target: a,
                                lineId: b,
                                length: c._length
                            })
                        }
                        d = [
                        ];
                        e = - 1;
                        f = [
                        ];
                        g = [
                        ];
                        k = 0;
                        a.autoClose && a.close()
                    }
                }, a), a._toolAddErrorEvt = c.addEventListener(IMAP.Constants.ERROR, function (b) {
                    if (d) {
                        b = 0;
                        for (var c = d.length; b < c; ++b) a._overlayLayer.removeOverlay(d[b])
                    }
                    if (f) for (b = 0, c = f.length; b < c; ++b) a._overlayLayer.removeOverlay(f[b]);
                    a.autoClose ? a.close()  : a._closeEditting()
                }), a._toolAddNodeEvt = c.addEventListener(IMAP.Constants.ADD_NODE_END, function (b) {
                    var c = b.lnglat;
                    b = b.lineId;
                    if (c) {
                        var m = g[g.length -
                            1],
                            m = m ? IMAP.Function.distanceByLngLat(m, c) / 1000 : 0;
                        k += m;
                        var n = ++e,
                            q = a._createToolNode(c),
                            p = a._createDisLabel(c, k, !1, b, n);
                        q._index = n;
                        p._index = n;
                        p._dis = m;
                        p._length = k;
                        q._lineId = b;
                        p._lineId = b;
                        a._overlayLayer.addOverlay(q);
                        a._overlayLayer.addOverlay(p);
                        d.push(q);
                        f.push(p);
                        g.push(c)
                    }
                    a._start || (d = [
                    ], e = - 1, f = [
                    ], g = [
                    ], k = 0, a._start = !0)
                }, this));
                c.title = a.title;
                c.open();
                a._editing = !0;
                a._moveMonitor && (b.removeEventListener(a._moveMonitor), a._moveMonitor = null)
            }
        },
        close: function () {
            var a = this._lineTool;
            a && (this._bindMapEvt(this._map), a.close(), this._toolAddEvt && (a.removeEventListener(this._toolAddEvt), a.removeEventListener(this._toolAddNodeEvt), this._toolAddEvt = this._toolAddNodeEvt = null), IMAP.Tool.prototype._executeClose.apply(this));
            this._editing = !1
        },
        removeById: function (a) {
            this._map && (this._lineTool && this._lineTool.removeById(a), this._removeNodesById(a), this.triggerEvent && this.triggerEvent(IMAP.Constants.DELETE_END, {
                type: IMAP.Constants.DELETE_END,
                target: this,
                lineId: a
            }))
        },
        clear: function () {
            if (this._map) {
                this._lineTool && this._lineTool.clear();
                for (var a in this._nodes) this._removeNodesById(a);
                this.detachToElement(this._btnEvts);
                this._btnEvts = {
                };
                this._start = !1
            }
        },
        _destroy: function () {
            this._moveMonitor && (this._map.removeEventListener(this._moveMonitor), this._moveMonitor = null);
            IMAP.Tool.prototype._executeClose.apply(this)
        },
        _closeEditting: function (a) {
            this._removeTempNode()
        },
        _bindMapEvt: function (a) {
        },
        _removeTempNode: function () {
            this._tNode && (this._overlayLayer.removeOverlay(this._tNode), this._tNode = null)
        },
        _createMoveNode: function (a, b, c, d) {
            var e = this,
                f = e._tNode;
            f ? f.setCenter(b)  : (f = e._createToolNode(b, !0), f.ep = !0, e._tNode = f, e._nodeDown = f.addEventListener(IMAP.Constants.MOUSE_DOWN, function (b) {
                e._editing = !0;
                if (!f.stop) {
                    f.stop = !0;
                    f.virtual = !1;
                    f.setAttribute({
                        strokeOpacity: 1
                    });
                    f.removeEventListener(e._nodeDown);
                    e._nodeDown = null;
                    e._tNode = null;
                    var c = a.getPath();
                    b = a.getId();
                    f._lineId = b;
                    c.splice(d, 0, f.getCenter());
                    a.setPath(c);
                    c = e._nodes[b];
                    c.splice(d, 0, f);
                    for (var l = d, h = c.length; l < h; ++l) c[l]._index = l;
                    e._nodes[b] = c;
                    var c = e._tips[b],
                        h = c[d - 1],
                        l = c[d],
                        m = IMAP.Function.distanceByLngLat(h.getPosition(), f.getCenter()) / 1000,
                        n = h._length + m,
                        h = e._createDisLabel(f.getCenter(), n, !1, b, d);
                    h._length = n;
                    h._dis = m;
                    h._lineId = b;
                    e._overlayLayer.addOverlay(h);
                    m = IMAP.Function.distanceByLngLat(f.getCenter(), l.getPosition()) / 1000;
                    l._dis = m;
                    c.splice(d, 0, h);
                    e._tips[b] = c;
                    b = d;
                    for (m = c.length; b < m - 1; ++b) h = c[b],
                        h._index = b,
                        l = c[b + 1],
                        l._length = l._dis + h._length;
                    e._bindNodeEvt(f);
                    e._editing = !1
                }
            }, e), e._overlayLayer.addOverlay(f))
        },
        _bindNodesEvt: function (a) {
            if (a) for (var b = 0, c = a.length; b <
            c; ++b) this._bindNodeEvt(a[b])
        },
        _bindNodeEvt: function (a) {
            var b = this;
            a.ep = !1;
            a.stop = !1;
            a.addEventListener(IMAP.Constants.DRAG_ING, function (c) {
                b._editing = !0;
                c = a._lineId;
                var d = b._tips[c];
                if (d) {
                    var e = d.length,
                        f = a._index,
                        g,
                        k = d[f];
                    g = b._lineTool.getPolylineById(c);
                    var l = a.getCenter();
                    k.setPosition(l);
                    var h = g.getPath();
                    h[f] = l;
                    g.setPath(h);
                    if (h = d[f - 1]) g = h ? IMAP.Function.distanceByLngLat(h.getPosition(), l) / 1000 : 0,
                        k._dis = g,
                        k._length = g + h._length;
                    if (h = d[f + 1]) {
                        g = IMAP.Function.distanceByLngLat(l, h.getPosition()) / 1000;
                        h._dis = g;
                        for (h._length = h._dis + k._length; f < e - 1; ++f) k = d[f],
                            h = d[f + 1],
                            h._length = h._dis + k._length,
                            k.setContent(b._getLabelContent(k._length, !1, c, f));
                        d[e - 1].setContent(b._getLabelContent(d[e - 1]._length, !0, c, e - 1))
                    } else k.setContent(b._getLabelContent(k._length, !0, c, k._index))
                }
            }, b);
            a.addEventListener(IMAP.Constants.DRAG_END, function (a) {
                b._editing = !1
            });
            a.addEventListener(IMAP.Constants.MOUSE_UP, function (a) {
                b._editing = !1
            });
            a.addEventListener(IMAP.Constants.CLICK, function (a) {
                b._editing = !1
            })
        },
        _removeNodesById: function (a) {
            var b = this._overlayLayer,
                c = this._nodes[a];
            if (c) {
                for (var d = 0, e = c.length; d < e; ++d) b.removeOverlay(c[d]);
                this._nodes[a] = null
            }
            d = this._tips[a];
            if (c) {
                c = 0;
                for (e = d.length; c < e; ++c) b.removeOverlay(d[c]);
                this._tips[a] = null
            }
            this._btnEvts[a] && (this.detachToElement([this._btnEvts[a]]), this.mapMouseDown = null, this._btnEvts[a] = null)
        },
        _createDisLabel: function (a, b, c, d, e) {
            a = new IMAP.Label(this._getLabelContent(b, c, d, e), {
                type: IMAP.Constants.OVERLAY_LABEL_HTML,
                position: a,
                offset: {
                    x: 5,
                    y: - 10
                },
                anchor: IMAP.Constants.LEFT_BOTTOM
            });
            a.stop = !1;
            return a
        },
        _getLabelContent: function (a, b, c, d) {
            var e = this,
                f = document.createElement('div');
            f.style.cssText = 'background-color: #FFFFFF;border: 1px solid #4B4B4B;border-radius: 3px 3px 3px 3px;box-shadow: 2px 2px 8px #999999;font-size: 12px;line-height: 15px;opacity: 1;padding: 2px 7px;white-space: nowrap;';
            var g = document.createElement('span');
            g.innerHTML = 0 == a ? '起点' : 1 < a ? a.toFixed(2) + '公里' : (1000 * a).toFixed(2) + '米';
            f.appendChild(g);
            a = document.createElement('img');
            a.style.cssText = 'margin-left:3px;font-size:12px;cursor:pointer;';
            a.src = IMAP.MapConfig.API_REALM_NAME + IMAP.MapConfig._MAP_CLOSE1_URL;
            e._addBtnEvent(a, function (a) {
                e._opened || (e._removeNode(c, d), e._removeTempNode())
            }, c);
            f.appendChild(a);
            b && (b = document.createElement('img'), b.style.cssText = 'margin-left:3px;cursor:pointer;', b.src = IMAP.MapConfig.API_REALM_NAME + IMAP.MapConfig._MAP_CLOSE2_URL, e._addBtnEvent(b, function (a) {
                e._opened || e.removeById(c)
            }, c), f.appendChild(b));
            return f
        },
        _removeNode: function (a, b) {
            var c = this._nodes[a],
                d = this._tips[a],
                e = this._lineTool.getPolylineById(a);
            if (c && d && e) if (2 == c.length) this.removeById(a);
            else {
                var f = e.getPath();
                f.splice(b, 1);
                e.setPath(f);
                this._overlayLayer.removeOverlay(c[b]);
                this._overlayLayer.removeOverlay(d[b]);
                c.splice(b, 1);
                d.splice(b, 1);
                for (var e = c.length, f = d[b], g = d[b - 1], k = f ? b : b - 1, l = k; l < e; ++l) c[l]._index = l;
                f && (c = g ? IMAP.Function.distanceByLngLat(g.getPosition(), f.getPosition()) / 1000 : 0, f._dis = c, f._length = g ? g._length + c : 0);
                for (g = k; g < e - 1; ++g) f = d[g],
                    f._index = g,
                    c = d[g + 1],
                    c._length = c._dis + f._length,
                    f.setContent(this._getLabelContent(f._length, !1, a, g));
                d[e - 1].setContent(this._getLabelContent(d[e - 1]._length, !0, a, e - 1))
            }
        },
        _addBtnEvent: function (a, b, c) {
            a = {
                name: IMAP.Constants.CLICK,
                element: a,
                callback: b,
                object: this,
                stop: !0
            };
            this._btnEvts[c] = a;
            this.attachToElement([a])
        },
        _createToolNode: function (a, b) {
            var c = new IMAP.Circle(a, 6, {
                editabled: !1,
                strokeColor: '#000000',
                strokeWeight: 2,
                strokeOpacity: b ? 0.6 : 1,
                fillOpacity: 1,
                fillColor: '#ffffff'
            });
            c.visibleEditNode(!1);
            c.zIndex = 150;
            c.setUnits('pixel');
            return c
        }
    });
    IMAP.RectangleTool = IMAP.Class(IMAP.Tool, {
        _editing: !1,
        _editRect: null,
        _rectToolMMEvt: null,
        _mapRectToolMDEvt: null,
        initialize: function () {
            IMAP.Tool.prototype.initialize.apply(this, [
            ]);
            this.autoClose = !0;
            this.strokeWeight = 2;
            this.strokeOpacity = 1;
            this.strokeColor = '#4169D3';
            this.fillColor = '#99FFCC';
            this.fillOpacity = 0.6;
            this.editabled = !1
        },
        setCursor: function (a) {
        },
        open: function (a) {
            a = this._map;
            !this._opened && a && (IMAP.Tool.prototype._executeOpen.apply(this, [
            ]), a.isCapture = !1, this._mapRectToolMDEvt || (this._mapRectToolMDEvt = a.addEventListener(IMAP.Constants.MOUSE_DOWN, this._onMapRectToolMM, this)), a.getOptions().dragable && (a.dragged(!1), this._mapDrag = !0))
        },
        close: function () {
            var a = this._map;
            a && (this._mapDrag && (a.dragged(!0), delete this._mapDrag), a.isCapture = !0, this._mapRectToolMDEvt && (a.removeEventListener(this._mapRectToolMDEvt), this._mapRectToolMDEvt = null), this._executeClose.apply(this))
        },
        editable: function (a) {
            this.editabled = a;
            for (var b in this._overlays) this._overlays[b].editable(a)
        },
        _onMapRectToolMM: function (a) {
            var b = this._map;
            b && !this._editing && (this._rectToolMMEvt || (this._rectToolMMEvt = b.addEventListener(IMAP.Constants.MOUSE_MOVE, this._toEditRect, this), this._rectToolMUEvt = b.addEventListener(IMAP.Constants.MOUSE_UP, this._toConfirmRect, this)), this._startLnglat = a.lnglat, this._editRect = this._createToolRectangle(new IMAP.LngLatBounds(this._startLnglat, this._startLnglat)), this._overlayLayer.addOverlay(this._editRect), this._editing = !0)
        },
        _toEditRect: function (a) {
            var b = this._map;
            this._editing && b && (b = a.lnglat, a = new IMAP.LngLat(Math.min(b.lng, this._startLnglat.lng), Math.min(b.lat, this._startLnglat.lat)), b = new IMAP.LngLat(Math.max(b.lng, this._startLnglat.lng), Math.max(b.lat, this._startLnglat.lat)), this._editRect.setBounds(new IMAP.LngLatBounds(a, b)))
        },
        _toConfirmRect: function (a) {
            if (this._map) {
                if (a = this._editRect) this._editRect = null,
                    this._overlays[a.getId()] = a,
                    a.editable(this.editabled),
                    this.triggerEvent(IMAP.Constants.ADD_OVERLAY, {
                        type: IMAP.Constants.ADD_OVERLAY,
                        target: this,
                        overlay: a
                    });
                this.autoClose ? this.close()  : this._closeEditting()
            }
        },
        _closeEditting: function (a) {
            var b = this._map;
            b && a && this._rectToolMMEvt && (b.removeEventListener(this._rectToolMMEvt), b.removeEventListener(this._rectToolMUEvt), this._rectToolMUEvt = this._rectToolMMEvt = null);
            this._editRect && (this._overlayLayer.removeOverlay(this._editRect), this._editRect = null);
            this._startLnglat = null;
            this._editing = !1
        },
        _createToolRectangle: function (a) {
            return new IMAP.Rectangle(a, {
                editabled: this.editabled,
                strokeColor: this.strokeColor,
                strokeOpacity: this.strokeOpacity,
                strokeWeight: this.strokeWeight,
                fillColor: this.fillColor,
                fillOpacity: this.fillOpacity
            })
        },
        _executeClose: function () {
            var a = this._map;
            this._opened = !1;
            this.triggerEvent(IMAP.Constants._REMOVE_TOOL, {
                type: IMAP.Constants._REMOVE_TOOL,
                target: this
            });
            a && (a._toolOpened = !1, this._closeEditting(!0), a.getOptions(), this._mapDragable && (a.dragged(!0), this._mapDragable = !1), this._mapDblclickZoom && (a.dblclickZoom(!0), this._mapDblclickZoom = !1));
            a.cTool = null
        }
    });
    IMAP.ArbitraryTool = IMAP.Class(IMAP.Tool, {
        _editing: !1,
        _editArbiLine: null,
        _editArbiPoly: null,
        _arbiToolMMEvt: null,
        _mapArbiToolMDEvt: null,
        initialize: function () {
            IMAP.Tool.prototype.initialize.apply(this, []);
            this.autoClose = !0;
            this.strokeWeight = 2;
            this.strokeOpacity = 1;
            this.strokeColor = '#4169D3';
            this.fillColor = '#99FFCC';
            this.fillOpacity = 0.6;
            this.editabled = !1
        },
        setCursor: function (a) {},
        open: function (a) {
            a = this._map;
            !this._opened && a && (IMAP.Tool.prototype._executeOpen.apply(this, []),
                a.isCapture = !1,
                this._mapArbiToolMDEvt ||
                (this._mapArbiToolMDEvt = a.addEventListener(IMAP.Constants.MOUSE_DOWN, this._onMapArbiToolMM, this)),
                a.getOptions().dragable && (a.dragged(!1), this._mapDrag = !0));
        },
        close: function () {
            var a = this._map;
            a && (this._mapDrag && (a.dragged(!0), delete this._mapDrag), a.isCapture = !0, this._mapArbiToolMDEvt && (a.removeEventListener(this._mapArbiToolMDEvt), this._mapArbiToolMDEvt = null), this._executeClose.apply(this))
        },
        _onMapArbiToolMM: function (a) {
            this._editLine = [a.lnglat];

            var b = this._map;
            b && !this._editing &&
            (this._arbiToolMMEvt ||
                (this._arbiToolMMEvt = b.addEventListener(IMAP.Constants.MOUSE_MOVE, this._toEditArbi, this),
                    this._arbiToolMUEvt = b.addEventListener(IMAP.Constants.MOUSE_UP, this._toConfirmArbi, this)),
                this._editArbiLine = this._createArbiLine(this._editLine),
                this._overlayLayer.addOverlay(this._editArbiLine),
                this._editing = !0)
        },
        _toEditArbi: function (a) {
            this._editLine.push(a.lnglat);
            var b = this._map;
            this._editing && b && this._editArbiLine.setPath(this._editLine)
        },
        _toConfirmArbi: function (a) {
            this._editLine.push(this._editLine[0]);
            this._editArbiLine.setPath(this._editLine);
            this._editArbiPoly = this._createArbiPoly(this._editLine);
            this._overlayLayer.addOverlay(this._editArbiPoly);
            this._overlayLayer.removeOverlay(this._editArbiLine);
            this._editArbiLine = null;

            if (a = this._editArbiPoly) this._editArbiPoly = null,
                this._overlays[a.getId()] = a,
                this.triggerEvent(IMAP.Constants.ADD_OVERLAY, {
                    type: IMAP.Constants.ADD_OVERLAY,
                    target: this,
                    overlay: a
                });
            this.autoClose ? this.close()  : this._closeEditting()
        },
        _closeEditting: function (a) {
            var b = this._map;
            b && a && this._arbiToolMMEvt && (b.removeEventListener(this._arbiToolMMEvt), b.removeEventListener(this._arbiToolMUEvt), this._arbiToolMUEvt = this._arbiToolMMEvt = null);
            this._editArbiPoly && (this._overlayLayer.removeOverlay(this._editArbiPoly), this._editArbiPoly = null);
            this._editing = !1
        },
        _createArbiPoly: function (a) {
            return new IMAP.Polygon(a, {
                editabled: this.editabled,
                strokeColor: this.strokeColor,
                strokeOpacity: this.strokeOpacity,
                strokeWeight: this.strokeWeight,
                fillColor: this.fillColor,
                fillOpacity: this.fillOpacity
            })
        },
        _createArbiLine: function (a) {
            return new IMAP.Polyline(a, {
                editabled: this.editabled,
                strokeColor: this.strokeColor,
                strokeOpacity: this.strokeOpacity,
                strokeWeight: this.strokeWeight,
                fillColor: this.fillColor,
                fillOpacity: this.fillOpacity
            })
        },
        _executeClose: function () {
            var a = this._map;
            this._opened = !1;
            this.triggerEvent(IMAP.Constants._REMOVE_TOOL, {
                type: IMAP.Constants._REMOVE_TOOL,
                target: this
            });
            a && (a._toolOpened = !1, this._closeEditting(!0), a.getOptions(), this._mapDragable && (a.dragged(!0), this._mapDragable = !1), this._mapDblclickZoom && (a.dblclickZoom(!0), this._mapDblclickZoom = !1));
            a.cTool = null
        }
    });
    IMAP.ZoomTool = IMAP.Class(IMAP.Tool, {
        _rectTool: null,
        _zoomToolAddEvt: null,
        initialize: function (a) {
            IMAP.Tool.prototype.initialize.apply(this, [
            ]);
            this.autoClose = !0;
            this.zoomType = a || IMAP.Constants.TOOL_ZOOM_IN
        },
        open: function () {
            var a = this,
                b = a._map;
            if (b && !a._opened) {
                var c = a._rectTool;
                c || (c = new IMAP.RectangleTool, c.injectId = a.getId(), b.addTool(c), a._rectTool = c);
                a._zoomToolAddEvt || (a._zoomToolAddEvt = c.addEventListener(IMAP.Constants.ADD_OVERLAY, function (d) {
                    if ((d = d.overlay) && b) {
                        var e = d.getBounds(),
                            f = b.getSize(),
                            g = new IMAP.LngLat(Math.min(e.southwest.lng, e.northeast.lng), Math.min(e.southwest.lat, e.northeast.lat)),
                            k = new IMAP.LngLat(Math.max(e.southwest.lng, e.northeast.lng), Math.max(e.southwest.lat, e.northeast.lat)),
                            g = b.lnglatToPixel(g),
                            k = b.lnglatToPixel(k),
                            l = e.getCenter(),
                            f = Math.min(f.width / Math.abs(k.x - g.x), f.height / Math.abs(k.y - g.y));
                        isNaN(f) || (a.zoomType == IMAP.Constants.TOOL_ZOOM_IN ? b.setBounds(e)  : a.zoomType == IMAP.Constants.TOOL_ZOOM_OUT && (e = Math.round(b.getZoom() + Math.log(1 / f) / Math.log(2)), e > b.getZoom() ? e = b.getZoom()  : e == b.getZoom() && e--, e < b.getOptions().minZoom && (e = b.getOptions().minZoom), b.getOptions().center = l, b.setZoom(e)));
                        c.removeById(d.getId())
                    }
                    a.autoClose && a.close()
                }, a));
                c.autoClose = a.autoClose;
                c.open()
            }
        },
        close: function () {
            var a = this._rectTool;
            a && (a.close(), this._zoomToolAddEvt && (a.removeEventListener(this._zoomToolAddEvt), this._zoomToolAddEvt = null))
        },
        _destroy: function () {
            this._rectTool && (this._map.removeTool(this._rectTool), this._rectTool = null)
        }
    })
}) ();