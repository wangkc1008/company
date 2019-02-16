//==== MarkerTool_min.js=============================
var BMapLib = window.BMapLib = BMapLib || {};
if (typeof BMapLib._toolInUse == 'undefined') {
    BMapLib._toolInUse = false
}
(function() {
    var a = a || {
            guid: '$BAIDU$'
        };
    (function() {
        window[a.guid] = {};
        a.extend = function(e, c) {
            for (var d in c) {
                if (c.hasOwnProperty(d)) {
                    e[d] = c[d]
                }
            }
            return e
        };
        a.lang = a.lang || {};
        a.lang.guid = function() {
            return 'TANGRAM__' + (window[a.guid]._counter++).toString(36)
        };
        window[a.guid]._counter = window[a.guid]._counter || 1;
        window[a.guid]._instances = window[a.guid]._instances || {};
        a.lang.Class = function(c) {
            this.guid = c || a.lang.guid();
            window[a.guid]._instances[this.guid] = this
        };
        a.lang.isString = function(c) {
            return '[object String]' == Object.prototype.toString.call(c)
        };
        a.lang.isFunction = function(c) {
            return '[object Function]' == Object.prototype.toString.call(c)
        };
        a.lang.Class.prototype.toString = function() {
            return '[object ' + (this._className || 'Object') + ']'
        };
        a.lang.Class.prototype.dispose = function() {
            delete window[a.guid]._instances[this.guid];
            for (var c in this) {
                if (!a.lang.isFunction(this[c])) {
                    delete this[c]
                }
            }
            this.disposed = true
        };
        a.lang.Event = function(c, d) {
            this.type = c;
            this.returnValue = true;
            this.target = d || null;
            this.currentTarget = null
        };
        a.lang.Class.prototype.addEventListener = function(f, e, d) {
            if (!a.lang.isFunction(e)) {
                return
            }
            !this.__listeners && (this.__listeners = {});
            var c = this.__listeners,
                g;
            if (typeof d == 'string' && d) {
                if (/[^\w\-]/.test(d)) {
                    throw ('nonstandard key:' + d)
                } else {
                    e.hashCode = d;
                    g = d
                }
            }
            f.indexOf('on') != 0 && (f = 'on' + f);
            typeof c[f] != 'object' && (c[f] = {});
            g = g || a.lang.guid();
            e.hashCode = g;
            c[f][g] = e
        };
        a.lang.Class.prototype.removeEventListener = function(e, d) {
            if (a.lang.isFunction(d)) {
                d = d.hashCode
            } else {
                if (!a.lang.isString(d)) {
                    return
                }
            }
            !this.__listeners && (this.__listeners = {});
            e.indexOf('on') != 0 && (e = 'on' + e);
            var c = this.__listeners;
            if (!c[e]) {
                return
            }
            c[e][d] && delete c[e][d]
        };
        a.lang.Class.prototype.dispatchEvent = function(f, c) {
            if (a.lang.isString(f)) {
                f = new a.lang.Event(f)
            }
            !this.__listeners && (this.__listeners = {});
            c = c || {};
            for (var e in c) {
                f[e] = c[e]
            }
            var e, d = this.__listeners,
                g = f.type;
            f.target = f.target || this;
            f.currentTarget = this;
            g.indexOf('on') != 0 && (g = 'on' + g);
            a.lang.isFunction(this[g]) && this[g].apply(this, arguments);
            if (typeof d[g] == 'object') {
                for (e in d[g]) {
                    d[g][e].apply(this, arguments)
                }
            }
            return f.returnValue
        };
        a.lang.inherits = function(i, g, f) {
            var e, h, c = i.prototype,
                d = new Function();
            d.prototype = g.prototype;
            h = i.prototype = new d();
            for (e in c) {
                h[e] = c[e]
            }
            i.prototype.constructor = i;
            i.superClass = g.prototype;
            if ('string' == typeof f) {
                h._className = f
            }
        }
    })();
    var b = BMapLib.MarkerTool = function(d, c) {
        a.lang.Class.call(this);
        this._map = d;
        this._opts = {
            icon: b.SYS_ICONS[8],
            followText: '点击地图添加标注',
            autoClose: true
        };
        a.extend(this._opts, c);
        this._isOpen = false;
        this._opts.followText = this._checkStr(this._opts.followText);
        this._followMarker = null;
        this._followLabel = null
    };
    a.lang.inherits(b, a.lang.Class, 'MarkerTool');
    b.prototype.open = function() {
        if (!this._map) {
            return false
        }
        if (this._isOpen == true) {
            return true
        }
        if (BMapLib._toolInUse) {
            return false
        }
        BMapLib._toolInUse = true;
        this._isOpen = true;
        if (!this._binded) {
            this._bind();
            this._binded = true
        }
        if (!this._followMarker) {
            this._followMarker = new BMap.Marker(this._map.getCenter(), {
                offset: new BMap.Size(-10, -10)
            });
            this._map.addOverlay(this._followMarker);
            this._followMarker.setZIndex(1000);
            this._followMarker.hide()
        }
        if (!this._followLabel) {
            this._followLabel = new BMap.Label(this._opts.followText, {
                offset: new BMap.Size(20, 0)
            })
        }
        this._preCursor = this._map.getDefaultCursor();
        this._map.setDefaultCursor('url(' + b.CUR_IMG + '), default');
        return true
    };
    b.prototype.close = function() {
        if (!this._isOpen) {
            return
        }
        this._map.removeEventListener('mousemove', this._mouseMoveHandler);
        this._map.removeEventListener('click', this._clickHandler);
        this._followMarker.hide();
        this._map.setDefaultCursor(this._preCursor);
        BMapLib._toolInUse = false;
        this._isOpen = false;
        this._binded = false
    };
    b.prototype.setIcon = function(c) {
        if (!c || !(c instanceof BMap.Icon)) {
            return
        }
        this._opts.icon = c
    };
    b.prototype.getIcon = function() {
        return this._opts.icon
    };
    b.prototype._checkStr = function(c) {
        if (!c) {
            return ''
        }
        return c.replace(/</g, '&lt;').replace(/>/g, '&gt;')
    };
    b.prototype._bind = function() {
        var c = this;
        if (!c._isOpen) {
            return
        }
        c._mouseMoveHandler = function(d) {
            var e = d.point;
            c._followMarker.setIcon(c._opts.icon);
            c._followMarker.setPosition(e);
            c._followMarker.setLabel(c._followLabel);
            c._followMarker.show()
        };
        c._map.addEventListener('mousemove', c._mouseMoveHandler);
        c._clickHandler = function(d) {
            var i = d.pixel;
            var g = new BMap.Pixel(i.x - 10, i.y - 10);
            var h = c._map.pixelToPoint(g);
            var e = new BMap.Marker(h, {
                icon: c._opts.icon
            });
            c._map.addOverlay(e);
            var f = new a.lang.Event('onmarkend');
            f.marker = e;
            c.dispatchEvent(f);
            if (c._opts.autoClose) {
                c.close()
            }
        };
        c._map.addEventListener('click', c._clickHandler)
    };
    b.CUR_IMG = staticsUrl + '/resources/images/transparent.cur';
    b.ICON_IMG = staticsUrl + '/resources/images/us_mk_icon.png';
    b.SYS_ICONS = [
        new BMap.Icon(b.ICON_IMG, new BMap.Size(21, 21), {
            anchor: new BMap.Size(6, 21),
            imageOffset: new BMap.Size(0, 0)
        }), new BMap.Icon(b.ICON_IMG, new BMap.Size(21, 21), {
            anchor: new BMap.Size(6, 21),
            imageOffset: new BMap.Size(-23, 0)
        }), new BMap.Icon(b.ICON_IMG, new BMap.Size(21, 21), {
            anchor: new BMap.Size(6, 21),
            imageOffset: new BMap.Size(-46, 0)
        }), new BMap.Icon(b.ICON_IMG, new BMap.Size(21, 21), {
            anchor: new BMap.Size(6, 21),
            imageOffset: new BMap.Size(-69, 0)
        }), new BMap.Icon(b.ICON_IMG, new BMap.Size(21, 21), {
            anchor: new BMap.Size(6, 21),
            imageOffset: new BMap.Size(-92, 0)
        }), new BMap.Icon(b.ICON_IMG, new BMap.Size(21, 21), {
            anchor: new BMap.Size(6, 21),
            imageOffset: new BMap.Size(-115, 0)
        }), new BMap.Icon(b.ICON_IMG, new BMap.Size(23, 25), {
            anchor: new BMap.Size(9, 25),
            imageOffset: new BMap.Size(0, -21)
        }), new BMap.Icon(b.ICON_IMG, new BMap.Size(23, 25), {
            anchor: new BMap.Size(9, 25),
            imageOffset: new BMap.Size(-23, -21)
        }), new BMap.Icon(b.ICON_IMG, new BMap.Size(23, 25), {
            anchor: new BMap.Size(9, 25),
            imageOffset: new BMap.Size(-46, -21)
        }), new BMap.Icon(b.ICON_IMG, new BMap.Size(23, 25), {
            anchor: new BMap.Size(9, 25),
            imageOffset: new BMap.Size(-69, -21)
        }), new BMap.Icon(b.ICON_IMG, new BMap.Size(23, 25), {
            anchor: new BMap.Size(9, 25),
            imageOffset: new BMap.Size(-92, -21)
        }), new BMap.Icon(b.ICON_IMG, new BMap.Size(23, 25), {
            anchor: new BMap.Size(9, 25),
            imageOffset: new BMap.Size(-115, -21)
        }), new BMap.Icon(b.ICON_IMG, new BMap.Size(21, 21), {
            anchor: new BMap.Size(1, 21),
            imageOffset: new BMap.Size(0, -46)
        }), new BMap.Icon(b.ICON_IMG, new BMap.Size(21, 21), {
            anchor: new BMap.Size(1, 21),
            imageOffset: new BMap.Size(-23, -46)
        }), new BMap.Icon(b.ICON_IMG, new BMap.Size(21, 21), {
            anchor: new BMap.Size(1, 21),
            imageOffset: new BMap.Size(-46, -46)
        }), new BMap.Icon(b.ICON_IMG, new BMap.Size(21, 21), {
            anchor: new BMap.Size(1, 21),
            imageOffset: new BMap.Size(-69, -46)
        }), new BMap.Icon(b.ICON_IMG, new BMap.Size(21, 21), {
            anchor: new BMap.Size(1, 21),
            imageOffset: new BMap.Size(-92, -46)
        }), new BMap.Icon(b.ICON_IMG, new BMap.Size(21, 21), {
            anchor: new BMap.Size(1, 21),
            imageOffset: new BMap.Size(-115, -46)
        }), new BMap.Icon(b.ICON_IMG, new BMap.Size(25, 25), {
            anchor: new BMap.Size(12, 25),
            imageOffset: new BMap.Size(0, -67)
        }), new BMap.Icon(b.ICON_IMG, new BMap.Size(25, 25), {
            anchor: new BMap.Size(12, 25),
            imageOffset: new BMap.Size(-25, -67)
        }), new BMap.Icon(b.ICON_IMG, new BMap.Size(24, 25), {
            anchor: new BMap.Size(12, 25),
            imageOffset: new BMap.Size(-50, -67)
        }), new BMap.Icon(b.ICON_IMG, new BMap.Size(25, 25), {
            anchor: new BMap.Size(12, 25),
            imageOffset: new BMap.Size(-75, -67)
        }), new BMap.Icon(b.ICON_IMG, new BMap.Size(25, 25), {
            anchor: new BMap.Size(12, 25),
            imageOffset: new BMap.Size(-100, -67)
        }), new BMap.Icon(b.ICON_IMG, new BMap.Size(19, 25), {
            anchor: new BMap.Size(9, 25),
            imageOffset: new BMap.Size(-125, -67)
        })]
})();

//==== SearchInRectangle_min.js=============================
var BMapLib = window.BMapLib = BMapLib || {};
(function() {
    var d = 0;
    var i = BMapLib.SearchInRectangle = function(m, n, l) {
        if (!m) {
            return
        }
        this._map = m;
        this._searchWords = n;
        this._opts = {
            map: m,
            followText: '',
            strokeWeight: 2,
            strokeColor: '#111',
            style: 'solid',
            fillColor: '#ccc',
            opacity: 0.4,
            cursor: 'crosshair',
            autoClose: true,
            autoViewport: false,
            alwaysShowOverlay: true,
            panel: '',
            selectFirstResult: 'false',
            _zoomType: d
        };
        this._setOptions(l);
        this._opts.strokeWeight = this._opts.strokeWeight <= 0 ? 1 : this._opts.strokeWeight;
        this._opts.opacity = this._opts.opacity < 0 ? 0 : this._opts.opacity > 1 ? 1 : this._opts.opacity;
        this._isOpen = false;
        this._fDiv = null;
        this._followTitle = null;
        this._overlay = null;
        this.local = this.localSearch(this)
    };
    i.prototype._setOptions = function(l) {
        if (!l) {
            return
        }
        if (l.renderOptions) {
            for (var m in l.renderOptions) {
                if (typeof(l.renderOptions[m]) != 'undefined') {
                    this._opts[m] = l.renderOptions[m]
                }
            }
        }
        if (l.onSearchComplete) {
            this._opts.onSearchComplete = l.onSearchComplete
        }
    };
    i.prototype.setStrokeColor = function(l) {
        if (typeof l == 'string') {
            this._opts.strokeColor = l;
            this._updateStyle()
        }
    };
    i.prototype.setLineStroke = function(l) {
        if (typeof l == 'number' && Math.round(l) > 0) {
            this._opts.strokeWeight = Math.round(l);
            this._updateStyle()
        }
    };
    i.prototype.setLineStyle = function(l) {
        if (l == 'solid' || l == 'dashed') {
            this._opts.style = l;
            this._updateStyle()
        }
    };
    i.prototype.setOpacity = function(l) {
        if (typeof l == 'number' && l >= 0 && l <= 1) {
            this._opts.opacity = l;
            this._updateStyle()
        }
    };
    i.prototype.setFillColor = function(l) {
        this._opts.fillColor = l;
        this._updateStyle()
    };
    i.prototype.setCursor = function(l) {
        this._opts.cursor = l;
        e.setCursor(this._opts.cursor)
    };
    i.prototype._updateStyle = function() {
        if (this._fDiv) {
            this._fDiv.style.border = [this._opts.strokeWeight, 'px ', this._opts.style, ' ', this._opts.color].join('');
            var l = this._fDiv.style,
                m = this._opts.opacity;
            l.opacity = m;
            l.MozOpacity = m;
            l.KhtmlOpacity = m;
            l.filter = 'alpha(opacity=' + (m * 100) + ')'
        }
    };
    i.prototype.getCursor = function() {
        return this._opts.cursor
    };
    i.prototype._bind = function() {
        this.setCursor(this._opts.cursor);
        var m = this;
        c(this._map.getContainer(), 'mousemove',
            function(p) {
                if (!m._isOpen) {
                    return
                }
                if (!m._followTitle) {
                    return
                }
                p = window.event || p;
                var n = p.target || p.srcElement;
                if (n != e.getDom(m._map)) {
                    m._followTitle.hide();
                    return
                }
                if (!m._mapMoving) {
                    m._followTitle.show()
                }
                var o = e.getDrawPoint(p, true);
                m._followTitle.setPosition(o)
            });
        if (this._opts.followText) {
            var l = this._followTitle = new BMap.Label(this._opts.followText, {
                offset: new BMap.Size(14, 16),
                enableMassClear: false
            });
            this._followTitle.setStyles({
                color: '#333',
                borderColor: '#ff0103'
            })
        }
    };
    i.prototype.open = function() {
        if (this._isOpen == true) {
            return true
        }
        if (!!BMapLib._toolInUse) {
            return
        }
        BMapLib._toolInUse = true;
        this._isOpen = true;
        if (!this.binded) {
            this._bind();
            this.binded = true
        }
        if (this._followTitle) {
            this._map.addOverlay(this._followTitle);
            this._followTitle.hide()
        }
        var n = this;
        var o = this._map;
        var p = 0;
        if (/msie (\d+\.\d)/i.test(navigator.userAgent)) {
            p = document.documentMode || +RegExp['\x241']
        }
        var r = 0;
        var m = function(s) {
            s = window.event || s;
            if (s.button != 0 && !p || p && s.button != 1) {
                return
            }
            if (!!p && e.getDom(o).setCapture) {
                e.getDom(o).setCapture()
            }
            if (!n._isOpen) {
                return
            }
            r = 0;
            n._bind.isZooming = true;
            c(document, 'mousemove', l);
            c(document, 'mouseup', q);
            n._bind.mx = s.layerX || s.offsetX || 0;
            n._bind.my = s.layerY || s.offsetY || 0;
            n._bind.ix = s.pageX || s.clientX || 0;
            n._bind.iy = s.pageY || s.clientY || 0;
            a(e.getDom(o), 'beforeBegin', n._generateHTML());
            n._fDiv = e.getDom(o).previousSibling;
            n._fDiv.style.width = '0';
            n._fDiv.style.height = '0';
            n._fDiv.style.left = n._bind.mx + 'px';
            n._fDiv.style.top = n._bind.my + 'px';
            b(s);
            return g(s)
        };
        var l = function(z) {
            if (n._isOpen == true && n._bind.isZooming == true) {
                if (n._overlay) {
                    n._map.removeOverlay(n._overlay)
                }
                var z = window.event || z;
                var u = z.pageX || z.clientX || 0;
                var s = z.pageY || z.clientY || 0;
                var w = n._bind.dx = u - n._bind.ix;
                var t = n._bind.dy = s - n._bind.iy;
                var v = Math.abs(w) - n._opts.strokeWeight;
                var y = Math.abs(t) - n._opts.strokeWeight;
                n._fDiv.style.width = (v < 0 ? 0 : v) + 'px';
                n._fDiv.style.height = (y < 0 ? 0 : y) + 'px';
                r = v;
                var x = [o.getSize().width, o.getSize().height];
                if (w >= 0) {
                    n._fDiv.style.right = 'auto';
                    n._fDiv.style.left = n._bind.mx + 'px';
                    if (n._bind.mx + w >= x[0] - 2 * n._opts.strokeWeight) {
                        n._fDiv.style.width = x[0] - n._bind.mx - 2 * n._opts.strokeWeight + 'px';
                        n._followTitle && n._followTitle.hide()
                    }
                } else {
                    n._fDiv.style.left = 'auto';
                    n._fDiv.style.right = x[0] - n._bind.mx + 'px';
                    if (n._bind.mx + w <= 2 * n._opts.strokeWeight) {
                        n._fDiv.style.width = n._bind.mx - 2 * n._opts.strokeWeight + 'px';
                        n._followTitle && n._followTitle.hide()
                    }
                }
                if (t >= 0) {
                    n._fDiv.style.bottom = 'auto';
                    n._fDiv.style.top = n._bind.my + 'px';
                    if (n._bind.my + t >= x[1] - 2 * n._opts.strokeWeight) {
                        n._fDiv.style.height = x[1] - n._bind.my - 2 * n._opts.strokeWeight + 'px';
                        n._followTitle && n._followTitle.hide()
                    }
                } else {
                    n._fDiv.style.top = 'auto';
                    n._fDiv.style.bottom = x[1] - n._bind.my + 'px';
                    if (n._bind.my + t <= 2 * n._opts.strokeWeight) {
                        n._fDiv.style.height = n._bind.my - 2 * n._opts.strokeWeight + 'px';
                        n._followTitle && n._followTitle.hide()
                    }
                }
                b(z);
                return g(z)
            }
        };
        var q = function(A) {
            if (!r) {
                n._fDiv.parentNode.removeChild(n._fDiv)
            }
            if (n._isOpen == true) {
                h(document, 'mousemove', l);
                h(document, 'mouseup', q);
                if (!r) {
                    return
                }
                if (!!p && e.getDom(o).releaseCapture) {
                    e.getDom(o).releaseCapture()
                }
                var v = parseInt(n._fDiv.style.left) + parseInt(n._fDiv.style.width) / 2;
                var u = parseInt(n._fDiv.style.top) + parseInt(n._fDiv.style.height) / 2;
                var z = [o.getSize().width, o.getSize().height];
                if (isNaN(v)) {
                    v = z[0] - parseInt(n._fDiv.style.right) - parseInt(n._fDiv.style.width) / 2
                }
                if (isNaN(u)) {
                    u = z[1] - parseInt(n._fDiv.style.bottom) - parseInt(n._fDiv.style.height) / 2
                }
                var C = Math.min(z[0] / Math.abs(n._bind.dx), z[1] / Math.abs(n._bind.dy));
                C = Math.floor(C);
                var x = new BMap.Pixel(v - parseInt(n._fDiv.style.width) / 2, u + parseInt(n._fDiv.style.height) / 2);
                var w = new BMap.Pixel(v + parseInt(n._fDiv.style.width) / 2, u - parseInt(n._fDiv.style.height) / 2);
                var F = o.pixelToPoint(x);
                var E = o.pixelToPoint(w);
                var y = new BMap.Bounds(F, E);
                delete n._bind.dx;
                delete n._bind.dy;
                delete n._bind.ix;
                delete n._bind.iy;
                if (!isNaN(C)) {
                    if (n._opts._zoomType == d) {
                        targetZoomLv = Math.round(o.getZoom() + (Math.log(C) / Math.log(2)));
                        if (targetZoomLv < o.getZoom()) {
                            targetZoomLv = o.getZoom()
                        }
                    }
                } else {
                    targetZoomLv = o.getZoom() + (n._opts._zoomType == d ? 1 : -1)
                }
                var s = o.pixelToPoint({
                        x: v,
                        y: u
                    },
                    o.getZoom());
                if (n._opts.autoViewport) {
                    o.centerAndZoom(s, targetZoomLv)
                }
                var I = e.getDrawPoint(A);
                if (n._followTitle) {
                    n._followTitle.setPosition(I);
                    n._followTitle.show()
                }
                n._bind.isZooming = false;
                n._fDiv.parentNode.removeChild(n._fDiv);
                n._fDiv = null
            }
            var t = y.getSouthWest(),
                B = y.getNorthEast(),
                G = new BMap.Point(B.lng, t.lat),
                H = new BMap.Point(t.lng, B.lat),
                D = new BMap.Polygon([t, H, B, G]);
            D.setStrokeWeight(n._opts.strokeWeight);
            D.setStrokeOpacity(n._opts.opacity);
            D.setFillOpacity(n._opts.opacity);
            D.setStrokeColor(n._opts.strokeColor);
            D.setStrokeStyle(n._opts.style);
            D.setFillColor(n._opts.fillColor);
            n._overlay = D;
            o.addOverlay(D);
            n.local.searchInBounds(n._searchWords, y);
            if (!n._opts.alwaysShowOverlay) {
                new f({
                    duration: 240,
                    fps: 20,
                    delay: 500,
                    render: function(K) {
                        var J = 0.3 * (1 - K);
                        D.setStrokeOpacity(J)
                    },
                    finish: function() {
                        o.removeOverlay(n._overlay);
                        D.dispose();
                        n._overlay = null
                    }
                })
            }
            if (n._opts.autoClose) {
                setTimeout(function() {
                        if (n._isOpen == true) {
                            n.close()
                        }
                    },
                    70)
            }
            b(A);
            return g(A)
        };
        e.show(this._map);
        this.setCursor(this._opts.cursor);
        if (!this._isBeginDrawBinded) {
            c(e.getDom(this._map), 'mousedown', m);
            this._isBeginDrawBinded = true
        }
        return true
    };
    i.prototype.close = function() {
        if (!this._isOpen) {
            return
        }
        this._isOpen = false;
        BMapLib._toolInUse = false;
        this._followTitle && this._followTitle.hide();
        e.hide()
    };
    i.prototype.setKeyword = function(l) {
        this._searchWords = l
    };
    i.prototype._generateHTML = function() {
        return [
            '<div style=\'position:absolute;z-index:300;border:', this._opts.strokeWeight, 'px ', this._opts.style, ' ', this._opts.strokeColor, '; opacity:',
            this._opts.opacity, '; background: ', this._opts.fillColor, '; filter:alpha(opacity=', Math.round(this._opts.opacity * 100),
            '); width:0; height:0; font-size:0\'></div>'].join('')
    };
    i.prototype.localSearch = function(l) {
        return new BMap.LocalSearch(l._map, {
            renderOptions: {
                map: l._opts.map,
                autoViewport: false,
                panel: l._opts.panel,
                selectFirstResult: l._opts.selectFirstResult
            },
            onSearchComplete: function(m) {
                if (l._opts.onSearchComplete) {
                    l._opts.onSearchComplete(m)
                }
            }
        })
    };
    function a(o, l, n) {
        var m, p;
        if (o.insertAdjacentHTML) {
            o.insertAdjacentHTML(l, n)
        } else {
            m = o.ownerDocument.createRange();
            l = l.toUpperCase();
            if (l == 'AFTERBEGIN' || l == 'BEFOREEND') {
                m.selectNodeContents(o);
                m.collapse(l == 'AFTERBEGIN')
            } else {
                p = l == 'BEFOREBEGIN';
                m[p ? 'setStartBefore' : 'setEndAfter'](o);
                m.collapse(p)
            }
            m.insertNode(m.createContextualFragment(n))
        }
        return o
    }

    function j(m, l) {
        a(m, 'beforeEnd', l);
        return m.lastChild
    }

    function b(l) {
        var l = window.event || l;
        l.stopPropagation ? l.stopPropagation() : l.cancelBubble = true
    }

    function g(l) {
        var l = window.event || l;
        l.preventDefault ? l.preventDefault() : l.returnValue = false;
        return false
    }

    function c(l, m, n) {
        if (!l) {
            return
        }
        m = m.replace(/^on/i, '').toLowerCase();
        if (l.addEventListener) {
            l.addEventListener(m, n, false)
        } else {
            if (l.attachEvent) {
                l.attachEvent('on' + m, n)
            }
        }
    }

    function h(l, m, n) {
        if (!l) {
            return
        }
        m = m.replace(/^on/i, '').toLowerCase();
        if (l.removeEventListener) {
            l.removeEventListener(m, n, false)
        } else {
            if (l.detachEvent) {
                l.detachEvent('on' + m, n)
            }
        }
    }

    var e = {
        _map: null,
        _html: '<div style=\'background:transparent url(http://api.map.baidu.com/images/blank.gif);position:absolute;left:0;top:0;width:100%;height:100%;z-index:1000\' unselectable=\'on\'></div>',
        _maskElement: null,
        _cursor: 'default',
        _inUse: false,
        show: function(l) {
            if (!this._map) {
                this._map = l
            }
            this._inUse = true;
            if (!this._maskElement) {
                this._createMask(l)
            }
            this._maskElement.style.display = 'block'
        },
        _createMask: function(n) {
            this._map = n;
            if (!this._map) {
                return
            }
            var m = this._maskElement = j(this._map.getContainer(), this._html);
            var l = function(o) {
                b(o);
                return g(o)
            };
            c(m, 'mouseup',
                function(o) {
                    if (o.button == 2) {
                        l(o)
                    }
                });
            c(m, 'contextmenu', l);
            m.style.display = 'none'
        },
        getDrawPoint: function(o, q) {
            o = window.event || o;
            var l = o.layerX || o.offsetX || 0;
            var p = o.layerY || o.offsetY || 0;
            var m = o.target || o.srcElement;
            if (m != e.getDom(this._map) && q == true) {
                while (m && m != this._map.getContainer()) {
                    if (!(m.clientWidth == 0 && m.clientHeight == 0 && m.offsetParent && m.offsetParent.nodeName.toLowerCase() == 'td')) {
                        l += m.offsetLeft;
                        p += m.offsetTop
                    }
                    m = m.offsetParent
                }
            }
            if (m != e.getDom(this._map) && m != this._map.getContainer()) {
                return
            }
            if (typeof l === 'undefined' || typeof p === 'undefined') {
                return
            }
            if (isNaN(l) || isNaN(p)) {
                return
            }
            return this._map.pixelToPoint(new BMap.Pixel(l, p))
        },
        hide: function() {
            if (!this._map) {
                return
            }
            this._inUse = false;
            if (this._maskElement) {
                this._maskElement.style.display = 'none'
            }
        },
        getDom: function(l) {
            if (!this._maskElement) {
                this._createMask(l)
            }
            return this._maskElement
        },
        setCursor: function(l) {
            this._cursor = l || 'default';
            if (this._maskElement) {
                this._maskElement.style.cursor = this._cursor
            }
        }
    };

    function f(o) {
        var l = {
            duration: 1000,
            fps: 30,
            delay: 0,
            transition: k.linear,
            onStop: function() {
            }
        };
        if (o) {
            for (var m in o) {
                l[m] = o[m]
            }
        }
        this._opts = l;
        if (l.delay) {
            var n = this;
            setTimeout(function() {
                    n._beginTime = new Date().getTime();
                    n._endTime = n._beginTime + n._opts.duration;
                    n._launch()
                },
                l.delay)
        } else {
            this._beginTime = new Date().getTime();
            this._endTime = this._beginTime + this._opts.duration;
            this._launch()
        }
    }

    f.prototype._launch = function() {
        var m = this;
        var l = new Date().getTime();
        if (l >= m._endTime) {
            if (typeof m._opts.render == 'function') {
                m._opts.render(m._opts.transition(1))
            }
            if (typeof m._opts.finish == 'function') {
                m._opts.finish()
            }
            return
        }
        m.schedule = m._opts.transition((l - m._beginTime) / m._opts.duration);
        if (typeof m._opts.render == 'function') {
            m._opts.render(m.schedule)
        }
        if (!m.terminative) {
            m._timer = setTimeout(function() {
                    m._launch()
                },
                1000 / m._opts.fps)
        }
    };
    var k = {
        linear: function(l) {
            return l
        },
        reverse: function(l) {
            return 1 - l
        },
        easeInQuad: function(l) {
            return l * l
        },
        easeInCubic: function(l) {
            return Math.pow(l, 3)
        },
        easeOutQuad: function(l) {
            return -(l * (l - 2))
        },
        easeOutCubic: function(l) {
            return Math.pow((l - 1), 3) + 1
        },
        easeInOutQuad: function(l) {
            if (l < 0.5) {
                return l * l * 2
            } else {
                return -2 * (l - 2) * l - 1
            }
            return
        },
        easeInOutCubic: function(l) {
            if (l < 0.5) {
                return Math.pow(l, 3) * 4
            } else {
                return Math.pow(l - 1, 3) * 4 + 1
            }
        },
        easeInOutSine: function(l) {
            return (1 - Math.cos(Math.PI * l)) / 2
        }
    }
})();

/**
 * lushu
 * @type {{}}
 */

/**
 * @fileoverview 百度地图的轨迹跟随类，对外开放。
 * 用户可以在地图上自定义轨迹运动
 * 可以自定义路过某个点的图片，文字介绍等。
 * 主入口类是<a href="symbols/BMapLib.LuShu.html">LuShu</a>，
 * 基于Baidu Map API 1.2。.
 *
 * @author Baidu Map Api Group
 * @version 1.2
 */

/**
 * @namespace BMap的所有library类均放在BMapLib命名空间下
 */
var BMapLib = window.BMapLib = BMapLib || {};

(function() {
    //声明baidu包
    var T, baidu = T = baidu || {version: '1.5.0'};
    baidu.guid = '$BAIDU$';
    //以下方法为百度Tangram框架中的方法，请到http://tangram.baidu.com 查看文档
    (function() {
        window[baidu.guid] = window[baidu.guid] || {};
        baidu.dom = baidu.dom || {};
        baidu.dom.g = function(id) {
            if ('string' == typeof id || id instanceof String) {
                return document.getElementById(id);
            } else if (id && id.nodeName && (id.nodeType == 1 || id.nodeType == 9)) {
                return id;
            }
            return null;
        };
        baidu.g = baidu.G = baidu.dom.g;
        baidu.lang = baidu.lang || {};
        baidu.lang.isString = function(source) {
            return '[object String]' == Object.prototype.toString.call(source);
        };
        baidu.isString = baidu.lang.isString;
        baidu.dom._g = function(id) {
            if (baidu.lang.isString(id)) {
                return document.getElementById(id);
            }
            return id;
        };
        baidu._g = baidu.dom._g;
        baidu.dom.getDocument = function(element) {
            element = baidu.dom.g(element);
            return element.nodeType == 9 ? element : element.ownerDocument || element.document;
        };
        baidu.browser = baidu.browser || {};
        baidu.browser.ie = baidu.ie = /msie (\d+\.\d+)/i.test(navigator.userAgent) ? (document.documentMode || +RegExp['\x241']) : undefined;
        baidu.dom.getComputedStyle = function(element, key) {
            element = baidu.dom._g(element);
            var doc = baidu.dom.getDocument(element),
                styles;
            if (doc.defaultView && doc.defaultView.getComputedStyle) {
                styles = doc.defaultView.getComputedStyle(element, null);
                if (styles) {
                    return styles[key] || styles.getPropertyValue(key);
                }
            }
            return '';
        };
        baidu.dom._styleFixer = baidu.dom._styleFixer || {};
        baidu.dom._styleFilter = baidu.dom._styleFilter || [];
        baidu.dom._styleFilter.filter = function(key, value, method) {
            for (var i = 0, filters = baidu.dom._styleFilter, filter; filter = filters[i]; i++) {
                if (filter = filter[method]) {
                    value = filter(key, value);
                }
            }
            return value;
        };
        baidu.string = baidu.string || {};

        baidu.string.toCamelCase = function(source) {

            if (source.indexOf('-') < 0 && source.indexOf('_') < 0) {
                return source;
            }
            return source.replace(/[-_][^-_]/g, function(match) {
                return match.charAt(1).toUpperCase();
            });
        };
        baidu.dom.getStyle = function(element, key) {
            var dom = baidu.dom;
            element = dom.g(element);
            key = baidu.string.toCamelCase(key);

            var value = element.style[key] ||
                (element.currentStyle ? element.currentStyle[key] : '') ||
                dom.getComputedStyle(element, key);

            if (!value) {
                var fixer = dom._styleFixer[key];
                if (fixer) {
                    value = fixer.get ? fixer.get(element) : baidu.dom.getStyle(element, fixer);
                }
            }

            if (fixer = dom._styleFilter) {
                value = fixer.filter(key, value, 'get');
            }
            return value;
        };
        baidu.getStyle = baidu.dom.getStyle;
        baidu.dom._NAME_ATTRS = (function() {
            var result = {
                'cellpadding': 'cellPadding',
                'cellspacing': 'cellSpacing',
                'colspan': 'colSpan',
                'rowspan': 'rowSpan',
                'valign': 'vAlign',
                'usemap': 'useMap',
                'frameborder': 'frameBorder'
            };

            if (baidu.browser.ie < 8) {
                result['for'] = 'htmlFor';
                result['class'] = 'className';
            } else {
                result['htmlFor'] = 'for';
                result['className'] = 'class';
            }

            return result;
        })();
        baidu.dom.setAttr = function(element, key, value) {
            element = baidu.dom.g(element);
            if ('style' == key) {
                element.style.cssText = value;
            } else {
                key = baidu.dom._NAME_ATTRS[key] || key;
                element.setAttribute(key, value);
            }
            return element;
        };
        baidu.setAttr = baidu.dom.setAttr;
        baidu.dom.setAttrs = function(element, attributes) {
            element = baidu.dom.g(element);
            for (var key in attributes) {
                baidu.dom.setAttr(element, key, attributes[key]);
            }
            return element;
        };
        baidu.setAttrs = baidu.dom.setAttrs;
        baidu.dom.create = function(tagName, opt_attributes) {
            var el = document.createElement(tagName),
                attributes = opt_attributes || {};
            return baidu.dom.setAttrs(el, attributes);
        };
        baidu.object = baidu.object || {};
        baidu.extend =
            baidu.object.extend = function(target, source) {
                for (var p in source) {
                    if (source.hasOwnProperty(p)) {
                        target[p] = source[p];
                    }
                }
                return target;
            };
    })();

    /**
     * @exports LuShu as BMapLib.LuShu
     */
    var LuShu =
        /**
         * LuShu类的构造函数
         * @class LuShu <b>入口</b>。
         * 实例化该类后，可调用,start,end,pause等方法控制覆盖物的运动。

         * @constructor
         * @param {Map} map Baidu map的实例对象.
         * @param {Array} path 构成路线的point的数组.
         * @param {Json Object} opts 可选的输入参数，非必填项。可输入选项包括：<br />
         * {<br />"<b>landmarkPois</b>" : {Array} 要在覆盖物移动过程中，显示的特殊点。格式如下:landmarkPois:[<br />
         *      {lng:116.314782,lat:39.913508,html:'加油站',pauseTime:2},<br />
         *      {lng:116.315391,lat:39.964429,html:'高速公路收费站,pauseTime:3}]<br />
         * <br />"<b>icon</b>" : {Icon} 覆盖物的icon,
         * <br />"<b>speed</b>" : {Number} 覆盖物移动速度，单位米/秒    <br />
         * <br />"<b>defaultContent</b>" : {String} 覆盖物中的内容    <br />
         * }<br />.
         * @example <b>参考示例：</b><br />
         * var lushu = new BMapLib.LuShu(map,arrPois,{defaultContent:"从北京到天津",landmarkPois:[]});
         */
        BMapLib.LuShu = function(map, path, opts) {
            if (!path || path.length < 1) {
                return;
            }
            this._map = map;
            //存储一条路线
            this._path = path;
            //移动到当前点的索引
            this.i = 0;
            //控制暂停后开始移动的队列的数组
            this._setTimeoutQuene = [];
            //进行坐标转换的类
            this._projection = this._map.getMapType().getProjection();
            this._opts = {
                icon: null,
                //默认速度 米/秒
                speed: 4000,
                defaultContent: ''
            };
            this._setOptions(opts);
            this._rotation = 0;//小车转动的角度

            //如果不是默认实例，则使用默认的icon
            if (!this._opts.icon instanceof BMap.Icon) {
                this._opts.icon = defaultIcon;
            }
        }
    /**
     * 根据用户输入的opts，修改默认参数_opts
     * @param {Json Object} opts 用户输入的修改参数.
     * @return 无返回值.
     */
    LuShu.prototype._setOptions = function(opts) {
        if (!opts) {
            return;
        }
        for (var p in opts) {
            if (opts.hasOwnProperty(p)) {
                this._opts[p] = opts[p];
            }
        }
    }

    /**
     * @description 开始运动
     * @param none
     * @return 无返回值.
     *
     * @example <b>参考示例：</b><br />
     * lushu.start();
     */
    LuShu.prototype.start = function() {
        var me = this,
            len = me._path.length;
        //不是第一次点击开始,并且小车还没到达终点
        if (me.i && me.i < len - 1) {
            //没按pause再按start不做处理
            if (!me._fromPause) {
                return;
            } else if (!me._fromStop) {
                //按了pause按钮,并且再按start，直接移动到下一点
                //并且此过程中，没有按stop按钮
                //防止先stop，再pause，然后连续不停的start的异常
                me._moveNext(++me.i);
            }
        } else {
            //第一次点击开始，或者点了stop之后点开始
            me._addMarker();
            //等待marker动画完毕再加载infowindow
            me._timeoutFlag = setTimeout(function() {
                me._addInfoWin();
                if (me._opts.defaultContent == '') {
                    me.hideInfoWindow();
                }
                me._moveNext(me.i);
            }, 400);
        }
        //重置状态
        this._fromPause = false;
        this._fromStop = false;
    },
        /**
         * 结束运动
         * @return 无返回值.
         *
         * @example <b>参考示例：</b><br />
         * lushu.stop();
         */
        LuShu.prototype.stop = function() {
            this.i = 0;
            this._fromStop = true;
            clearInterval(this._intervalFlag);
            this._clearTimeout();
            //重置landmark里边的poi为未显示状态
            for (var i = 0, t = this._opts.landmarkPois, len = t.length; i < len; i++) {
                t[i].bShow = false;
            }
        };
    /**
     * 暂停运动
     * @return 无返回值.
     */
    LuShu.prototype.pause = function() {
        clearInterval(this._intervalFlag);

        //标识是否是按过pause按钮
        this._fromPause = true;
        this._clearTimeout();
    };
    /**
     * 隐藏上方overlay
     * @return 无返回值.
     *
     * @example <b>参考示例：</b><br />
     * lushu.hideInfoWindow();
     */
    LuShu.prototype.hideInfoWindow = function() {
        this._overlay._div.style.visibility = 'hidden';
    };
    /**
     * 显示上方overlay
     * @return 无返回值.
     *
     * @example <b>参考示例：</b><br />
     * lushu.showInfoWindow();
     */
    LuShu.prototype.showInfoWindow = function() {
        this._overlay._div.style.visibility = 'visible';
    };
    //Lushu私有方法
    baidu.object.extend(LuShu.prototype, {
        /**
         * 添加marker到地图上
         * @param {Function} 回调函数.
         * @return 无返回值.
         */
        _addMarker: function(callback) {
            if (this._marker) {
                this.stop();
                this._map.removeOverlay(this._marker);
                clearTimeout(this._timeoutFlag);
            }
            //移除之前的overlay
            this._overlay && this._map.removeOverlay(this._overlay);
            var marker = new BMap.Marker(this._path[0]);
            this._opts.icon && marker.setIcon(this._opts.icon);
            this._map.addOverlay(marker);
            marker.setAnimation(BMAP_ANIMATION_DROP);
            this._marker = marker;
        },
        /**
         * 添加上方overlay
         * @return 无返回值.
         */
        _addInfoWin: function() {
            var me = this;
            //if(me._opts.defaultContent!== ""){
            var overlay = new CustomOverlay(me._marker.getPosition(), me._opts.defaultContent);

            //将当前类的引用传给overlay。
            overlay.setRelatedClass(this);
            this._overlay = overlay;
            this._map.addOverlay(overlay);

            //}

        },
        /**
         * 获取墨卡托坐标
         * @param {Point} poi 经纬度坐标.
         * @return 无返回值.
         */
        _getMercator: function(poi) {
            return this._map.getMapType().getProjection().lngLatToPoint(poi);
        },
        /**
         * 计算两点间的距离
         * @param {Point} poi 经纬度坐标A点.
         * @param {Point} poi 经纬度坐标B点.
         * @return 无返回值.
         */
        _getDistance: function(pxA, pxB) {
            return Math.sqrt(Math.pow(pxA.x - pxB.x, 2) + Math.pow(pxA.y - pxB.y, 2));
        },
        //目标点的  当前的步长,position,总的步长,动画效果,回调
        /**
         * 移动小车
         * @param {Number} poi 当前的步长.
         * @param {Point} initPos 经纬度坐标初始点.
         * @param {Point} targetPos 经纬度坐标目标点.
         * @param {Function} effect 缓动效果.
         * @return 无返回值.
         */
        _move: function(initPos, targetPos, effect) {
            var me = this,
                //当前的帧数
                currentCount = 0,
                //步长，米/秒
                timer = 10,
                step = this._opts.speed / (1000 / timer),
                //初始坐标
                init_pos = this._projection.lngLatToPoint(initPos),
                //获取结束点的(x,y)坐标
                target_pos = this._projection.lngLatToPoint(targetPos),
                //总的步长
                count = Math.round(me._getDistance(init_pos, target_pos) / step);

            //如果小于1直接移动到下一点
            if (count < 1) {
                me._moveNext(++me.i);
                return;
            }
            //两点之间匀速移动
            me._intervalFlag = setInterval(function() {
                //两点之间当前帧数大于总帧数的时候，则说明已经完成移动
                if (currentCount >= count) {
                    clearInterval(me._intervalFlag);
                    //移动的点已经超过总的长度
                    if (me.i > me._path.length) {
                        return;
                    }
                    //运行下一个点
                    me._moveNext(++me.i);
                } else {
                    currentCount++;
                    var x = effect(init_pos.x, target_pos.x, currentCount, count),
                        y = effect(init_pos.y, target_pos.y, currentCount, count),
                        pos = me._projection.pointToLngLat(new BMap.Pixel(x, y));
                    //设置marker
                    if (currentCount == 1) {
                        var proPos = null;
                        if (me.i - 1 >= 0) {
                            proPos = me._path[me.i - 1];
                        }
                        if (me._opts.enableRotation == true) {
                            me.setRotation(proPos, initPos, targetPos);
                        }
                        if (me._opts.autoView) {
                            if (!me._map.getBounds().containsPoint(pos)) {
                                me._map.setCenter(pos);
                            }
                        }
                    }
                    //正在移动

                    me._marker.setPosition(pos);
                    //设置自定义overlay的位置
                    me._setInfoWin(pos);

                }
            }, timer);
        },
        /**
         *在每个点的真实步骤中设置小车转动的角度
         */
        setRotation: function(prePos, curPos, targetPos) {
            var me = this;
            var deg = 0;
            //start!
            curPos = me._map.pointToPixel(curPos);
            targetPos = me._map.pointToPixel(targetPos);

            if (targetPos.x != curPos.x) {
                var tan = (targetPos.y - curPos.y) / (targetPos.x - curPos.x),
                    atan = Math.atan(tan);
                deg = atan * 360 / (2 * Math.PI);
                //degree  correction;
                if (targetPos.x < curPos.x) {
                    deg = -deg + 90 + 90;

                } else {
                    deg = -deg;
                }

                me._marker.setRotation(-deg);

            } else {
                var disy = targetPos.y - curPos.y;
                var bias = 0;
                if (disy > 0)
                    bias = -1
                else
                    bias = 1
                me._marker.setRotation(-bias * 90);
            }
            return;

        },

        linePixellength: function(from, to) {
            return Math.sqrt(Math.abs(from.x - to.x) * Math.abs(from.x - to.x) + Math.abs(from.y - to.y) * Math.abs(from.y - to.y));

        },
        pointToPoint: function(from, to) {
            return Math.abs(from.x - to.x) * Math.abs(from.x - to.x) + Math.abs(from.y - to.y) * Math.abs(from.y - to.y)

        },
        /**
         * 移动到下一个点
         * @param {Number} index 当前点的索引.
         * @return 无返回值.
         */
        _moveNext: function(index) {
            var me = this;
            if (index == this._path.length - 1) {
                this._opts.cb && this._opts.cb()
            }
            if (index < this._path.length - 1) {
                me._move(me._path[index], me._path[index + 1], me._tween.linear);
            }
        },
        /**
         * 设置小车上方infowindow的内容，位置等
         * @param {Point} pos 经纬度坐标点.
         * @return 无返回值.
         */
        _setInfoWin: function(pos) {
            //设置上方overlay的position
            var me = this;
            if (!me._overlay) {
                return;
            }
            me._overlay.setPosition(pos, me._marker.getIcon().size);
            var index = me._troughPointIndex(pos);
            if (index != -1) {
                clearInterval(me._intervalFlag);
                me._overlay.setHtml(me._opts.landmarkPois[index].html);
                me._overlay.setPosition(pos, me._marker.getIcon().size);
                me._pauseForView(index);
            } else {
                me._overlay.setHtml(me._opts.defaultContent);
            }
        },
        /**
         * 在某个点暂停的时间
         * @param {Number} index 点的索引.
         * @return 无返回值.
         */
        _pauseForView: function(index) {
            var me = this;
            var t = setTimeout(function() {
                //运行下一个点
                me._moveNext(++me.i);
            }, me._opts.landmarkPois[index].pauseTime * 1000);
            me._setTimeoutQuene.push(t);
        },
        //清除暂停后再开始运行的timeout
        _clearTimeout: function() {
            for (var i in this._setTimeoutQuene) {
                clearTimeout(this._setTimeoutQuene[i]);
            }
            this._setTimeoutQuene.length = 0;
        },
        //缓动效果
        _tween: {
            //初始坐标，目标坐标，当前的步长，总的步长
            linear: function(initPos, targetPos, currentCount, count) {
                var b = initPos, c = targetPos - initPos, t = currentCount,
                    d = count;
                return c * t / d + b;
            }
        },

        /**
         * 否经过某个点的index
         * @param {Point} markerPoi 当前小车的坐标点.
         * @return 无返回值.
         */
        _troughPointIndex: function(markerPoi) {
            var t = this._opts.landmarkPois, distance;
            for (var i = 0, len = t.length; i < len; i++) {
                //landmarkPois中的点没有出现过的话
                if (!t[i].bShow) {
                    distance = this._map.getDistance(new BMap.Point(t[i].lng, t[i].lat), markerPoi);
                    //两点距离小于10米，认为是同一个点
                    if (distance < 10) {
                        t[i].bShow = true;
                        return i;
                    }
                }
            }
            return -1;
        }
    });
    /**
     * 自定义的overlay，显示在小车的上方
     * @param {Point} Point 要定位的点.
     * @param {String} html overlay中要显示的东西.
     * @return 无返回值.
     */
    function CustomOverlay(point, html) {
        this._point = point;
        this._html = html;
    }

    CustomOverlay.prototype = new BMap.Overlay();
    CustomOverlay.prototype.initialize = function(map) {
        var div = this._div = baidu.dom.create('div',
            {style: 'border:solid 1px #ccc;width:auto;min-width:50px;text-align:center;position:absolute;background:#fff;color:#000;font-size:12px;border-radius: 10px;padding:5px;white-space: nowrap;'});
        div.innerHTML = this._html;
        map.getPanes().floatPane.appendChild(div);
        this._map = map;
        return div;
    }
    CustomOverlay.prototype.draw = function() {
        this.setPosition(this.lushuMain._marker.getPosition(), this.lushuMain._marker.getIcon().size);
    }
    baidu.object.extend(CustomOverlay.prototype, {
        //设置overlay的position
        setPosition: function(poi, markerSize) {
            // 此处的bug已修复，感谢 苗冬(diligentcat@gmail.com) 的细心查看和认真指出
            var px = this._map.pointToOverlayPixel(poi),
                styleW = baidu.dom.getStyle(this._div, 'width'),
                styleH = baidu.dom.getStyle(this._div, 'height');
            overlayW = parseInt(this._div.clientWidth || styleW, 10),
                overlayH = parseInt(this._div.clientHeight || styleH, 10);
            this._div.style.left = px.x - overlayW / 2 + 'px';
            this._div.style.bottom = -(px.y - markerSize.height) + 'px';
        },
        //设置overlay的内容
        setHtml: function(html) {
            this._div.innerHTML = html;
        },
        //跟customoverlay相关的实例的引用
        setRelatedClass: function(lushuMain) {
            this.lushuMain = lushuMain;
        }
    });
})();

//==== GeoUtils_min.js=============================
var BMapLib = window.BMapLib = BMapLib || {};
(function() {
    var a = 6370996.81;
    var b = BMapLib.GeoUtils = function() {
    };
    b.isPointInRect = function(f, g) {
        if (!(f instanceof BMap.Point) || !(g instanceof BMap.Bounds)) {
            return false
        }
        var e = g.getSouthWest();
        var h = g.getNorthEast();
        return (f.lng >= e.lng && f.lng <= h.lng && f.lat >= e.lat && f.lat <= h.lat)
    };
    b.isPointInCircle = function(e, h) {
        if (!(e instanceof BMap.Point) || !(h instanceof BMap.Circle)) {
            return false
        }
        var i = h.getCenter();
        var g = h.getRadius();
        var f = b.getDistance(e, i);
        if (f <= g) {
            return true
        } else {
            return false
        }
    };
    b.isPointOnPolyline = function(f, h) {
        if (!(f instanceof BMap.Point) || !(h instanceof BMap.Polyline)) {
            return false
        }
        var e = h.getBounds();
        if (!this.isPointInRect(f, e)) {
            return false
        }
        var m = h.getPath();
        for (var k = 0; k < m.length - 1; k++) {
            var l = m[k];
            var j = m[k + 1];
            if (f.lng >= Math.min(l.lng, j.lng) && f.lng <= Math.max(l.lng, j.lng) && f.lat >= Math.min(l.lat, j.lat) && f.lat <= Math.max(l.lat, j.lat)) {
                var g = (l.lng - f.lng) * (j.lat - f.lat) - (j.lng - f.lng) * (l.lat - f.lat);
                if (g < 2e-10 && g > -2e-10) {
                    return true
                }
            }
        }
        return false
    };
    b.isPointInPolygon = function(o, l) {
        if (!(o instanceof BMap.Point) || !(l instanceof BMap.Polygon)) {
            return false
        }
        var k = l.getBounds();
        if (!this.isPointInRect(o, k)) {
            return false
        }
        var t = l.getPath();
        var h = t.length;
        var n = true;
        var j = 0;
        var g = 2e-10;
        var s, q;
        var e = o;
        s = t[0];
        for (var f = 1; f <= h; ++f) {
            if (e.equals(s)) {
                return n
            }
            q = t[f % h];
            if (e.lat < Math.min(s.lat, q.lat) || e.lat > Math.max(s.lat, q.lat)) {
                s = q;
                continue
            }
            if (e.lat > Math.min(s.lat, q.lat) && e.lat < Math.max(s.lat, q.lat)) {
                if (e.lng <= Math.max(s.lng, q.lng)) {
                    if (s.lat == q.lat && e.lng >= Math.min(s.lng, q.lng)) {
                        return n
                    }
                    if (s.lng == q.lng) {
                        if (s.lng == e.lng) {
                            return n
                        } else {
                            ++j
                        }
                    } else {
                        var r = (e.lat - s.lat) * (q.lng - s.lng) / (q.lat - s.lat) + s.lng;
                        if (Math.abs(e.lng - r) < g) {
                            return n
                        }
                        if (e.lng < r) {
                            ++j
                        }
                    }
                }
            } else {
                if (e.lat == q.lat && e.lng <= q.lng) {
                    var m = t[(f + 1) % h];
                    if (e.lat >= Math.min(s.lat, m.lat) && e.lat <= Math.max(s.lat, m.lat)) {
                        ++j
                    } else {
                        j += 2
                    }
                }
            }
            s = q
        }
        if (j % 2 == 0) {
            return false
        } else {
            return true
        }
    };
    b.degreeToRad = function(e) {
        return Math.PI * e / 180
    };
    b.radToDegree = function(e) {
        return (180 * e) / Math.PI
    };
    function d(g, f, e) {
        if (f != null) {
            g = Math.max(g, f)
        }
        if (e != null) {
            g = Math.min(g, e)
        }
        return g
    }

    function c(g, f, e) {
        while (g > e) {
            g -= e - f
        }
        while (g < f) {
            g += e - f
        }
        return g
    }

    b.getDistance = function(j, h) {
        if (!(j instanceof BMap.Point) || !(h instanceof BMap.Point)) {
            return 0
        }
        j.lng = c(j.lng, -180, 180);
        j.lat = d(j.lat, -74, 74);
        h.lng = c(h.lng, -180, 180);
        h.lat = d(h.lat, -74, 74);
        var f, e, i, g;
        f = b.degreeToRad(j.lng);
        i = b.degreeToRad(j.lat);
        e = b.degreeToRad(h.lng);
        g = b.degreeToRad(h.lat);
        return a * Math.acos((Math.sin(i) * Math.sin(g) + Math.cos(i) * Math.cos(g) * Math.cos(e - f)))
    };
    b.getPolylineDistance = function(f) {
        if (f instanceof BMap.Polyline || f instanceof Array) {
            var l;
            if (f instanceof BMap.Polyline) {
                l = f.getPath()
            } else {
                l = f
            }
            if (l.length < 2) {
                return 0
            }
            var j = 0;
            for (var h = 0; h < l.length - 1; h++) {
                var k = l[h];
                var g = l[h + 1];
                var e = b.getDistance(k, g);
                j += e
            }
            return j
        } else {
            return 0
        }
    };
    b.getPolygonArea = function(t) {
        if (!(t instanceof BMap.Polygon) && !(t instanceof Array)) {
            return 0
        }
        var R;
        if (t instanceof BMap.Polygon) {
            R = t.getPath()
        } else {
            R = t
        }
        if (R.length < 3) {
            return 0
        }
        var w = 0;
        var D = 0;
        var C = 0;
        var L = 0;
        var J = 0;
        var F = 0;
        var E = 0;
        var S = 0;
        var H = 0;
        var p = 0;
        var T = 0;
        var I = 0;
        var q = 0;
        var e = 0;
        var M = 0;
        var v = 0;
        var K = 0;
        var N = 0;
        var s = 0;
        var O = 0;
        var l = 0;
        var g = 0;
        var z = 0;
        var Q = 0;
        var G = 0;
        var j = 0;
        var A = 0;
        var o = 0;
        var m = 0;
        var y = 0;
        var x = 0;
        var h = 0;
        var k = 0;
        var f = 0;
        var n = a;
        var B = R.length;
        for (var P = 0; P < B; P++) {
            if (P == 0) {
                D = R[B - 1].lng * Math.PI / 180;
                C = R[B - 1].lat * Math.PI / 180;
                L = R[0].lng * Math.PI / 180;
                J = R[0].lat * Math.PI / 180;
                F = R[1].lng * Math.PI / 180;
                E = R[1].lat * Math.PI / 180
            } else {
                if (P == B - 1) {
                    D = R[B - 2].lng * Math.PI / 180;
                    C = R[B - 2].lat * Math.PI / 180;
                    L = R[B - 1].lng * Math.PI / 180;
                    J = R[B - 1].lat * Math.PI / 180;
                    F = R[0].lng * Math.PI / 180;
                    E = R[0].lat * Math.PI / 180
                } else {
                    D = R[P - 1].lng * Math.PI / 180;
                    C = R[P - 1].lat * Math.PI / 180;
                    L = R[P].lng * Math.PI / 180;
                    J = R[P].lat * Math.PI / 180;
                    F = R[P + 1].lng * Math.PI / 180;
                    E = R[P + 1].lat * Math.PI / 180
                }
            }
            S = Math.cos(J) * Math.cos(L);
            H = Math.cos(J) * Math.sin(L);
            p = Math.sin(J);
            T = Math.cos(C) * Math.cos(D);
            I = Math.cos(C) * Math.sin(D);
            q = Math.sin(C);
            e = Math.cos(E) * Math.cos(F);
            M = Math.cos(E) * Math.sin(F);
            v = Math.sin(E);
            K = (S * S + H * H + p * p) / (S * T + H * I + p * q);
            N = (S * S + H * H + p * p) / (S * e + H * M + p * v);
            s = K * T - S;
            O = K * I - H;
            l = K * q - p;
            g = N * e - S;
            z = N * M - H;
            Q = N * v - p;
            m = (g * s + z * O + Q * l) / (Math.sqrt(g * g + z * z + Q * Q) * Math.sqrt(s * s + O * O + l * l));
            m = Math.acos(m);
            G = z * l - Q * O;
            j = 0 - (g * l - Q * s);
            A = g * O - z * s;
            if (S != 0) {
                o = G / S
            } else {
                if (H != 0) {
                    o = j / H
                } else {
                    o = A / p
                }
            }
            if (o > 0) {
                y += m;
                k++
            } else {
                x += m;
                h++
            }
        }
        var u, r;
        u = y + (2 * Math.PI * h - x);
        r = (2 * Math.PI * k - y) + x;
        if (y > x) {
            if ((u - (B - 2) * Math.PI) < 1) {
                f = u
            } else {
                f = r
            }
        } else {
            if ((r - (B - 2) * Math.PI) < 1) {
                f = r
            } else {
                f = u
            }
        }
        w = (f - (B - 2) * Math.PI) * n * n;
        return w
    }
})();

//==== DrawingManager_min.js=============================
var BMapLib = window.BMapLib = BMapLib || {};
var BMAP_DRAWING_MARKER = 'marker',
    BMAP_DRAWING_POLYLINE = 'polyline',
    BMAP_DRAWING_CIRCLE = 'circle',
    BMAP_DRAWING_RECTANGLE = 'rectangle',
    BMAP_DRAWING_O = 'drawo',
    BMAP_DRAWING_POLYGON = 'polygon';
(function() {
    var b = b || {
            guid: '$BAIDU$'
        };
    (function() {
        window[b.guid] = {};
        b.extend = function(i, g) {
            for (var h in g) {
                if (g.hasOwnProperty(h)) {
                    i[h] = g[h]
                }
            }
            return i
        };
        b.lang = b.lang || {};
        b.lang.guid = function() {
            return 'TANGRAM__' + (window[b.guid]._counter++).toString(36)
        };
        window[b.guid]._counter = window[b.guid]._counter || 1;
        window[b.guid]._instances = window[b.guid]._instances || {};
        b.lang.Class = function(g) {
            this.guid = g || b.lang.guid();
            window[b.guid]._instances[this.guid] = this
        };
        window[b.guid]._instances = window[b.guid]._instances || {};
        b.lang.isString = function(g) {
            return '[object String]' == Object.prototype.toString.call(g)
        };
        b.lang.isFunction = function(g) {
            return '[object Function]' == Object.prototype.toString.call(g)
        };
        b.lang.Class.prototype.toString = function() {
            return '[object ' + (this._className || 'Object') + ']'
        };
        b.lang.Class.prototype.dispose = function() {
            delete window[b.guid]._instances[this.guid];
            for (var g in this) {
                if (!b.lang.isFunction(this[g])) {
                    delete this[g]
                }
            }
            this.disposed = true
        };
        b.lang.Event = function(g, h) {
            this.type = g;
            this.returnValue = true;
            this.target = h || null;
            this.currentTarget = null
        };
        b.lang.Class.prototype.addEventListener = function(j, i, h) {
            if (!b.lang.isFunction(i)) {
                return
            }
            !this.__listeners && (this.__listeners = {});
            var g = this.__listeners,
                k;
            if (typeof h == 'string' && h) {
                if (/[^\w\-]/.test(h)) {
                    throw ('nonstandard key:' + h)
                } else {
                    i.hashCode = h;
                    k = h
                }
            }
            j.indexOf('on') != 0 && (j = 'on' + j);
            typeof g[j] != 'object' && (g[j] = {});
            k = k || b.lang.guid();
            i.hashCode = k;
            g[j][k] = i
        };
        b.lang.Class.prototype.removeEventListener = function(i, h) {
            if (b.lang.isFunction(h)) {
                h = h.hashCode
            } else {
                if (!b.lang.isString(h)) {
                    return
                }
            }
            !this.__listeners && (this.__listeners = {});
            i.indexOf('on') != 0 && (i = 'on' + i);
            var g = this.__listeners;
            if (!g[i]) {
                return
            }
            g[i][h] && delete g[i][h]
        };
        b.lang.Class.prototype.dispatchEvent = function(k, g) {
            if (b.lang.isString(k)) {
                k = new b.lang.Event(k)
            }
            !this.__listeners && (this.__listeners = {});
            g = g || {};
            for (var j in g) {
                k[j] = g[j]
            }
            var j, h = this.__listeners,
                l = k.type;
            k.target = k.target || this;
            k.currentTarget = this;
            l.indexOf('on') != 0 && (l = 'on' + l);
            b.lang.isFunction(this[l]) && this[l].apply(this, arguments);
            if (typeof h[l] == 'object') {
                for (j in h[l]) {
                    h[l][j].apply(this, arguments)
                }
            }
            return k.returnValue
        };
        b.lang.inherits = function(m, k, j) {
            var i, l, g = m.prototype,
                h = new Function();
            h.prototype = k.prototype;
            l = m.prototype = new h();
            for (i in g) {
                l[i] = g[i]
            }
            m.prototype.constructor = m;
            m.superClass = k.prototype;
            if ('string' == typeof j) {
                l._className = j
            }
        };
        b.dom = b.dom || {};
        b._g = b.dom._g = function(g) {
            if (b.lang.isString(g)) {
                return document.getElementById(g)
            }
            return g
        };
        b.g = b.dom.g = function(g) {
            if ('string' == typeof g || g instanceof String) {
                return document.getElementById(g)
            } else {
                if (g && g.nodeName && (g.nodeType == 1 || g.nodeType == 9)) {
                    return g
                }
            }
            return null
        };
        b.insertHTML = b.dom.insertHTML = function(j, g, i) {
            j = b.dom.g(j);
            var h, k;
            if (j.insertAdjacentHTML) {
                j.insertAdjacentHTML(g, i)
            } else {
                h = j.ownerDocument.createRange();
                g = g.toUpperCase();
                if (g == 'AFTERBEGIN' || g == 'BEFOREEND') {
                    h.selectNodeContents(j);
                    h.collapse(g == 'AFTERBEGIN')
                } else {
                    k = g == 'BEFOREBEGIN';
                    h[k ? 'setStartBefore' : 'setEndAfter'](j);
                    h.collapse(k)
                }
                h.insertNode(h.createContextualFragment(i))
            }
            return j
        };
        b.ac = b.dom.addClass = function(n, o) {
            n = b.dom.g(n);
            var h = o.split(/\s+/),
                g = n.className,
                m = ' ' + g + ' ',
                k = 0,
                j = h.length;
            for (; k < j; k++) {
                if (m.indexOf(' ' + h[k] + ' ') < 0) {
                    g += (g ? ' ' : '') + h[k]
                }
            }
            n.className = g;
            return n
        };
        b.event = b.event || {};
        b.event._listeners = b.event._listeners || [];
        b.on = b.event.on = function(h, k, m) {
            k = k.replace(/^on/i, '');
            h = b._g(h);
            var l = function(o) {
                    m.call(h, o)
                },
                g = b.event._listeners,
                j = b.event._eventFilter,
                n,
                i = k;
            k = k.toLowerCase();
            if (j && j[k]) {
                n = j[k](h, k, l);
                i = n.type;
                l = n.listener
            }
            if (h.addEventListener) {
                h.addEventListener(i, l, false)
            } else {
                if (h.attachEvent) {
                    h.attachEvent('on' + i, l)
                }
            }
            g[g.length] = [h, k, m, l, i];
            return h
        };
        b.un = b.event.un = function(i, l, h) {
            i = b._g(i);
            l = l.replace(/^on/i, '').toLowerCase();
            var o = b.event._listeners,
                j = o.length,
                k = !h,
                n, m, g;
            while (j--) {
                n = o[j];
                if (n[1] === l && n[0] === i && (k || n[2] === h)) {
                    m = n[4];
                    g = n[3];
                    if (i.removeEventListener) {
                        i.removeEventListener(m, g, false)
                    } else {
                        if (i.detachEvent) {
                            i.detachEvent('on' + m, g)
                        }
                    }
                    o.splice(j, 1)
                }
            }
            return i
        };
        b.getEvent = b.event.getEvent = function(g) {
            return window.event || g
        };
        b.getTarget = b.event.getTarget = function(g) {
            var g = b.getEvent(g);
            return g.target || g.srcElement
        };
        b.preventDefault = b.event.preventDefault = function(g) {
            var g = b.getEvent(g);
            if (g.preventDefault) {
                g.preventDefault()
            } else {
                g.returnValue = false
            }
        };
        b.stopBubble = b.event.stopBubble = function(g) {
            g = b.getEvent(g);
            g.stopPropagation ? g.stopPropagation() : g.cancelBubble = true
        }
    })();
    var d = BMapLib.DrawingManager = function(h, g) {
        if (!h) {
            return
        }
        c.push(this);
        g = g || {};
        this._initialize(h, g)
    };
    b.lang.inherits(d, b.lang.Class, 'DrawingManager');
    d.prototype.open = function() {
        if (this._isOpen == true) {
            return true
        }
        f(this);
        this._open()
    };
    d.prototype.close = function() {
        if (this._isOpen == false) {
            return true
        }
        this._close()
    };
    d.prototype.setDrawingMode = function(g) {
        if (this._drawingType != g) {
            f(this);
            this._setDrawingMode(g)
        }
    };
    d.prototype.getDrawingMode = function() {
        return this._drawingType
    };
    d.prototype.enableCalculate = function() {
        this._enableCalculate = true;
        this._addGeoUtilsLibrary()
    };
    d.prototype.disableCalculate = function() {
        this._enableCalculate = false
    };
    d.prototype._initialize = function(h, g) {
        this._map = h;
        this._opts = g;
        this._drawingType = g.drawingMode || BMAP_DRAWING_MARKER;
        if (g.enableDrawingTool) {
            var i = new a(this, g.drawingToolOptions);
            this._drawingTool = i;
            h.addControl(i)
        }
        if (g.enableCalculate === true) {
            this.enableCalculate()
        } else {
            this.disableCalculate()
        }
        this._isOpen = !!(g.isOpen === true);
        if (this._isOpen) {
            this._open()
        }
        this.markerOptions = g.markerOptions || {};
        this.circleOptions = g.circleOptions || {};
        this.polylineOptions = g.polylineOptions || {};
        this.polygonOptions = g.polygonOptions || {};
        this.rectangleOptions = g.rectangleOptions || {}
    },
        d.prototype._open = function() {
            this._isOpen = true;
            if (!this._mask) {
                this._mask = new e()
            }
            this._map.addOverlay(this._mask);
            this._setDrawingMode(this._drawingType)
        };
    d.prototype._setDrawingMode = function(g) {
        this._drawingType = g;
        if (this._isOpen) {
            this._mask.__listeners = {};
            switch (g) {
                case BMAP_DRAWING_MARKER:
                    this._bindMarker();
                    break;
                case BMAP_DRAWING_CIRCLE:
                    this._bindCircle();
                    break;
                case BMAP_DRAWING_POLYLINE:
                case BMAP_DRAWING_POLYGON:
                    this._bindPolylineOrPolygon();
                    break;
                case BMAP_DRAWING_RECTANGLE:
                    this._bindRectangle();
                    break;
                case BMAP_DRAWING_O://2014-02-20 17:42:04
                    this._bindO();
                    break
            }
        }
        if (this._drawingTool && this._isOpen) {
            this._drawingTool.setStyleByDrawingMode(g)
        }
    };
    d.prototype._close = function() {
        this._isOpen = false;
        if (this._mask) {
            this._map.removeOverlay(this._mask)
        }
        if (this._drawingTool) {
            this._drawingTool.setStyleByDrawingMode('hander')
        }
    };
    d.prototype._bindMarker = function() {
        var i = this,
            j = this._map,
            h = this._mask;
        var g = function(l) {
            var k = new BMap.Marker(l.point, i.markerOptions);
            j.addOverlay(k);
            i._dispatchOverlayComplete(k)
        };
        h.addEventListener('click', g)
    };
    d.prototype._bindCircle = function() {
        var m = this,
            h = this._map,
            o = this._mask,
            i = null,
            k = null;
        var j = function(p) {
            k = p.point;
            i = new BMap.Circle(k, 0, m.circleOptions);
            h.addOverlay(i);
            o.enableEdgeMove();
            o.addEventListener('mousemove', n);
            b.on(document, 'mouseup', l)
        };
        var n = function(p) {
            i.setRadius(m._map.getDistance(k, p.point))
        };
        var l = function(q) {
            var p = m._calculate(i, q.point);
            m._dispatchOverlayComplete(i, p);
            k = null;
            o.disableEdgeMove();
            o.removeEventListener('mousemove', n);
            b.un(document, 'mouseup', l)
        };
        var g = function(p) {
            b.preventDefault(p);
            b.stopBubble(p);
            if (k == null) {
                j(p)
            }
        };
        o.addEventListener('mousedown', g)
    };
    d.prototype._bindPolylineOrPolygon = function() {
        var k = this,
            m = this._map,
            h = this._mask,
            j = [],
            n = null;
        overlay = null,
            isBinded = false;
        var l = function(o) {
            j.push(o.point);
            n = j.concat(j[j.length - 1]);
            if (j.length == 1) {
                if (k._drawingType == BMAP_DRAWING_POLYLINE) {
                    overlay = new BMap.Polyline(n, k.polylineOptions)
                } else {
                    if (k._drawingType == BMAP_DRAWING_POLYGON) {
                        overlay = new BMap.Polygon(n, k.polygonOptions)
                    }
                }
                m.addOverlay(overlay)
            } else {
                overlay.setPath(n)
            }
            if (!isBinded) {
                isBinded = true;
                h.enableEdgeMove();
                h.addEventListener('mousemove', i);
                h.addEventListener('dblclick', g)
            }
        };
        var i = function(o) {
            overlay.setPositionAt(n.length - 1, o.point)
        };
        var g = function(p) {
            b.stopBubble(p);
            isBinded = false;
            h.disableEdgeMove();
            h.removeEventListener('mousemove', i);
            h.removeEventListener('dblclick', g);
            overlay.setPath(j);
            var o = k._calculate(overlay, j.pop());
            k._dispatchOverlayComplete(overlay, o);
            j.length = 0;
            n.length = 0
        };
        h.addEventListener('click', l);
        h.addEventListener('dblclick',
            function(o) {
                b.stopBubble(o)
            })
    };
    d.prototype._bindRectangle = function() {
        var k = this,
            n = this._map,
            h = this._mask,
            i = null,
            j = null;
        var m = function(p) {
            b.stopBubble(p);
            b.preventDefault(p);
            j = p.point;
            var o = j;
            i = new BMap.Polygon(k._getRectanglePoint(j, o), k.rectangleOptions);
            n.addOverlay(i);
            h.enableEdgeMove();
            h.addEventListener('mousemove', l);
            b.on(document, 'mouseup', g)
        };
        var l = function(o) {
            i.setPath(k._getRectanglePoint(j, o.point))
        };
        var g = function(p) {
            var o = k._calculate(i, i.getPath()[2]);
            k._dispatchOverlayComplete(i, o);
            j = null;
            h.disableEdgeMove();
            h.removeEventListener('mousemove', l);
            b.un(document, 'mouseup', g)
        };
        h.addEventListener('mousedown', m)
    };
    d.prototype._bindO = function() {//2014-02-20 17:43:05 wc
        var k = this,
            m = this._map,
            h = this._mask,
            pp = [],//用来存储多边形的点
            j = [],//用来存储折线的点
            overlay = null,
            gcoverlay = [];
        var l = function(o) {
            b.stopBubble(o);
            h.enableEdgeMove();
            h.addEventListener('mousemove', i);
            h.addEventListener('mouseup', g);
        };
        var i = function(o) {
            j.push(o.point);
            pp.push(o.point);
            if (j.length >= 4) {
                overlay = new BMap.Polyline(j, k.polylineOptions)
                m.addOverlay(overlay)
                gcoverlay.push(overlay)
                j.splice(0, 2)
            } else {
                //overlay.setPath(n)
            }
        };
        var g = function(p) {
            overlay = new BMap.Polygon(pp, k.polygonOptions);
            m.addOverlay(overlay); //绘制多边形
            for (var i = 0; i < gcoverlay.length; i++) {//清除那些辅助的折线
                m.removeOverlay(gcoverlay[i]);
            }
            b.stopBubble(p);
            h.disableEdgeMove();
            h.removeEventListener('mousemove', i);
            h.removeEventListener('mouseup', g);
            var o = k._calculate(overlay, pp.pop());
            k._dispatchOverlayComplete(overlay, o);
            j.length = 0;
            pp.length = 0
        };
        h.addEventListener('mousedown', l);
    };
    d.prototype._calculate = function(j, i) {
        var h = {
            data: 0,
            label: null
        };
        if (this._enableCalculate && BMapLib.GeoUtils) {
            var k = j.toString();
            switch (k) {
                case '[object Polyline]':
                    h.data = BMapLib.GeoUtils.getPolylineDistance(j);
                    break;
                case '[object Polygon]':
                    h.data = BMapLib.GeoUtils.getPolygonArea(j);
                    break;
                case '[object Circle]':
                    var g = j.getRadius();
                    h.data = Math.PI * g * g;
                    break
            }
            if (!h.data || h.data < 0) {
                h.data = 0
            } else {
                h.data = h.data.toFixed(2)
            }
            h.label = this._addLabel(i, h.data)
        }
        return h
    };
    d.prototype._addGeoUtilsLibrary = function() {
        if (!BMapLib.GeoUtils) {
            var g = document.createElement('script');
            g.setAttribute('type', 'text/javascript');
            g.setAttribute('src', 'GeoUtils_min.js');
            document.body.appendChild(g)
        }
    };
    d.prototype._addLabel = function(g, i) {
        var h = new BMap.Label(i, {
            position: g
        });
        this._map.addOverlay(h);
        return h
    };
    d.prototype._getRectanglePoint = function(h, g) {
        return [new BMap.Point(h.lng, h.lat), new BMap.Point(g.lng, h.lat), new BMap.Point(g.lng, g.lat), new BMap.Point(h.lng, g.lat)]
    };
    d.prototype._dispatchOverlayComplete = function(h, i) {
        var g = {
            overlay: h,
            drawingMode: this._drawingType
        };
        if (i) {
            g.calculate = i.data || null;
            g.label = i.label || null
        }
        this.dispatchEvent(this._drawingType + 'complete', h);
        this.dispatchEvent('overlaycomplete', g)
    };
    function e() {
        this._enableEdgeMove = false
    }

    e.prototype = new BMap.Overlay();
    e.prototype.dispatchEvent = b.lang.Class.prototype.dispatchEvent;
    e.prototype.addEventListener = b.lang.Class.prototype.addEventListener;
    e.prototype.removeEventListener = b.lang.Class.prototype.removeEventListener;
    e.prototype.initialize = function(i) {
        var h = this;
        this._map = i;
        var j = this.container = document.createElement('div');
        var g = this._map.getSize();
        j.style.cssText = 'position:absolute;background:url(about:blank);cursor:crosshair;width:' + g.width + 'px;height:' + g.height + 'px';
        this._map.addEventListener('resize',
            function(k) {
                h._adjustSize(k.size)
            });
        this._map.getPanes().floatPane.appendChild(j);
        this._bind();
        return j
    };
    e.prototype.draw = function() {
        var i = this._map,
            g = i.pixelToPoint(new BMap.Pixel(0, 0)),
            h = i.pointToOverlayPixel(g);
        this.container.style.left = h.x + 'px';
        this.container.style.top = h.y + 'px'
    };
    e.prototype.enableEdgeMove = function() {
        this._enableEdgeMove = true
    };
    e.prototype.disableEdgeMove = function() {
        clearInterval(this._edgeMoveTimer);
        this._enableEdgeMove = false
    };
    e.prototype._bind = function() {
        var l = this,
            g = this._map,
            h = this.container,
            m = null,
            n = null;
        var k = function(p) {
            return {
                x: p.clientX,
                y: p.clientY
            }
        };
        var j = function(r) {
            var q = r.type;
            r = b.getEvent(r);
            point = l.getDrawPoint(r);
            var s = function(t) {
                r.point = point;
                l.dispatchEvent(r)
            };
            if (q == 'mousedown') {
                m = k(r)
            }
            var p = k(r);
            if (q == 'click') {
                if (Math.abs(p.x - m.x) < 5 && Math.abs(p.y - m.y) < 5) {
                    if (!n || !(Math.abs(p.x - n.x) < 5 && Math.abs(p.y - n.y) < 5)) {
                        s('click');
                        n = k(r)
                    } else {
                        n = null
                    }
                }
            } else {
                s(q)
            }
        };
        var o = ['click', 'mousedown', 'mousemove', 'mouseup', 'dblclick'],
            i = o.length;
        while (i--) {
            b.on(h, o[i], j)
        }
        b.on(h, 'mousemove',
            function(p) {
                if (l._enableEdgeMove) {
                    l.mousemoveAction(p)
                }
            })
    };
    e.prototype.mousemoveAction = function(n) {
        function g(s) {
            var r = s.clientX,
                q = s.clientY;
            if (s.changedTouches) {
                r = s.changedTouches[0].clientX;
                q = s.changedTouches[0].clientY
            }
            return new BMap.Pixel(r, q)
        }

        var h = this._map,
            o = this,
            i = h.pointToPixel(this.getDrawPoint(n)),
            k = g(n),
            l = k.x - i.x,
            j = k.y - i.y;
        i = new BMap.Pixel((k.x - l), (k.y - j));
        this._draggingMovePixel = i;
        var p = h.pixelToPoint(i),
            m = {
                pixel: i,
                point: p
            };
        this._panByX = this._panByY = 0;
        if (i.x <= 20 || i.x >= h.width - 20 || i.y <= 50 || i.y >= h.height - 10) {
            if (i.x <= 20) {
                this._panByX = 8
            } else {
                if (i.x >= h.width - 20) {
                    this._panByX = -8
                }
            }
            if (i.y <= 50) {
                this._panByY = 8
            } else {
                if (i.y >= h.height - 10) {
                    this._panByY = -8
                }
            }
            if (!this._edgeMoveTimer) {
                this._edgeMoveTimer = setInterval(function() {
                        h.panBy(o._panByX, o._panByY, {
                            noAnimation: true
                        })
                    },
                    30)
            }
        } else {
            if (this._edgeMoveTimer) {
                clearInterval(this._edgeMoveTimer);
                this._edgeMoveTimer = null
            }
        }
    };
    e.prototype._adjustSize = function(g) {
        this.container.style.width = g.width + 'px';
        this.container.style.height = g.height + 'px'
    };
    e.prototype.getDrawPoint = function(l) {
        var k = this._map,
            j = b.getTarget(l),
            h = l.offsetX || l.layerX || 0,
            m = l.offsetY || l.layerY || 0;
        if (j.nodeType != 1) {
            j = j.parentNode
        }
        while (j && j != k.getContainer()) {
            if (!(j.clientWidth == 0 && j.clientHeight == 0 && j.offsetParent && j.offsetParent.nodeName == 'TD')) {
                h += j.offsetLeft || 0;
                m += j.offsetTop || 0
            }
            j = j.offsetParent
        }
        var i = new BMap.Pixel(h, m);
        var g = k.pixelToPoint(i);
        return g
    };
    function a(h, g) {
        this.drawingManager = h;
        g = this.drawingToolOptions = g || {};
        this.defaultAnchor = BMAP_ANCHOR_TOP_LEFT;
        this.defaultOffset = new BMap.Size(10, 10);
        this.defaultDrawingModes = [BMAP_DRAWING_MARKER, BMAP_DRAWING_CIRCLE, BMAP_DRAWING_POLYLINE, BMAP_DRAWING_POLYGON, BMAP_DRAWING_RECTANGLE];
        if (g.drawingModes) {
            this.drawingModes = g.drawingModes
        } else {
            this.drawingModes = this.defaultDrawingModes
        }
        if (g.anchor) {
            this.setAnchor(g.anchor)
        }
        if (g.offset) {
            this.setOffset(g.offset)
        }
    }

    a.prototype = new BMap.Control();
    a.prototype.initialize = function(i) {
        var h = this.container = document.createElement('div');
        h.className = 'BMapLib_Drawing';
        var g = this.panel = document.createElement('div');
        g.className = 'BMapLib_Drawing_panel';
        if (this.drawingToolOptions && this.drawingToolOptions.scale) {
            this._setScale(this.drawingToolOptions.scale)
        }
        h.appendChild(g);
        g.innerHTML = this._generalHtml();
        this._bind(g);
        i.getContainer().appendChild(h);
        return h
    };
    a.prototype._generalHtml = function(m) {
        var h = {};
        h.hander = '拖动地图';
        h[BMAP_DRAWING_MARKER] = '画点';
        h[BMAP_DRAWING_CIRCLE] = '画圆';
        h[BMAP_DRAWING_POLYLINE] = '画折线';
        h[BMAP_DRAWING_POLYGON] = '画多边形';
        h[BMAP_DRAWING_RECTANGLE] = '画矩形';
        var n = function(o, i) {
            return '<a class="' + o + '" drawingType="' + i + '" href="javascript:drawclick(0)" title="' + h[i] + '" onfocus="this.blur()"></a>'
        };
        var k = [];
        k.push(n('BMapLib_box BMapLib_hander', 'hander'));
        for (var j = 0,
                 g = this.drawingModes.length; j < g; j++) {
            var l = 'BMapLib_box BMapLib_' + this.drawingModes[j];
            if (j == g - 1) {
                l += ' BMapLib_last'
            }
            k.push(n(l, this.drawingModes[j]))
        }
        return k.join('')
    };
    a.prototype._setScale = function(j) {
        var i = 390,
            g = 50,
            k = -parseInt((i - i * j) / 2, 10),
            h = -parseInt((g - g * j) / 2, 10);
        this.container.style.cssText = [
            '-moz-transform: scale(' + j + ');', '-o-transform: scale(' + j + ');', '-webkit-transform: scale(' + j + ');',
            'transform: scale(' + j + ');', 'margin-left:' + k + 'px;', 'margin-top:' + h + 'px;', '*margin-left:0px;', '*margin-top:0px;', 'margin-left:0px\\0;',
            'margin-top:0px\\0;', 'filter: progid:DXImageTransform.Microsoft.Matrix(', 'M11=' + j + ',', 'M12=0,', 'M21=0,', 'M22=' + j + ',', 'SizingMethod=\'auto expand\');'].join(
            '')
    };
    a.prototype._bind = function(g) {
        var h = this;
        b.on(this.panel, 'click',
            function(k) {
                var j = b.getTarget(k);
                var i = j.getAttribute('drawingType');
                h.setStyleByDrawingMode(i);
                h._bindEventByDraingMode(i)
            })
    };
    a.prototype.setStyleByDrawingMode = function(h) {
        if (!h) {
            return
        }
        var j = this.panel.getElementsByTagName('a');
        for (var k = 0,
                 g = j.length; k < g; k++) {
            var m = j[k];
            if (m.getAttribute('drawingType') == h) {
                var l = 'BMapLib_box BMapLib_' + h + '_hover';
                if (k == g - 1) {
                    l += ' BMapLib_last'
                }
                m.className = l
            } else {
                m.className = m.className.replace(/_hover/, '')
            }
        }
    };
    a.prototype._bindEventByDraingMode = function(g) {
        var h = this.drawingManager;
        if (g == 'hander') {
            h.close()
        } else {
            h.setDrawingMode(g);
            h.open()
        }
    };
    var c = [];

    function f(g) {
        var h = c.length;
        while (h--) {
            if (c[h] != g) {
                c[h].close()
            }
        }
    }
})();

//==== SearchInfowin.js=============================
var BMapLib = window.BMapLib = BMapLib || {};
var BMAPLIB_TAB_SEARCH = 0, BMAPLIB_TAB_TO_HERE = 1, BMAPLIB_TAB_FROM_HERE = 2;
(function() {
    var d, c = d = c || {version: '1.5.0'};
    c.guid = '$BAIDU$';
    (function() {
        window[c.guid] = window[c.guid] || {};
        c.lang = c.lang || {};
        c.lang.isString = function(e) {
            return '[object String]' == Object.prototype.toString.call(e)
        };
        c.lang.Event = function(e, f) {
            this.type = e;
            this.returnValue = true;
            this.target = f || null;
            this.currentTarget = null
        };
        c.object = c.object || {};
        c.extend = c.object.extend = function(g, e) {
            for (var f in e) {
                if (e.hasOwnProperty(f)) {
                    g[f] = e[f]
                }
            }
            return g
        };
        c.event = c.event || {};
        c.event._listeners = c.event._listeners || [];
        c.dom = c.dom || {};
        c.dom._g = function(e) {
            if (c.lang.isString(e)) {
                return document.getElementById(e)
            }
            return e
        };
        c._g = c.dom._g;
        c.event.on = function(f, i, k) {
            i = i.replace(/^on/i, '');
            f = c.dom._g(f);
            var j = function(m) {
                k.call(f, m)
            }, e = c.event._listeners, h = c.event._eventFilter, l, g = i;
            i = i.toLowerCase();
            if (h && h[i]) {
                l = h[i](f, i, j);
                g = l.type;
                j = l.listener
            }
            if (f.addEventListener) {
                f.addEventListener(g, j, false)
            } else {
                if (f.attachEvent) {
                    f.attachEvent('on' + g, j)
                }
            }
            e[e.length] = [f, i, k, j, g];
            return f
        };
        c.on = c.event.on;
        c.event.un = function(g, j, f) {
            g = c.dom._g(g);
            j = j.replace(/^on/i, '').toLowerCase();
            var m = c.event._listeners, h = m.length, i = !f, l, k, e;
            while (h--) {
                l = m[h];
                if (l[1] === j && l[0] === g && (i || l[2] === f)) {
                    k = l[4];
                    e = l[3];
                    if (g.removeEventListener) {
                        g.removeEventListener(k, e, false)
                    } else {
                        if (g.detachEvent) {
                            g.detachEvent('on' + k, e)
                        }
                    }
                    m.splice(h, 1)
                }
            }
            return g
        };
        c.un = c.event.un;
        c.dom.g = function(e) {
            if ('string' == typeof e || e instanceof String) {
                return document.getElementById(e)
            } else {
                if (e && e.nodeName && (e.nodeType == 1 || e.nodeType == 9)) {
                    return e
                }
            }
            return null
        };
        c.g = c.G = c.dom.g;
        c.string = c.string || {};
        c.browser = c.browser || {};
        c.browser.ie = c.ie = /msie (\d+\.\d+)/i.test(navigator.userAgent) ? (document.documentMode || +RegExp['\x241']) : undefined;
        c.dom._NAME_ATTRS = (function() {
            var e = {
                cellpadding: 'cellPadding',
                cellspacing: 'cellSpacing',
                colspan: 'colSpan',
                rowspan: 'rowSpan',
                valign: 'vAlign',
                usemap: 'useMap',
                frameborder: 'frameBorder'
            };
            if (c.browser.ie < 8) {
                e['for'] = 'htmlFor';
                e['class'] = 'className'
            } else {
                e.htmlFor = 'for';
                e.className = 'class'
            }
            return e
        })();
        c.dom.setAttr = function(f, e, g) {
            f = c.dom.g(f);
            if ('style' == e) {
                f.style.cssText = g
            } else {
                e = c.dom._NAME_ATTRS[e] || e;
                f.setAttribute(e, g)
            }
            return f
        };
        c.setAttr = c.dom.setAttr;
        c.dom.setAttrs = function(g, e) {
            g = c.dom.g(g);
            for (var f in e) {
                c.dom.setAttr(g, f, e[f])
            }
            return g
        };
        c.setAttrs = c.dom.setAttrs;
        c.dom.create = function(g, e) {
            var h = document.createElement(g), f = e || {};
            return c.dom.setAttrs(h, f)
        };
        d.undope = true
    })();
    var a = BMapLib.SearchInfoWindow = function(g, f, e) {
        this.guid = b++;
        BMapLib.SearchInfoWindow.instance[this.guid] = this;
        this._isOpen = false;
        this._map = g;
        this._opts = e = e || {};
        this._content = f || '';
        this._opts.width = e.width;
        this._opts.height = e.height;
        this._opts._title = e.title || '';
        this._opts.offset = e.offset || new BMap.Size(0, 0);
        this._opts.enableAutoPan = e.enableAutoPan === false ? false : true;
        this._opts._panel = e.panel || null;
        this._opts._searchTypes = e.searchTypes
    };
    a.prototype = new BMap.Overlay();
    a.prototype.initialize = function(f) {
        this._closeOtherSearchInfo();
        var e = this;
        var h = this._createSearchTemplate();
        var g = f.getPanes().floatPane;
        g.style.width = 'auto';
        g.appendChild(h);
        this._initSearchTemplate();
        this._getSearchInfoWindowSize();
        this._boxWidth = parseInt(this.container.offsetWidth, 10);
        this._boxHeight = parseInt(this.container.offsetHeight, 10);
        c.event.on(h, 'onmousedown', function(i) {
            e._stopBubble(i)
        });
        c.event.on(h, 'onmouseover', function(i) {
            e._stopBubble(i)
        });
        c.event.on(h, 'click', function(i) {
            e._stopBubble(i)
        });
        c.event.on(h, 'dblclick', function(i) {
            e._stopBubble(i)
        });
        return h
    };
    a.prototype.draw = function() {
        this._isOpen && this._adjustPosition(this._point)
    };
    a.prototype.open = function(e) {
        this._map.closeInfoWindow();
        var f = this, g;
        if (!this._isOpen) {
            this._map.addOverlay(this);
            this._isOpen = true;
            setTimeout(function() {
                f._dispatchEvent(f, 'open', {point: f._point})
            }, 10)
        }
        if (e instanceof BMap.Point) {
            g = e;
            this._removeMarkerEvt();
            this._marker = null
        } else {
            if (e instanceof BMap.Marker) {
                if (this._marker) {
                    this._removeMarkerEvt()
                }
                g = e.getPosition();
                this._marker = e;
                !this._markerDragend && this._marker.addEventListener('dragend', this._markerDragend = function(h) {
                    f._point = h.point;
                    f._adjustPosition(f._point);
                    f._panBox();
                    f.show()
                });
                !this._markerDragging && this._marker.addEventListener('dragging', this._markerDragging = function() {
                    f.hide();
                    f._point = f._marker.getPosition();
                    f._adjustPosition(f._point)
                })
            }
        }
        this.show();
        this._point = g;
        this._panBox();
        this._adjustPosition(this._point)
    };
    a.prototype.close = function() {
        if (this._isOpen) {
            this._map.removeOverlay(this);
            this._disposeAutoComplete();
            this._isOpen = false;
            this._dispatchEvent(this, 'close', {point: this._point})
        }
    };
    a.prototype.enableAutoPan = function() {
        this._opts.enableAutoPan = true
    };
    a.prototype.disableAutoPan = function() {
        this._opts.enableAutoPan = false
    };
    a.prototype.setContent = function(e) {
        this._setContent(e);
        this._getSearchInfoWindowSize();
        this._adjustPosition(this._point)
    }, a.prototype.setTitle = function(e) {
        this.dom.title.innerHTML = e;
        this._opts._title = e
    };
    a.prototype.getContent = function() {
        return this.dom.content.innerHTML
    }, a.prototype.getTitle = function() {
        return this.dom.title.innerHTML
    };
    a.prototype.setPosition = function(e) {
        this._point = e;
        this._adjustPosition(e);
        this._panBox();
        this._removeMarkerEvt()
    };
    a.prototype.getPosition = function() {
        return this._point
    };
    a.prototype.getOffset = function() {
        return this._opts.offset
    }, c.object.extend(a.prototype, {
        _closeOtherSearchInfo: function() {
            var f = BMapLib.SearchInfoWindow.instance, e = f.length;
            while (e--) {
                if (f[e]._isOpen) {
                    f[e].close()
                }
            }
        }, _setContent: function(f) {
            if (!this.dom || !this.dom.content) {
                return
            }
            if (typeof f.nodeType === 'undefined') {
                this.dom.content.innerHTML = f
            } else {
                this.dom.content.appendChild(f)
            }
            var e = this;
            e._adjustContainerWidth();
            this._content = f
        }, _adjustPosition: function(g) {
            var e = this._getPointPosition(g);
            var f = this._marker && this._marker.getIcon();
            if (this._marker) {
                this.container.style.bottom = -(e.y - this._opts.offset.height - f.anchor.height + f.infoWindowAnchor.height) - this._marker.getOffset().height + 2 + 30 + 'px';
                this.container.style.left = e.x - f.anchor.width + this._marker.getOffset().width + f.infoWindowAnchor.width - this._boxWidth / 2 + 28 + 'px'
            } else {
                this.container.style.bottom = -(e.y - this._opts.offset.height) + 30 + 'px';
                this.container.style.left = e.x - this._boxWidth / 2 + 25 + 'px'
            }
        }, _getPointPosition: function(e) {
            this._pointPosition = this._map.pointToOverlayPixel(e);
            return this._pointPosition
        }, _getSearchInfoWindowSize: function() {
            this._boxWidth = parseInt(this.container.offsetWidth, 10);
            this._boxHeight = parseInt(this.container.offsetHeight, 10)
        }, _stopBubble: function(f) {
            if (f && f.stopPropagation) {
                f.stopPropagation()
            } else {
                window.event.cancelBubble = true
            }
        }, _panBox: function() {
            if (!this._opts.enableAutoPan) {
                return
            }
            var j = parseInt(this._map.getContainer().offsetHeight, 10), o = parseInt(this._map.getContainer().offsetWidth, 10), k = this._boxHeight, e = this._boxWidth;
            if (k >= j || e >= o) {
                return
            }
            if (!this._map.getBounds().containsPoint(this._point)) {
                this._map.setCenter(this._point)
            }
            var f = this._map.pointToPixel(this._point), p, m, i = e / 2 - 28 - f.x + 10, n = e / 2 + 28 + f.x - o + 10;
            if (this._marker) {
                var l = this._marker.getIcon()
            }
            var g = this._marker ? l.anchor.height + this._marker.getOffset().height - l.infoWindowAnchor.height : 0;
            p = k - f.y + this._opts.offset.height + g + 31 + 10;
            panX = i > 0 ? i : (n > 0 ? -n : 0);
            m = p > 0 ? p : 0;
            this._map.panBy(panX, m)
        }, _removeMarkerEvt: function() {
            this._markerDragend && this._marker.removeEventListener('dragend', this._markerDragend);
            this._markerDragging && this._marker.removeEventListener('dragging', this._markerDragging);
            this._markerDragend = this._markerDragging = null
        }, _dispatchEvent: function(e, f, h) {
            f.indexOf('on') != 0 && (f = 'on' + f);
            var g = new c.lang.Event(f);
            if (!!h) {
                for (var i in h) {
                    g[i] = h[i]
                }
            }
            e.dispatchEvent(g)
        }, _initSearchTemplate: function() {
            this._initDom();
            this._initPanelTemplate();
            this.setTitle(this._opts._title);
            if (this._opts.height) {
                this.dom.content.style.height = parseInt(this._opts.height, 10) + 'px'
            }
            this._setContent(this._content);
            this._initService();
            this._bind();
            if (this._opts._searchTypes) {
                this._setSearchTypes()
            }
            this._mendIE6()
        }, _createSearchTemplate: function() {
            if (!this._div) {
                var f = c.dom.create('div', {'class': 'BMapLib_SearchInfoWindow', id: 'BMapLib_SearchInfoWindow' + this.guid});
                var e = [
                    '<div class="BMapLib_bubble_top">',
                    '<div class="BMapLib_bubble_title" id="BMapLib_bubble_title' + this.guid + '"></div>',
                    '<div class="BMapLib_bubble_close" id="BMapLib_bubble_close' + this.guid + '">',
                    '<span>关闭</span>',
                    '</div>',
                    '</div>',
                    '<div class="BMapLib_bubble_center">',
                    '<div class="BMapLib_bubble_content" id="BMapLib_bubble_content' + this.guid + '">',
                    '</div>',
                    '<div class="BMapLib_nav" id="BMapLib_nav' + this.guid + '">',
                    '<ul class="BMapLib_nav_tab" id="BMapLib_nav_tab' + this.guid + '">',
                    '<li class="BMapLib_first BMapLib_current" id="BMapLib_tab_search' + this.guid + '" style="display:block;">',
                    '<span class="BMapLib_icon BMapLib_icon_nbs"></span>在附近找',
                    '</li>',
                    '<li class="" id="BMapLib_tab_tohere' + this.guid + '" style="display:block;">',
                    '<span class="BMapLib_icon BMapLib_icon_tohere"></span>到这里去',
                    '</li>',
                    '<li class="" id="BMapLib_tab_fromhere' + this.guid + '" style="display:block;">',
                    '<span class="BMapLib_icon BMapLib_icon_fromhere"></span>从这里出发',
                    '</li>',
                    '</ul>',
                    '<ul class="BMapLib_nav_tab_content">',
                    '<li id="BMapLib_searchBox' + this.guid + '">',
                    '<table width="100%" align="center" border=0 cellpadding=0 cellspacing=0>',
                    '<tr><td style="padding-left:8px;"><input id="BMapLib_search_text' + this.guid +
                    '" class="BMapLib_search_text" type="text" maxlength="100" autocomplete="off"></td><td width="55" style="padding-left:7px;"><input id="BMapLib_search_nb_btn' +
                    this.guid + '" type="submit" value="搜索" class="iw_bt"></td></tr>',
                    '</table>',
                    '</li>',
                    '<li id="BMapLib_transBox' + this.guid + '" style="display:none">',
                    '<table width="100%" align="center" border=0 cellpadding=0 cellspacing=0>',
                    '<tr><td width="30" style="padding-left:8px;"><div id="BMapLib_stationText' + this.guid + '">起点</div></td><td><input id="BMapLib_trans_text' + this.guid +
                    '" class="BMapLib_trans_text" type="text" maxlength="100" autocomplete="off"></td><td width="106" style="padding-left:7px;"><input id="BMapLib_search_bus_btn' +
                    this.guid + '" type="button" value="公交" class="iw_bt" style="margin-right:5px;"><input id="BMapLib_search_drive_btn' + this.guid +
                    '" type="button" class="iw_bt" value="驾车"></td></tr>',
                    '</table>',
                    '</li>',
                    '</ul>',
                    '</div>',
                    '</div>',
                    '<div class="BMapLib_bubble_bottom"></div>',
                    '<img src="http://api.map.baidu.com/library/SearchInfoWindow/1.4/src/iw_tail.png" width="58" height="31" alt="" class="BMapLib_trans" id="BMapLib_trans' +
                    this.guid + '" style="left:144px;"/>'];
                f.innerHTML = e.join('');
                this._div = f
            }
            return this._div
        }, _initPanelTemplate: function() {
            var f = c.g(this._opts._panel);
            if (!this.dom.panel && f) {
                f.innerHTML = '';
                this.dom.panel = f;
                var e = c.dom.create('div');
                e.style.cssText = 'display:none;background:#FD9;height:30px;line-height:30px;text-align:center;font-size:12px;color:#994C00;';
                f.appendChild(e);
                this.dom.panel.address = e;
                var g = c.dom.create('div');
                f.appendChild(g);
                this.dom.panel.localSearch = g
            }
        }, _initDom: function() {
            if (!this.dom) {
                this.dom = {
                    container: c.g('BMapLib_SearchInfoWindow' + this.guid),
                    content: c.g('BMapLib_bubble_content' + this.guid),
                    title: c.g('BMapLib_bubble_title' + this.guid),
                    closeBtn: c.g('BMapLib_bubble_close' + this.guid),
                    transIco: c.g('BMapLib_trans' + this.guid),
                    navBox: c.g('BMapLib_nav' + this.guid),
                    navTab: c.g('BMapLib_nav_tab' + this.guid),
                    seartTab: c.g('BMapLib_tab_search' + this.guid),
                    tohereTab: c.g('BMapLib_tab_tohere' + this.guid),
                    fromhereTab: c.g('BMapLib_tab_fromhere' + this.guid),
                    searchBox: c.g('BMapLib_searchBox' + this.guid),
                    transBox: c.g('BMapLib_transBox' + this.guid),
                    stationText: c.g('BMapLib_stationText' + this.guid),
                    nbBtn: c.g('BMapLib_search_nb_btn' + this.guid),
                    busBtn: c.g('BMapLib_search_bus_btn' + this.guid),
                    driveBtn: c.g('BMapLib_search_drive_btn' + this.guid),
                    searchText: c.g('BMapLib_search_text' + this.guid),
                    transText: c.g('BMapLib_trans_text' + this.guid)
                };
                this.container = this.dom.container
            }
        }, _adjustContainerWidth: function() {
            var f = 250, e = 0;
            if (this._opts.width) {
                f = parseInt(this._opts.width, 10);
                f += 10
            } else {
                f = parseInt(this.dom.content.offsetWidth, 10)
            }
            if (f < 250) {
                f = 250
            }
            this._width = f;
            this.container.style.width = this._width + 'px';
            this._adjustTransPosition()
        }, _adjustTransPosition: function() {
            this.dom.transIco.style.left = this.container.offsetWidth / 2 - 2 - 29 + 'px';
            this.dom.transIco.style.top = this.container.offsetHeight - 2 + 'px'
        }, _initService: function() {
            var g = this._map;
            var f = this;
            var e = {};
            e.map = g;
            if (this.dom.panel) {
                e.panel = this.dom.panel.localSearch
            }
            if (!this.localSearch) {
                this.localSearch = new BMap.LocalSearch(g, {
                    renderOptions: e, onSearchComplete: function(h) {
                        f._clearAddress();
                        f._drawCircleBound()
                    }
                })
            }
            if (!this.transitRoute) {
                this.transitRoute = new BMap.TransitRoute(g, {
                    renderOptions: e, onSearchComplete: function(h) {
                        f._transitRouteComplete(f.transitRoute, h)
                    }
                })
            }
            if (!this.drivingRoute) {
                this.drivingRoute = new BMap.DrivingRoute(g, {
                    renderOptions: e, onSearchComplete: function(h) {
                        f._transitRouteComplete(f.drivingRoute, h)
                    }
                })
            }
        }, _bind: function() {
            var e = this;
            c.on(this.dom.closeBtn, 'click', function(f) {
                e.close()
            });
            c.on(this.dom.seartTab, 'click', function(f) {
                e._showTabContent(BMAPLIB_TAB_SEARCH)
            });
            c.on(this.dom.tohereTab, 'click', function(f) {
                e._showTabContent(BMAPLIB_TAB_TO_HERE)
            });
            c.on(this.dom.fromhereTab, 'click', function(f) {
                e._showTabContent(BMAPLIB_TAB_FROM_HERE)
            });
            c.on(this.dom.nbBtn, 'click', function(f) {
                e._localSearchAction()
            });
            c.on(this.dom.busBtn, 'click', function(f) {
                e._transitRouteAction(e.transitRoute)
            });
            c.on(this.dom.driveBtn, 'click', function(f) {
                e._transitRouteAction(e.drivingRoute)
            });
            this._autoCompleteIni()
        }, _showTabContent: function(h) {
            this._hideAutoComplete();
            var g = this.dom.navTab.getElementsByTagName('li'), e = g.length;
            for (var f = 0, e = g.length; f < e; f++) {
                g[f].className = ''
            }
            switch (h) {
                case BMAPLIB_TAB_SEARCH:
                    this.dom.seartTab.className = 'BMapLib_current';
                    this.dom.searchBox.style.display = 'block';
                    this.dom.transBox.style.display = 'none';
                    break;
                case BMAPLIB_TAB_TO_HERE:
                    this.dom.tohereTab.className = 'BMapLib_current';
                    this.dom.searchBox.style.display = 'none';
                    this.dom.transBox.style.display = 'block';
                    this.dom.stationText.innerHTML = '起点';
                    this._pointType = 'endPoint';
                    break;
                case BMAPLIB_TAB_FROM_HERE:
                    this.dom.fromhereTab.className = 'BMapLib_current';
                    this.dom.searchBox.style.display = 'none';
                    this.dom.transBox.style.display = 'block';
                    this.dom.stationText.innerHTML = '终点';
                    this._pointType = 'startPoint';
                    break
            }
            this._firstTab.className += ' BMapLib_first'
        }, _autoCompleteIni: function() {
            this.searchAC = new BMap.Autocomplete({input: this.dom.searchText, location: this._map});
            this.transAC = new BMap.Autocomplete({input: this.dom.transText, location: this._map})
        }, _hideAutoComplete: function() {
            this.searchAC.hide();
            this.transAC.hide()
        }, _disposeAutoComplete: function() {
            this.searchAC.dispose();
            this.transAC.dispose()
        }, _localSearchAction: function() {
            var f = this._kw = this.dom.searchText.value;
            if (f == '') {
                this.dom.searchText.focus()
            } else {
                this._reset();
                this.close();
                var e = this._radius = 1000;
                this.localSearch.searchNearby(f, this._point, e)
            }
        }, _drawCircleBound: function() {
            this._closeCircleBound();
            var f = this._searchCircle = new BMap.Circle(this._point, this._radius, {strokeWeight: 3, strokeOpacity: 0.4, strokeColor: '#e00', filColor: '#00e', fillOpacity: 0.4});
            var e = this._searchLabel = new BMap.Label(
                '<div onmousedown ="BMapLib.SearchInfoWindow.instance[' + this.guid + ']._stopBubble()"><input type="text" value="' + this._radius +
                '" style="width:30px;" id="BMapLib_search_radius' + this.guid + '"/>m <a href="javascript:void(0)" title="修改" onclick="BMapLib.SearchInfoWindow.instance[' +
                this.guid +
                ']._changeSearchRadius()" style="text-decoration:none;color:blue;">修改</a><img src="http://api.map.baidu.com/images/iw_close1d3.gif" alt="关闭" title="关闭" style="cursor:pointer;padding:0 5px;" onclick="BMapLib.SearchInfoWindow.instance[' +
                this.guid + ']._closeCircleBound()"/></div>', {position: this._point});
            this._map.addOverlay(f);
            this._map.addOverlay(e);
            this._hasCircle = true
        }, _changeSearchRadius: function() {
            var e = parseInt(c.g('BMapLib_search_radius' + this.guid).value, 10);
            if (e > 0 && e != this._radius) {
                this._radius = e;
                this.localSearch.searchNearby(this._kw, this._point, e);
                this._closeCircleBound()
            }
        }, _closeCircleBound: function(e) {
            if (this._searchCircle) {
                this._map.removeOverlay(this._searchCircle)
            }
            if (this._searchLabel) {
                this._map.removeOverlay(this._searchLabel)
            }
            this._hasCircle = false
        }, _transitRouteAction: function(e) {
            var f = this.dom.transText.value;
            if (f == '') {
                this.dom.transText.focus()
            } else {
                this._reset();
                this.close();
                var g = this._getTransPoi(f);
                e.search(g.start, g.end)
            }
        }, _transitRouteComplete: function(e, h) {
            this._clearAddress();
            var f = e.getStatus();
            if (f == BMAP_STATUS_UNKNOWN_ROUTE) {
                var g = h.getStartStatus(), i = h.getEndStatus(), j = '';
                j = '找不到相关的线路';
                if (g == BMAP_ROUTE_STATUS_EMPTY && i == BMAP_ROUTE_STATUS_EMPTY) {
                    j = '找不到相关的起点和终点'
                } else {
                    if (g == BMAP_ROUTE_STATUS_EMPTY) {
                        j = '找不到相关的起点'
                    }
                    if (i == BMAP_ROUTE_STATUS_EMPTY) {
                        j = '找不到相关的终点'
                    }
                }
                if (this._pointType == 'startPoint' && i == BMAP_ROUTE_STATUS_ADDRESS || this._pointType == 'endPoint' && g == BMAP_ROUTE_STATUS_ADDRESS) {
                    this._searchAddress(e)
                } else {
                    this.dom.panel.address.style.display = 'block';
                    this.dom.panel.address.innerHTML = j
                }
            }
        }, _searchAddress: function(e) {
            var i = this;
            var f = this.dom.panel;
            if (!this.lsAddress) {
                var g = {map: this._map};
                if (f) {
                    g.panel = this.dom.panel.localSearch
                }
                this.lsAddress = new BMap.LocalSearch(map, {renderOptions: g})
            }
            var h = i._pointType == 'startPoint' ? '终点' : '起点';
            if (f) {
                this.dom.panel.address.style.display = 'block';
                this.dom.panel.address.innerHTML = '请选择准确的' + h
            }
            this.lsAddress.setInfoHtmlSetCallback(function(l, k) {
                var j = document.createElement('div');
                j.style.cssText = 'position:relative;left:50%;margin:5px 0 0 -30px;width:60px;height:27px;line-height:27px;border:1px solid #E0C3A6;text-align:center;color:#B35900;cursor:pointer;background-color:#FFEECC;border-radius:2px; background-image: -webkit-gradient(linear, left top, left bottom, from(#FFFDF8), to(#FFEECC))';
                j.innerHTML = '设为' + h;
                k.appendChild(j);
                c.on(j, 'click', function() {
                    i._clearAddress();
                    var m = l.marker.getPosition();
                    if (h == '起点') {
                        e.search(m, i._point)
                    } else {
                        e.search(i._point, m)
                    }
                })
            });
            this._reset();
            this.lsAddress.search(this.dom.transText.value)
        }, _getTransPoi: function(f) {
            var g, e;
            if (this._pointType == 'startPoint') {
                g = this._point;
                e = f
            } else {
                g = f;
                e = this._point
            }
            return {start: g, end: e}
        }, _setSearchTypes: function() {
            var l = this._unique(this._opts._searchTypes), f = this.dom.navTab, k = [this.dom.seartTab, this.dom.tohereTab, this.dom.fromhereTab], j = 0, e = 0, h = 0, m;
            this.tabLength = l.length;
            tabWidth = Math.floor((this._width - this.tabLength + 1) / this.tabLength);
            if (l.length == 0) {
                this.dom.navBox.style.display = 'none'
            } else {
                for (j = 0, e = k.length; j < e; j++) {
                    k[j].className = '';
                    k[j].style.display = 'none'
                }
                for (j = 0; j < this.tabLength; j++) {
                    m = k[l[j]];
                    if (j == 0) {
                        m.className = 'BMapLib_first BMapLib_current';
                        this._firstTab = m;
                        h = l[j]
                    }
                    if (j == this.tabLength - 1) {
                        var g = this._width - (this.tabLength - 1) * (tabWidth + 1);
                        if (c.browser.ie == 6) {
                            m.style.width = g - 3 + 'px'
                        } else {
                            m.style.width = g + 'px'
                        }
                    } else {
                        m.style.width = tabWidth + 'px'
                    }
                    m.style.display = 'block'
                }
                if (l[1] != undefined) {
                    f.appendChild(k[l[1]])
                }
                if (l[2] != undefined) {
                    f.appendChild(k[l[2]])
                }
                this._showTabContent(h)
            }
            this._adjustTransPosition()
        }, _unique: function(g) {
            var f = g.length, e = g.slice(0), j, h;
            while (--f >= 0) {
                h = e[f];
                if (h < 0 || h > 2) {
                    e.splice(f, 1);
                    continue
                }
                j = f;
                while (j--) {
                    if (h == e[j]) {
                        e.splice(f, 1);
                        break
                    }
                }
            }
            return e
        }, _reset: function() {
            this.localSearch.clearResults();
            this.transitRoute.clearResults();
            this.drivingRoute.clearResults();
            this._closeCircleBound();
            this._hideAutoComplete()
        }, _clearAddress: function() {
            if (this.lsAddress) {
                this.lsAddress.clearResults()
            }
            if (this.dom.panel) {
                this.dom.panel.address.style.display = 'none'
            }
        }, _mendIE6: function(g) {
            if (!c.browser.ie || c.browser.ie > 6) {
                return
            }
            var f = this.container.getElementsByTagName('IMG');
            for (var e = 0; e < f.length; e++) {
                if (f[e].src.indexOf('.png') < 0) {
                    continue
                }
                f[e].style.cssText += ';FILTER: progid:DXImageTransform.Microsoft.AlphaImageLoader(src=' + f[e].src + ',sizingMethod=crop)';
                f[e].src = 'http://api.map.baidu.com/images/blank.gif'
            }
        }
    });
    var b = 0;
    BMapLib.SearchInfoWindow.instance = []
})();

//==== TextIconOverlay.js=============================
/**
 * @fileoverview 此类表示地图上的一个覆盖物，该覆盖物由文字和图标组成，从Overlay继承。
 * 主入口类是<a href="symbols/BMapLib.TextIconOverlay.html">TextIconOverlay</a>，
 * 基于Baidu Map API 1.2。
 *
 * @author Baidu Map Api Group
 * @version 1.2
 */

/**
 * @namespace BMap的所有library类均放在BMapLib命名空间下
 */
var BMapLib = window.BMapLib = BMapLib || {};

(function() {

    /**
     * 声明baidu包
     */
    var T,
        baidu = T = baidu || {version: '1.3.8'};

    (function() {
        //提出guid，防止在与老版本Tangram混用时
        //在下一行错误的修改window[undefined]
        baidu.guid = '$BAIDU$';

        //Tangram可能被放在闭包中
        //一些页面级别唯一的属性，需要挂载在window[baidu.guid]上
        window[baidu.guid] = window[baidu.guid] || {};

        /**
         * @ignore
         * @namespace baidu.dom 操作dom的方法。
         */
        baidu.dom = baidu.dom || {};

        /**
         * 从文档中获取指定的DOM元素
         * @name baidu.dom.g
         * @function
         * @grammar baidu.dom.g(id)
         * @param {string|HTMLElement} id 元素的id或DOM元素
         * @shortcut g,T.G
         * @meta standard
         * @see baidu.dom.q
         *
         * @returns {HTMLElement|null} 获取的元素，查找不到时返回null,如果参数不合法，直接返回参数
         */
        baidu.dom.g = function(id) {
            if ('string' == typeof id || id instanceof String) {
                return document.getElementById(id);
            } else if (id && id.nodeName && (id.nodeType == 1 || id.nodeType == 9)) {
                return id;
            }
            return null;
        };

        // 声明快捷方法
        baidu.g = baidu.G = baidu.dom.g;

        /**
         * 获取目标元素所属的document对象
         * @name baidu.dom.getDocument
         * @function
         * @grammar baidu.dom.getDocument(element)
         * @param {HTMLElement|string} element 目标元素或目标元素的id
         * @meta standard
         * @see baidu.dom.getWindow
         *
         * @returns {HTMLDocument} 目标元素所属的document对象
         */
        baidu.dom.getDocument = function(element) {
            element = baidu.dom.g(element);
            return element.nodeType == 9 ? element : element.ownerDocument || element.document;
        };

        /**
         * @ignore
         * @namespace baidu.lang 对语言层面的封装，包括类型判断、模块扩展、继承基类以及对象自定义事件的支持。
         */
        baidu.lang = baidu.lang || {};

        /**
         * 判断目标参数是否string类型或String对象
         * @name baidu.lang.isString
         * @function
         * @grammar baidu.lang.isString(source)
         * @param {Any} source 目标参数
         * @shortcut isString
         * @meta standard
         * @see baidu.lang.isObject,baidu.lang.isNumber,baidu.lang.isArray,baidu.lang.isElement,baidu.lang.isBoolean,baidu.lang.isDate
         *
         * @returns {boolean} 类型判断结果
         */
        baidu.lang.isString = function(source) {
            return '[object String]' == Object.prototype.toString.call(source);
        };

        // 声明快捷方法
        baidu.isString = baidu.lang.isString;

        /**
         * 从文档中获取指定的DOM元素
         * **内部方法**
         *
         * @param {string|HTMLElement} id 元素的id或DOM元素
         * @meta standard
         * @return {HTMLElement} DOM元素，如果不存在，返回null，如果参数不合法，直接返回参数
         */
        baidu.dom._g = function(id) {
            if (baidu.lang.isString(id)) {
                return document.getElementById(id);
            }
            return id;
        };

        // 声明快捷方法
        baidu._g = baidu.dom._g;

        /**
         * @ignore
         * @namespace baidu.browser 判断浏览器类型和特性的属性。
         */
        baidu.browser = baidu.browser || {};

        if (/msie (\d+\.\d)/i.test(navigator.userAgent)) {
            //IE 8下，以documentMode为准
            //在百度模板中，可能会有$，防止冲突，将$1 写成 \x241
            /**
             * 判断是否为ie浏览器
             * @property ie ie版本号
             * @grammar baidu.browser.ie
             * @meta standard
             * @shortcut ie
             * @see baidu.browser.firefox,baidu.browser.safari,baidu.browser.opera,baidu.browser.chrome,baidu.browser.maxthon
             */
            baidu.browser.ie = baidu.ie = document.documentMode || +RegExp['\x241'];
        }

        /**
         * 获取目标元素的computed style值。如果元素的样式值不能被浏览器计算，则会返回空字符串（IE）
         *
         * @author berg
         * @name baidu.dom.getComputedStyle
         * @function
         * @grammar baidu.dom.getComputedStyle(element, key)
         * @param {HTMLElement|string} element 目标元素或目标元素的id
         * @param {string} key 要获取的样式名
         *
         * @see baidu.dom.getStyle
         *
         * @returns {string} 目标元素的computed style值
         */

        baidu.dom.getComputedStyle = function(element, key) {
            element = baidu.dom._g(element);
            var doc = baidu.dom.getDocument(element),
                styles;
            if (doc.defaultView && doc.defaultView.getComputedStyle) {
                styles = doc.defaultView.getComputedStyle(element, null);
                if (styles) {
                    return styles[key] || styles.getPropertyValue(key);
                }
            }
            return '';
        };

        /**
         * 提供给setStyle与getStyle使用
         */
        baidu.dom._styleFixer = baidu.dom._styleFixer || {};

        /**
         * 提供给setStyle与getStyle使用
         */
        baidu.dom._styleFilter = baidu.dom._styleFilter || [];

        /**
         * 为获取和设置样式的过滤器
         * @private
         * @meta standard
         */
        baidu.dom._styleFilter.filter = function(key, value, method) {
            for (var i = 0, filters = baidu.dom._styleFilter, filter; filter = filters[i]; i++) {
                if (filter = filter[method]) {
                    value = filter(key, value);
                }
            }
            return value;
        };

        /**
         * @ignore
         * @namespace baidu.string 操作字符串的方法。
         */
        baidu.string = baidu.string || {};

        /**
         * 将目标字符串进行驼峰化处理
         * @name baidu.string.toCamelCase
         * @function
         * @grammar baidu.string.toCamelCase(source)
         * @param {string} source 目标字符串
         * @remark
         * 支持单词以“-_”分隔
         * @meta standard
         *
         * @returns {string} 驼峰化处理后的字符串
         */
        baidu.string.toCamelCase = function(source) {
            //提前判断，提高getStyle等的效率 thanks xianwei
            if (source.indexOf('-') < 0 && source.indexOf('_') < 0) {
                return source;
            }
            return source.replace(/[-_][^-_]/g, function(match) {
                return match.charAt(1).toUpperCase();
            });
        };

        /**
         * 获取目标元素的样式值
         * @name baidu.dom.getStyle
         * @function
         * @grammar baidu.dom.getStyle(element, key)
         * @param {HTMLElement|string} element 目标元素或目标元素的id
         * @param {string} key 要获取的样式名
         * @remark
         *
         * 为了精简代码，本模块默认不对任何浏览器返回值进行归一化处理（如使用getStyle时，不同浏览器下可能返回rgb颜色或hex颜色），也不会修复浏览器的bug和差异性（如设置IE的float属性叫styleFloat，firefox则是cssFloat）。<br />
         * baidu.dom._styleFixer和baidu.dom._styleFilter可以为本模块提供支持。<br />
         * 其中_styleFilter能对颜色和px进行归一化处理，_styleFixer能对display，float，opacity，textOverflow的浏览器兼容性bug进行处理。
         * @shortcut getStyle
         * @meta standard
         * @see baidu.dom.setStyle,baidu.dom.setStyles, baidu.dom.getComputedStyle
         *
         * @returns {string} 目标元素的样式值
         */
        baidu.dom.getStyle = function(element, key) {
            var dom = baidu.dom;

            element = dom.g(element);
            key = baidu.string.toCamelCase(key);
            //computed style, then cascaded style, then explicitly set style.
            var value = element.style[key] ||
                (element.currentStyle ? element.currentStyle[key] : '') ||
                dom.getComputedStyle(element, key);

            // 在取不到值的时候，用fixer进行修正
            if (!value) {
                var fixer = dom._styleFixer[key];
                if (fixer) {
                    value = fixer.get ? fixer.get(element) : baidu.dom.getStyle(element, fixer);
                }
            }

            /* 检查结果过滤器 */
            if (fixer = dom._styleFilter) {
                value = fixer.filter(key, value, 'get');
            }

            return value;
        };

        // 声明快捷方法
        baidu.getStyle = baidu.dom.getStyle;

        if (/opera\/(\d+\.\d)/i.test(navigator.userAgent)) {
            /**
             * 判断是否为opera浏览器
             * @property opera opera版本号
             * @grammar baidu.browser.opera
             * @meta standard
             * @see baidu.browser.ie,baidu.browser.firefox,baidu.browser.safari,baidu.browser.chrome
             */
            baidu.browser.opera = +RegExp['\x241'];
        }

        /**
         * 判断是否为webkit内核
         * @property isWebkit
         * @grammar baidu.browser.isWebkit
         * @meta standard
         * @see baidu.browser.isGecko
         */
        baidu.browser.isWebkit = /webkit/i.test(navigator.userAgent);

        /**
         * 判断是否为gecko内核
         * @property isGecko
         * @grammar baidu.browser.isGecko
         * @meta standard
         * @see baidu.browser.isWebkit
         */
        baidu.browser.isGecko = /gecko/i.test(navigator.userAgent) && !/like gecko/i.test(navigator.userAgent);

        /**
         * 判断是否严格标准的渲染模式
         * @property isStrict
         * @grammar baidu.browser.isStrict
         * @meta standard
         */
        baidu.browser.isStrict = document.compatMode == 'CSS1Compat';

        /**
         * 获取目标元素相对于整个文档左上角的位置
         * @name baidu.dom.getPosition
         * @function
         * @grammar baidu.dom.getPosition(element)
         * @param {HTMLElement|string} element 目标元素或目标元素的id
         * @meta standard
         *
         * @returns {Object} 目标元素的位置，键值为top和left的Object。
         */
        baidu.dom.getPosition = function(element) {
            element = baidu.dom.g(element);
            var doc = baidu.dom.getDocument(element),
                browser = baidu.browser,
                getStyle = baidu.dom.getStyle,
                // Gecko 1.9版本以下用getBoxObjectFor计算位置
                // 但是某些情况下是有bug的
                // 对于这些有bug的情况
                // 使用递归查找的方式
                BUGGY_GECKO_BOX_OBJECT = browser.isGecko > 0 &&
                    doc.getBoxObjectFor &&
                    getStyle(element, 'position') == 'absolute' &&
                    (element.style.top === '' || element.style.left === ''),
                pos = {'left': 0, 'top': 0},
                viewport = (browser.ie && !browser.isStrict) ? doc.body : doc.documentElement,
                parent,
                box;

            if (element == viewport) {
                return pos;
            }

            if (element.getBoundingClientRect) { // IE and Gecko 1.9+

                //当HTML或者BODY有border width时, 原生的getBoundingClientRect返回值是不符合预期的
                //考虑到通常情况下 HTML和BODY的border只会设成0px,所以忽略该问题.
                box = element.getBoundingClientRect();

                pos.left = Math.floor(box.left) + Math.max(doc.documentElement.scrollLeft, doc.body.scrollLeft);
                pos.top = Math.floor(box.top) + Math.max(doc.documentElement.scrollTop, doc.body.scrollTop);

                // IE会给HTML元素添加一个border，默认是medium（2px）
                // 但是在IE 6 7 的怪异模式下，可以被html { border: 0; } 这条css规则覆盖
                // 在IE7的标准模式下，border永远是2px，这个值通过clientLeft 和 clientTop取得
                // 但是。。。在IE 6 7的怪异模式，如果用户使用css覆盖了默认的medium
                // clientTop和clientLeft不会更新
                pos.left -= doc.documentElement.clientLeft;
                pos.top -= doc.documentElement.clientTop;

                var htmlDom = doc.body,
                    // 在这里，不使用element.style.borderLeftWidth，只有computedStyle是可信的
                    htmlBorderLeftWidth = parseInt(getStyle(htmlDom, 'borderLeftWidth')),
                    htmlBorderTopWidth = parseInt(getStyle(htmlDom, 'borderTopWidth'));
                if (browser.ie && !browser.isStrict) {
                    pos.left -= isNaN(htmlBorderLeftWidth) ? 2 : htmlBorderLeftWidth;
                    pos.top -= isNaN(htmlBorderTopWidth) ? 2 : htmlBorderTopWidth;
                }
            } else {
                // safari/opera/firefox
                parent = element;

                do {
                    pos.left += parent.offsetLeft;
                    pos.top += parent.offsetTop;

                    // safari里面，如果遍历到了一个fixed的元素，后面的offset都不准了
                    if (browser.isWebkit > 0 && getStyle(parent, 'position') == 'fixed') {
                        pos.left += doc.body.scrollLeft;
                        pos.top += doc.body.scrollTop;
                        break;
                    }

                    parent = parent.offsetParent;
                } while (parent && parent != element);

                // 对body offsetTop的修正
                if (browser.opera > 0 || (browser.isWebkit > 0 && getStyle(element, 'position') == 'absolute')) {
                    pos.top -= doc.body.offsetTop;
                }

                // 计算除了body的scroll
                parent = element.offsetParent;
                while (parent && parent != doc.body) {
                    pos.left -= parent.scrollLeft;
                    // see https://bugs.opera.com/show_bug.cgi?id=249965
                    if (!browser.opera || parent.tagName != 'TR') {
                        pos.top -= parent.scrollTop;
                    }
                    parent = parent.offsetParent;
                }
            }

            return pos;
        };

        /**
         * @ignore
         * @namespace baidu.event 屏蔽浏览器差异性的事件封装。
         * @property target  事件的触发元素
         * @property pageX    鼠标事件的鼠标x坐标
         * @property pageY    鼠标事件的鼠标y坐标
         * @property keyCode  键盘事件的键值
         */
        baidu.event = baidu.event || {};

        /**
         * 事件监听器的存储表
         * @private
         * @meta standard
         */
        baidu.event._listeners = baidu.event._listeners || [];

        /**
         * 为目标元素添加事件监听器
         * @name baidu.event.on
         * @function
         * @grammar baidu.event.on(element, type, listener)
         * @param {HTMLElement|string|window} element 目标元素或目标元素id
         * @param {string} type 事件类型
         * @param {Function} listener 需要添加的监听器
         * @remark
         *
         1. 不支持跨浏览器的鼠标滚轮事件监听器添加<br>
         2. 改方法不为监听器灌入事件对象，以防止跨iframe事件挂载的事件对象获取失败

         * @shortcut on
         * @meta standard
         * @see baidu.event.un
         *
         * @returns {HTMLElement|window} 目标元素
         */
        baidu.event.on = function(element, type, listener) {
            type = type.replace(/^on/i, '');
            element = baidu.dom._g(element);

            var realListener = function(ev) {
                    // 1. 这里不支持EventArgument,  原因是跨frame的事件挂载
                    // 2. element是为了修正this
                    listener.call(element, ev);
                },
                lis = baidu.event._listeners,
                filter = baidu.event._eventFilter,
                afterFilter,
                realType = type;
            type = type.toLowerCase();
            // filter过滤
            if (filter && filter[type]) {
                afterFilter = filter[type](element, type, realListener);
                realType = afterFilter.type;
                realListener = afterFilter.listener;
            }

            // 事件监听器挂载
            if (element.addEventListener) {
                element.addEventListener(realType, realListener, false);
            } else if (element.attachEvent) {
                element.attachEvent('on' + realType, realListener);
            }

            // 将监听器存储到数组中
            lis[lis.length] = [element, type, listener, realListener, realType];
            return element;
        };

        // 声明快捷方法
        baidu.on = baidu.event.on;

        /**
         * 返回一个当前页面的唯一标识字符串。
         * @name baidu.lang.guid
         * @function
         * @grammar baidu.lang.guid()
         * @version 1.1.1
         * @meta standard
         *
         * @returns {String} 当前页面的唯一标识字符串
         */

        (function() {
            //不直接使用window，可以提高3倍左右性能
            var guid = window[baidu.guid];

            baidu.lang.guid = function() {
                return 'TANGRAM__' + (guid._counter++).toString(36);
            };

            guid._counter = guid._counter || 1;
        })();

        /**
         * 所有类的实例的容器
         * key为每个实例的guid
         * @meta standard
         */

        window[baidu.guid]._instances = window[baidu.guid]._instances || {};

        /**
         * 判断目标参数是否为function或Function实例
         * @name baidu.lang.isFunction
         * @function
         * @grammar baidu.lang.isFunction(source)
         * @param {Any} source 目标参数
         * @version 1.2
         * @see baidu.lang.isString,baidu.lang.isObject,baidu.lang.isNumber,baidu.lang.isArray,baidu.lang.isElement,baidu.lang.isBoolean,baidu.lang.isDate
         * @meta standard
         * @returns {boolean} 类型判断结果
         */
        baidu.lang.isFunction = function(source) {
            // chrome下,'function' == typeof /a/ 为true.
            return '[object Function]' == Object.prototype.toString.call(source);
        };

        /**
         *
         * @ignore
         * @class  Tangram继承机制提供的一个基类，用户可以通过继承baidu.lang.Class来获取它的属性及方法。
         * @name  baidu.lang.Class
         * @grammar baidu.lang.Class(guid)
         * @param  {string}  guid  对象的唯一标识
         * @meta standard
         * @remark baidu.lang.Class和它的子类的实例均包含一个全局唯一的标识guid。guid是在构造函数中生成的，因此，继承自baidu.lang.Class的类应该直接或者间接调用它的构造函数。<br>baidu.lang.Class的构造函数中产生guid的方式可以保证guid的唯一性，及每个实例都有一个全局唯一的guid。
         * @meta standard
         * @see baidu.lang.inherits,baidu.lang.Event
         */
        baidu.lang.Class = function(guid) {
            this.guid = guid || baidu.lang.guid();
            window[baidu.guid]._instances[this.guid] = this;
        };
        window[baidu.guid]._instances = window[baidu.guid]._instances || {};

        /**
         * 释放对象所持有的资源，主要是自定义事件。
         * @name dispose
         * @grammar obj.dispose()
         */
        baidu.lang.Class.prototype.dispose = function() {
            delete window[baidu.guid]._instances[this.guid];

            for (var property in this) {
                if (!baidu.lang.isFunction(this[property])) {
                    delete this[property];
                }
            }
            this.disposed = true;
        };

        /**
         * 重载了默认的toString方法，使得返回信息更加准确一些。
         * @return {string} 对象的String表示形式
         */
        baidu.lang.Class.prototype.toString = function() {
            return '[object ' + (this._className || 'Object' ) + ']';
        };

        /**
         * @ignore
         * @class   自定义的事件对象。
         * @name  baidu.lang.Event
         * @grammar baidu.lang.Event(type[, target])
         * @param  {string} type   事件类型名称。为了方便区分事件和一个普通的方法，事件类型名称必须以"on"(小写)开头。
         * @param  {Object} [target]触发事件的对象
         * @meta standard
         * @remark 引入该模块，会自动为Class引入3个事件扩展方法：addEventListener、removeEventListener和dispatchEvent。
         * @meta standard
         * @see baidu.lang.Class
         */
        baidu.lang.Event = function(type, target) {
            this.type = type;
            this.returnValue = true;
            this.target = target || null;
            this.currentTarget = null;
        };

        /**
         * 注册对象的事件监听器。引入baidu.lang.Event后，Class的子类实例才会获得该方法。
         * @grammar obj.addEventListener(type, handler[, key])
         * @param  {string}   type         自定义事件的名称
         * @param  {Function} handler      自定义事件被触发时应该调用的回调函数
         * @param  {string}   [key]    为事件监听函数指定的名称，可在移除时使用。如果不提供，方法会默认为它生成一个全局唯一的key。
         * @remark  事件类型区分大小写。如果自定义事件名称不是以小写"on"开头，该方法会给它加上"on"再进行判断，即"click"和"onclick"会被认为是同一种事件。
         */
        baidu.lang.Class.prototype.addEventListener = function(type, handler, key) {
            if (!baidu.lang.isFunction(handler)) {
                return;
            }

            !this.__listeners && (this.__listeners = {});

            var t = this.__listeners, id;
            if (typeof key == 'string' && key) {
                if (/[^\w\-]/.test(key)) {
                    throw('nonstandard key:' + key);
                } else {
                    handler.hashCode = key;
                    id = key;
                }
            }
            type.indexOf('on') != 0 && (type = 'on' + type);

            typeof t[type] != 'object' && (t[type] = {});
            id = id || baidu.lang.guid();
            handler.hashCode = id;
            t[type][id] = handler;
        };

        /**
         * 移除对象的事件监听器。引入baidu.lang.Event后，Class的子类实例才会获得该方法。
         * @grammar obj.removeEventListener(type, handler)
         * @param {string}   type     事件类型
         * @param {Function|string} handler  要移除的事件监听函数或者监听函数的key
         * @remark  如果第二个参数handler没有被绑定到对应的自定义事件中，什么也不做。
         */
        baidu.lang.Class.prototype.removeEventListener = function(type, handler) {
            if (typeof handler != 'undefined') {
                if ((baidu.lang.isFunction(handler) && !(handler = handler.hashCode))
                    || (!baidu.lang.isString(handler))
                ) {
                    return;
                }
            }

            !this.__listeners && (this.__listeners = {});

            type.indexOf('on') != 0 && (type = 'on' + type);

            var t = this.__listeners;
            if (!t[type]) {
                return;
            }
            if (typeof handler != 'undefined') {
                t[type][handler] && delete t[type][handler];
            } else {
                for (var guid in t[type]) {
                    delete t[type][guid];
                }
            }
        };

        /**
         * 派发自定义事件，使得绑定到自定义事件上面的函数都会被执行。引入baidu.lang.Event后，Class的子类实例才会获得该方法。
         * @grammar obj.dispatchEvent(event, options)
         * @param {baidu.lang.Event|String} event  Event对象，或事件名称(1.1.1起支持)
         * @param {Object}          options 扩展参数,所含属性键值会扩展到Event对象上(1.2起支持)
         * @remark 处理会调用通过addEventListenr绑定的自定义事件回调函数之外，还会调用直接绑定到对象上面的自定义事件。例如：<br>
         myobj.onMyEvent = function(){}<br>
         myobj.addEventListener("onMyEvent", function(){});
         */
        baidu.lang.Class.prototype.dispatchEvent = function(event, options) {
            if (baidu.lang.isString(event)) {
                event = new baidu.lang.Event(event);
            }
            !this.__listeners && (this.__listeners = {});

            // 20100603 添加本方法的第二个参数，将 options extend到event中去传递
            options = options || {};
            for (var i in options) {
                event[i] = options[i];
            }

            var i, t = this.__listeners, p = event.type;
            event.target = event.target || this;
            event.currentTarget = this;

            p.indexOf('on') != 0 && (p = 'on' + p);

            baidu.lang.isFunction(this[p]) && this[p].apply(this, arguments);

            if (typeof t[p] == 'object') {
                for (i in t[p]) {
                    t[p][i].apply(this, arguments);
                }
            }
            return event.returnValue;
        };

        baidu.lang.inherits = function(subClass, superClass, className) {
            var key, proto,
                selfProps = subClass.prototype,
                clazz = new Function();

            clazz.prototype = superClass.prototype;
            proto = subClass.prototype = new clazz();
            for (key in selfProps) {
                proto[key] = selfProps[key];
            }
            subClass.prototype.constructor = subClass;
            subClass.superClass = superClass.prototype;

            // 类名标识，兼容Class的toString，基本没用
            if ('string' == typeof className) {
                proto._className = className;
            }
        };
        // 声明快捷方法
        baidu.inherits = baidu.lang.inherits;
    })();

    /**

     * 图片的路径

     * @private
     * @type {String}

     */
    var _IMAGE_PATH = '../resource/openmap/m';

    /**

     * 图片的后缀名

     * @private
     * @type {String}

     */
    var _IMAGE_EXTENSION = 'png';

    /**
     *@exports TextIconOverlay as BMapLib.TextIconOverlay
     */
    var TextIconOverlay =
        /**
         * TextIconOverlay
         * @class 此类表示地图上的一个覆盖物，该覆盖物由文字和图标组成，从Overlay继承。文字通常是数字（0-9）或字母（A-Z ），而文字与图标之间有一定的映射关系。
         *该覆盖物适用于以下类似的场景：需要在地图上添加一系列覆盖物，这些覆盖物之间用不同的图标和文字来区分，文字可能表示了该覆盖物的某一属性值，根据该文字和一定的映射关系，自动匹配相应颜色和大小的图标。
         *
         *@constructor
         *@param {Point} position 表示一个经纬度坐标位置。
         *@param {String} text 表示该覆盖物显示的文字信息。
         *@param {Json Object} options 可选参数，可选项包括：<br />
         *"<b>styles</b>":{Array<IconStyle>} 一组图标风格。单个图表风格包括以下几个属性：<br />
         *   url  {String}   图片的url地址。(必选)<br />
         *   size {Size}  图片的大小。（必选）<br />
         *   anchor {Size} 图标定位在地图上的位置相对于图标左上角的偏移值，默认偏移值为图标的中心位置。（可选）<br />
         *   offset {Size} 图片相对于可视区域的偏移值，此功能的作用等同于CSS中的background-position属性。（可选）<br />
         *   textSize {Number} 文字的大小。（可选，默认10）<br />
         *   textColor {String} 文字的颜色。（可选，默认black）<br />
         */
        BMapLib.TextIconOverlay = function(position, text, options) {
            this._position = position;
            this._text = text;
            this._options = options || {};
            this._styles = this._options['styles'] || [];
            (!this._styles.length) && this._setupDefaultStyles();
        };

    T.lang.inherits(TextIconOverlay, BMap.Overlay, 'TextIconOverlay');

    TextIconOverlay.prototype._setupDefaultStyles = function() {
        var sizes = [53, 56, 66, 78, 90];
        for (var i = 0, size; size = sizes[i]; i++) {
            this._styles.push({
                url: _IMAGE_PATH + i + '.' + _IMAGE_EXTENSION,
                size: new BMap.Size(size, size)
            });
        }//for循环的简洁写法
    };

    /**
     *继承Overlay的intialize方法，自定义覆盖物时必须。
     *@param {Map} map BMap.Map的实例化对象。
     *@return {HTMLElement} 返回覆盖物对应的HTML元素。
     */
    TextIconOverlay.prototype.initialize = function(map) {
        this._map = map;

        this._domElement = document.createElement('div');
        this._updateCss();
        this._updateText();
        this._updatePosition();

        this._bind();

        this._map.getPanes().markerMouseTarget.appendChild(this._domElement);
        return this._domElement;
    };

    /**
     *继承Overlay的draw方法，自定义覆盖物时必须。
     *@return 无返回值。
     */
    TextIconOverlay.prototype.draw = function() {
        this._map && this._updatePosition();
    };

    /**
     *获取该覆盖物上的文字。
     *@return {String} 该覆盖物上的文字。
     */
    TextIconOverlay.prototype.getText = function() {
        return this._text;
    };

    /**
     *设置该覆盖物上的文字。
     *@param {String} text 要设置的文字，通常是字母A-Z或数字0-9。
     *@return 无返回值。
     */
    TextIconOverlay.prototype.setText = function(text) {
        if (text && (!this._text || (this._text.toString() != text.toString()))) {
            this._text = text;
            this._updateText();
            this._updateCss();
            this._updatePosition();
        }
    };

    /**
     *获取该覆盖物的位置。
     *@return {Point} 该覆盖物的经纬度坐标。
     */
    TextIconOverlay.prototype.getPosition = function() {
        return this._position;
    };

    /**
     *设置该覆盖物的位置。
     *@param {Point}  position 要设置的经纬度坐标。
     *@return 无返回值。
     */
    TextIconOverlay.prototype.setPosition = function(position) {
        if (position && (!this._position || !this._position.equals(position))) {
            this._position = position;
            this._updatePosition();
        }
    };

    /**
     *由文字信息获取风格数组的对应索引值。
     *内部默认的对应函数为文字转换为数字除以10的结果，比如文字8返回索引0，文字25返回索引2.
     *如果需要自定义映射关系，请覆盖该函数。
     *@param {String} text  文字。
     *@param {Array<IconStyle>}  styles 一组图标风格。
     *@return {Number} 对应的索引值。
     */
    TextIconOverlay.prototype.getStyleByText = function(text, styles) {
        var count = parseInt(text);
        var index = parseInt(count / 10);
        index = Math.max(0, index);
        index = Math.min(index, styles.length - 1);
        return styles[index];
    }

    /**
     *更新相应的CSS。
     *@return 无返回值。
     */
    TextIconOverlay.prototype._updateCss = function() {
        var style = this.getStyleByText(this._text, this._styles);
        this._domElement.style.cssText = this._buildCssText(style);
    };

    /**
     *更新覆盖物的显示文字。
     *@return 无返回值。
     */
    TextIconOverlay.prototype._updateText = function() {
        if (this._domElement) {
            this._domElement.innerHTML = this._text;
        }
    };

    /**
     *调整覆盖物在地图上的位置更新覆盖物的显示文字。
     *@return 无返回值。
     */
    TextIconOverlay.prototype._updatePosition = function() {
        if (this._domElement && this._position) {
            var style = this._domElement.style;
            var pixelPosition = this._map.pointToOverlayPixel(this._position);
            pixelPosition.x -= Math.ceil(parseInt(style.width) / 2);
            pixelPosition.y -= Math.ceil(parseInt(style.height) / 2);
            style.left = pixelPosition.x + 'px';
            style.top = pixelPosition.y + 'px';
        }
    };

    /**
     * 为该覆盖物的HTML元素构建CSS
     * @param {IconStyle}  一个图标的风格。
     * @return {String} 构建完成的CSSTEXT。
     */
    TextIconOverlay.prototype._buildCssText = function(style) {
        //根据style来确定一些默认值
        var url = style['url'];
        var size = style['size'];
        var anchor = style['anchor'];
        var offset = style['offset'];
        var textColor = style['textColor'] || 'white';
        var textSize = style['textSize'] || 10;

        var csstext = [];
        if (T.browser['ie'] < 7) {
            csstext.push('filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(' +
                'sizingMethod=scale,src="' + url + '");');
        } else {
            csstext.push('background-image:url(' + url + ');');
            var backgroundPosition = '0 0';
            (offset instanceof BMap.Size) && (backgroundPosition = offset.width + 'px' + ' ' + offset.height + 'px');
            csstext.push('background-position:' + backgroundPosition + ';');
        }

        if (size instanceof BMap.Size) {
            if (anchor instanceof BMap.Size) {
                if (anchor.height > 0 && anchor.height < size.height) {
                    csstext.push('height:' + (size.height - anchor.height) + 'px; padding-top:' + anchor.height + 'px;');
                }
                if (anchor.width > 0 && anchor.width < size.width) {
                    csstext.push('width:' + (size.width - anchor.width) + 'px; padding-left:' + anchor.width + 'px;');
                }
            } else {
                csstext.push('height:' + size.height + 'px; line-height:' + size.height + 'px;');
                csstext.push('width:' + size.width + 'px; text-align:center;');
            }
        }

        csstext.push('cursor:pointer; color:' + textColor + '; position:absolute; font-size:' +
            textSize + 'px; font-family:Arial,sans-serif; font-weight:bold');
        return csstext.join('');
    };

    /**

     * 当鼠标点击该覆盖物时会触发该事件

     * @name TextIconOverlay#click

     * @event

     * @param {Event Object} e 回调函数会返回event参数，包括以下返回值：

     * <br />"<b>type</b> : {String} 事件类型

     * <br />"<b>target</b>：{BMapLib.TextIconOverlay} 事件目标

     *

     */

    /**

     * 当鼠标进入该覆盖物区域时会触发该事件

     * @name TextIconOverlay#mouseover

     * @event
     * @param {Event Object} e 回调函数会返回event参数，包括以下返回值：

     * <br />"<b>type</b> : {String} 事件类型

     * <br />"<b>target</b>：{BMapLib.TextIconOverlay} 事件目标

     * <br />"<b>point</b> : {BMap.Point} 最新添加上的节点BMap.Point对象

     * <br />"<b>pixel</b>：{BMap.pixel} 最新添加上的节点BMap.Pixel对象

     *

     * @example <b>参考示例：</b><br />

     * myTextIconOverlay.addEventListener("mouseover", function(e) {  alert(e.point);  });

     */

    /**

     * 当鼠标离开该覆盖物区域时会触发该事件

     * @name TextIconOverlay#mouseout

     * @event

     * @param {Event Object} e 回调函数会返回event参数，包括以下返回值：

     * <br />"<b>type</b> : {String} 事件类型

     * <br />"<b>target</b>：{BMapLib.TextIconOverlay} 事件目标

     * <br />"<b>point</b> : {BMap.Point} 最新添加上的节点BMap.Point对象

     * <br />"<b>pixel</b>：{BMap.pixel} 最新添加上的节点BMap.Pixel对象

     *

     * @example <b>参考示例：</b><br />

     * myTextIconOverlay.addEventListener("mouseout", function(e) {  alert(e.point);  });

     */

    /**
     * 为该覆盖物绑定一系列事件
     * 当前支持click mouseover mouseout
     * @return 无返回值。
     */
    TextIconOverlay.prototype._bind = function() {
        if (!this._domElement) {
            return;
        }

        var me = this;
        var map = this._map;

        var BaseEvent = T.lang.Event;

        function eventExtend(e, be) {
            var elem = e.srcElement || e.target;
            var x = e.clientX || e.pageX;
            var y = e.clientY || e.pageY;
            if (e && be && x && y && elem) {
                var offset = T.dom.getPosition(map.getContainer());
                be.pixel = new BMap.Pixel(x - offset.left, y - offset.top);
                be.point = map.pixelToPoint(be.pixel);
            }
            return be;
        }//给事件参数增加pixel和point两个值

        T.event.on(this._domElement, 'mouseover', function(e) {
            me.dispatchEvent(eventExtend(e, new BaseEvent('onmouseover')));
        });
        T.event.on(this._domElement, 'mouseout', function(e) {
            me.dispatchEvent(eventExtend(e, new BaseEvent('onmouseout')));
        });
        T.event.on(this._domElement, 'click', function(e) {
            me.dispatchEvent(eventExtend(e, new BaseEvent('onclick')));
        });
    };

})();

//==== MarkerClusterer_min.js=============================
/**
 * @namespace 点聚合
 */
var BMapLib=window.BMapLib=BMapLib||{};

(function () {
    var b = function (m, l, j) {
        l = d(l);
        var n = m.pointToPixel(l.getNorthEast());
        var i = m.pointToPixel(l.getSouthWest());
        n.x += j;
        n.y -= j;
        i.x -= j;
        i.y += j;
        var h = m.pixelToPoint(n);
        var k = m.pixelToPoint(i);
        return new BMap.Bounds(k, h)
    };
    var d = function (i) {
        var k = f(i.getNorthEast().lng, -180, 180);
        var h = f(i.getSouthWest().lng, -180, 180);
        var j = f(i.getNorthEast().lat, -74, 74);
        var l = f(i.getSouthWest().lat, -74, 74);
        return new BMap.Bounds(new BMap.Point(h, l), new BMap.Point(k, j))
    };
    var f = function (j, k, h) {
        k && (j = Math.max(j, k));
        h && (j = Math.min(j, h));
        return j
    };
    var a = function (h) {
        return "[object Array]" === Object.prototype.toString.call(h)
    };
    var c = function (l, n) {
        var j = -1;
        if (a(n)) {
            if (n.indexOf) {
                j = n.indexOf(l)
            } else {
                for (var k = 0, h; h = n[k]; k++) {
                    if (h === l) {
                        j = k;
                        break
                    }
                }
            }
        }
        return j
    };
    var e = BMapLib.MarkerClusterer = function (l, h) {
        if (!l) {
            return
        }
        this._map = l;
        this._markers = [];
        this._clusters = [];
        var k = h || {};
        this._gridSize = k.gridSize || 60;
        this._maxZoom = k.maxZoom || 18;
        this._minClusterSize = k.minClusterSize || 2;
        this._isAverageCenter = false;
        if (k.isAverageCenter != undefined) {
            this._isAverageCenter = k.isAverageCenter
        }
        this._styles = k.styles || [];
        var j = this;
        this._map.addEventListener("zoomend", function () {
            j._redraw()
        });
        this._map.addEventListener("moveend", function () {
            j._redraw()
        });
        var i = k.markers;
        a(i) && this.addMarkers(i)
    };
    e.prototype.addMarkers = function (k) {
        for (var j = 0, h = k.length; j < h; j++) {
            this._pushMarkerTo(k[j])
        }
        this._createClusters()
    };
    e.prototype._pushMarkerTo = function (h) {
        var i = c(h, this._markers);
        if (i === -1) {
            h.isInCluster = false;
            this._markers.push(h)
        }
    };
    e.prototype.addMarker = function (h) {
        this._pushMarkerTo(h);
        this._createClusters()
    };
    e.prototype._createClusters = function () {
        var j = this._map.getBounds();
        var l = b(this._map, j, this._gridSize);
        for (var k = 0, h; h = this._markers[k]; k++) {
            if (!h.isInCluster && l.containsPoint(h.getPosition())) {
                this._addToClosestCluster(h)
            }
        }
    };
    e.prototype._addToClosestCluster = function (l) {
        var p = 4000000;
        var n = null;
        var k = l.getPosition();
        for (var m = 0, j; j = this._clusters[m]; m++) {
            var h = j.getCenter();
            if (h) {
                var o = this._map.getDistance(h, l.getPosition());
                if (o < p) {
                    p = o;
                    n = j
                }
            }
        }
        if (n && n.isMarkerInClusterBounds(l)) {
            n.addMarker(l)
        } else {
            var j = new g(this);
            j.addMarker(l);
            this._clusters.push(j)
        }
    };
    e.prototype._clearLastClusters = function () {
        for (var j = 0, h; h = this._clusters[j]; j++) {
            h.remove()
        }
        this._clusters = [];
        this._removeMarkersFromCluster()
    };
    e.prototype._removeMarkersFromCluster = function () {
        for (var j = 0, h; h = this._markers[j]; j++) {
            h.isInCluster = false
        }
    };
    e.prototype._removeMarkersFromMap = function () {
        for (var j = 0, h; h = this._markers[j]; j++) {
            h.isInCluster = false;
            this._map.removeOverlay(h)
        }
    };
    e.prototype._removeMarker = function (h) {
        var i = c(h, this._markers);
        if (i === -1) {
            return false
        }
        this._map.removeOverlay(h);
        this._markers.splice(i, 1);
        return true
    };
    e.prototype.removeMarker = function (h) {
        var i = this._removeMarker(h);
        if (i) {
            this._clearLastClusters();
            this._createClusters()
        }
        return i
    };
    e.prototype.removeMarkers = function (l) {
        var k = false;
        for (var h = 0; h < l.length; h++) {
            var j = this._removeMarker(l[h]);
            k = k || j
        }
        if (k) {
            this._clearLastClusters();
            this._createClusters()
        }
        return k
    };
    e.prototype.clearMarkers = function () {
        this._clearLastClusters();
        this._removeMarkersFromMap();
        this._markers = []
    };
    e.prototype._redraw = function () {
        this._clearLastClusters();
        this._createClusters()
    };
    e.prototype.getGridSize = function () {
        return this._gridSize
    };
    e.prototype.setGridSize = function (h) {
        this._gridSize = h;
        this._redraw()
    };
    e.prototype.getMaxZoom = function () {
        return this._maxZoom
    };
    e.prototype.setMaxZoom = function (h) {
        this._maxZoom = h;
        this._redraw()
    };
    e.prototype.getStyles = function () {
        return this._styles
    };
    e.prototype.setStyles = function (h) {
        this._styles = h;
        this._redraw()
    };
    e.prototype.getMinClusterSize = function () {
        return this._minClusterSize
    };
    e.prototype.setMinClusterSize = function (h) {
        this._minClusterSize = h;
        this._redraw()
    };
    e.prototype.isAverageCenter = function () {
        return this._isAverageCenter
    };
    e.prototype.getMap = function () {
        return this._map
    };
    e.prototype.getMarkers = function () {
        return this._markers
    };
    e.prototype.getClustersCount = function () {
        var k = 0;
        for (var j = 0, h; h = this._clusters[j]; j++) {
            h.isReal() && k++
        }
        return k
    };
    function g(h) {
        this._markerClusterer = h;
        this._map = h.getMap();
        this._minClusterSize = h.getMinClusterSize();
        this._isAverageCenter = h.isAverageCenter();
        this._center = null;
        this._markers = [];
        this._gridBounds = null;
        this._isReal = false;
        this._clusterMarker = new BMapLib.TextIconOverlay(this._center, this._markers.length, {styles: this._markerClusterer.getStyles()})
    }

    g.prototype.addMarker = function (k) {
        if (this.isMarkerInCluster(k)) {
            return false
        }
        if (!this._center) {
            this._center = k.getPosition();
            this.updateGridBounds()
        } else {
            if (this._isAverageCenter) {
                var j = this._markers.length + 1;
                var o = (this._center.lat * (j - 1) + k.getPosition().lat) / j;
                var m = (this._center.lng * (j - 1) + k.getPosition().lng) / j;
                this._center = new BMap.Point(m, o);
                this.updateGridBounds()
            }
        }
        k.isInCluster = true;
        this._markers.push(k);
        var h = this._markers.length;
        if (h < this._minClusterSize) {
            this._map.addOverlay(k);
            return true
        } else {
            if (h === this._minClusterSize) {
                for (var n = 0; n < h; n++) {
                    this._markers[n].getMap() && this._map.removeOverlay(this._markers[n])
                }
            }
        }
        this._map.addOverlay(this._clusterMarker);
        this._isReal = true;
        this.updateClusterMarker();
        return true
    };
    g.prototype.isMarkerInCluster = function (j) {
        if (this._markers.indexOf) {
            return this._markers.indexOf(j) != -1
        } else {
            for (var k = 0, h; h = this._markers[k]; k++) {
                if (h === j) {
                    return true
                }
            }
        }
        return false
    };
    g.prototype.isMarkerInClusterBounds = function (h) {
        return this._gridBounds.containsPoint(h.getPosition())
    };
    g.prototype.isReal = function (h) {
        return this._isReal
    };
    g.prototype.updateGridBounds = function () {
        var h = new BMap.Bounds(this._center, this._center);
        this._gridBounds = b(this._map, h, this._markerClusterer.getGridSize())
    };
    g.prototype.updateClusterMarker = function () {
        if (this._map.getZoom() > this._markerClusterer.getMaxZoom()) {
            this._clusterMarker && this._map.removeOverlay(this._clusterMarker);
            for (var l = 0, j; j = this._markers[l]; l++) {
                this._map.addOverlay(j)
            }
            return
        }
        if (this._markers.length < this._minClusterSize) {
            this._clusterMarker.hide();
            return
        }
        this._clusterMarker.setPosition(this._center);
        this._clusterMarker.setText(this._markers.length);
        var k = this._map;
        var h = this.getBounds();
        this._clusterMarker.addEventListener("click", function (i) {
            k.setViewport(h)
        })
    };
    g.prototype.remove = function () {
        for (var j = 0, h; h = this._markers[j]; j++) {
            this._markers[j].getMap() && this._map.removeOverlay(this._markers[j])
        }
        this._map.removeOverlay(this._clusterMarker);
        this._markers.length = 0;
        delete this._markers
    };
    g.prototype.getBounds = function () {
        var k = new BMap.Bounds(this._center, this._center);
        for (var j = 0, h; h = this._markers[j]; j++) {
            k.extend(h.getPosition())
        }
        return k
    };
    g.prototype.getCenter = function () {
        return this._center
    }
})();