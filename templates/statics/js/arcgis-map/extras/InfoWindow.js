define([
        "dojo/Evented",
        "dojo/parser",
        "dojo/on",
        "dojo/_base/declare",
        "dojo/dom-construct",
        "dojo/_base/array",
        "dojo/dom-style",
        "dojo/_base/lang",
        "dojo/dom-class",
        "dojo/fx/Toggler",
        "dojo/fx",
        "dojo/Deferred",
        "esri/domUtils",
        "esri/InfoWindowBase"
    ],
    function (
        Evented,
        parser,
        on,
        declare,
        domConstruct,
        array,
        domStyle,
        lang,
        domClass,
        Toggler,
        coreFx,
        Deferred,
        domUtils,
        InfoWindowBase) {
        return declare([InfoWindowBase, Evented], {
            width: 0,
            height: 0,
            location: {},
            isContentShowing: true,
            constructor: function (parameters) {
                lang.mixin(this, parameters);
                domClass.add(this.domNode, "myInfoWindow");
                this._closeButton = domConstruct.create("div", {
                    "class": "close",
                    "title": "Close",
                    "innerHTML": "×"
                }, this.domNode);
                this._title = domConstruct.create("div", {
                    "class": "cmap-window-title"
                }, this.domNode);
                this._content = domConstruct.create("div", {
                    "class": "cmap-window-content"
                }, this.domNode);
                on(this._closeButton, "click", lang.hitch(this, function () {
                    this.location = {}
                    this.hide();
                }));
                domUtils.hide(this.domNode);
                this.isShowing = false;
            },
            setMap: function (map) {
                this.inherited(arguments);
                map.on("pan-start", lang.hitch(this, function () {
                    this.hide();
                }));
                map.on("zoom-start", lang.hitch(this, function () {
                    this.hide();
                }));
                map.on("extent-change", lang.hitch(this, function () {
                    if (this.location.x) {
                        this.show(this.location)
                    }
                }))
            },
            setTitle: function (title) {
                this.place(title, this._title);
            },
            setContent: function (content) {
                this.place(content, this._content);
            },
            show: function (location) {
                this.location = location
                if (location.spatialReference) {
                    location = this.map.toScreen(location);
                }
                domStyle.set(this.domNode, {
                    "left": (location.x - 7 - this.width / 2) + "px",
                    "top": (location.y - 38 - this.height) + "px"
                });
                domUtils.show(this.domNode);
                this.isShowing = true;
                this.onShow();
            },
            hide: function () {
                domUtils.hide(this.domNode);
                this.isShowing = false;
                this.onHide();
            },
            resize: function (width, height) {
                domStyle.set(this.domNode, {
                    "width": width + "px",
                    "height": height + "px"
                });
                this.width = width
                this.height = height
            },
            destroy: function () {
                domConstruct.destroy(this.domNode);
                this._closeButton = this._title = this._content = null;
            }
        });

    });