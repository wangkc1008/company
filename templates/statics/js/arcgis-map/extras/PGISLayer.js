define([
    "dojo/_base/declare",
    "esri/layers/WMTSLayer",
    "esri/layers/TiledMapServiceLayer",
    "esri/geometry/Extent",
    "esri/SpatialReference",
    "esri/layers/TileInfo"
], function (
    declare,
    WMTSLayer,
    TiledMapServiceLayer,
    Extent,
    SpatialReference,
    TileInfo
) {
    return declare([TiledMapServiceLayer], {
        declaredClass: "ogc.WMTSLayer",
        constructor: function (baseLayerUrl) {
            window.baseLayerUrl = baseLayerUrl;
            this.copyright = 'pgis layer';
            this.version = "1.0.0";
            this.identifier = "pgisLayer";
            this.imageFormat = "image/png";
            this.tileMatrixSet = "TileMatrixSet_0";
            this.spatialReference = new SpatialReference({
                wkid: 4326
            });
            this.initialExtent = new Extent(-180, -90, 180, 90, this.spatialReference);
            this.fullExtent = new Extent(-180, -90, 180, 90, this.spatialReference);
            this.tileInfo = new TileInfo({
                "dpi": "90.71428571427429",
                "format": "image/png",
                "compressionQuality": 0,
                "spatialReference": {
                    "wkid": "4326"
                },
                "rows": 256,
                "cols": 256,
                "origin": {
                    "x": -180,
                    "y": 90
                },
                "lods": [{
                        "level": 1,
                        "resolution": 0.703125,
                        "scale": 295829355.454566
                    },
                    {
                        "level": 2,
                        "resolution": 0.3515625,
                        "scale": 147914677.727283
                    },
                    {
                        "level": 3,
                        "resolution": 0.17578125,
                        "scale": 73957338.863641
                    },
                    {
                        "level": 4,
                        "resolution": 0.087890625,
                        "scale": 36978669.431821
                    },
                    {
                        "level": 5,
                        "resolution": 0.0439453125,
                        "scale": 18489334.715910
                    },
                    {
                        "level": 6,
                        "resolution": 0.02197265625,
                        "scale": 9244667.357955
                    },
                    {
                        "level": 7,
                        "resolution": 0.010986328125,
                        "scale": 4622333.678978
                    },
                    {
                        "level": 8,
                        "resolution": 0.0054931640625,
                        "scale": 2311166.839489
                    },
                    {
                        "level": 9,
                        "resolution": 0.00274658203125,
                        "scale": 1155583.419744
                    },
                    {
                        "level": 10,
                        "resolution": 0.001373291015625,
                        "scale": 577791.709872
                    },
                    {
                        "level": 11,
                        "resolution": 0.0006866455078125,
                        "scale": 288895.854936
                    },
                    {
                        "level": 12,
                        "resolution": 0.00034332275390625,
                        "scale": 144447.927468
                    },
                    {
                        "level": 13,
                        "resolution": 0.000171661376953125,
                        "scale": 72223.963734
                    },
                    {
                        "level": 14,
                        "resolution": 8.58306884765625e-005,
                        "scale": 36111.981867
                    },
                    {
                        "level": 15,
                        "resolution": 4.291534423828125e-005,
                        "scale": 18055.990934
                    },
                    {
                        "level": 16,
                        "resolution": 2.1457672119140625e-005,
                        "scale": 9027.995467
                    },
                    {
                        "level": 17,
                        "resolution": 1.0728836059570313e-005,
                        "scale": 4513.997733
                    },
                    {
                        "level": 18,
                        "resolution": 5.3644180297851563e-006,
                        "scale": 2256.998867
                    },
                    {
                        "level": 19,
                        "resolution": 0.000002682209014892578,
                        "scale": 1128.499433
                    }
                ]
            });
            this.loaded = true;
            this.onLoad(this);
        },
        getTileUrl: function (level, row, col) {
            // PGIS 底图地址
            var urlTemplate = baseLayerUrl + "?z=" + level + "&y=" + row + "&x=" + col;
            return urlTemplate;
        }
    });
})