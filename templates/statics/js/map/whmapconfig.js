//js map
   IMAP.Host = "http://"+host + ":25002/jsmap";
//msp服务
   IMAP.ApiHost = "http://"+host + ":25001";
//插件的
   IMAP.pluginsUrl = "http://"+host + ":25001/as/webapi/js/auth?v=1.0&t=jsmap&ak=ec85d3648154874552835438ac6a02b2&m=";
//栅格图片
   IMAP.TileServerUrl = ["http://{s}/v3/tile?z={z}&x={x}&y={y}",[host +":25033"]]

IMAP.STATIC_URL = IMAP.Host + "/1.0/";
IMAP.SRV_URL=IMAP.ApiHost + "/as/";
IMAP.MapConfig = {
	API_REALM_NAME :IMAP.STATIC_URL,//
	_MAP_PCIMG_SIZE : 256,
	_MAP_PCBGIMG_URL : IMAP.TileServerUrl,
	_MAP_PC_DATAS_URL: [IMAP.Host+"/as/hotspot/"],
	_CONTROL_COPYRIGHT:"<span></span>",
	_MAP_BGIMG_URL : "images/backgroundimg.png",
	_CONTROL_OVERVIEW_BTNIMG:"images/overview.png",
	_MAP_MARKER_PCICON : "images/point_1.png",
	_MAP_POINT_URL:"images/point_1.png",
	_MAP_IS_POINT_URL:"images/bubble.png", // 
	_MAP_IS_SEARCH_URL:"images/search_03.png", // 
	_MAP_IS_DEFIMG_URL:"images/img_1.gif", // 
	_MAP_CLOSE1_URL:"images/close_1.png",
	_MAP_CLOSE2_URL:"images/close_2.png",
	_MAP_OTHER_URL:"images/other.png",
	_MAP_SCALE_UNITS : [[1000, "公里"], [1, "米"]],//比例尺数值单位
	_MAP_HAND : ["images/cur/openhand.cur", "images/cur/closedhand.cur"],//鼠标手
	_MAP_NAVIIMAGE : ["images/navi.png","images/newNavi.gif"],//导航工具图片
	_MAP_TOUCHALL : "images/touch.png",
	_MAP_ICON_BLAND_URL:"images/blank.png",//小白点透明图标
	_MAP_HOTSPOT_RECT_IMG_URL:"images/mhotspot.png",
	_MAP_CUR:"images/cur/",
	_MAP_CLUSTER_ICON:"images/cluster/",
	_CONTROL_COPYRIGHT_LOGO:"images/logoCP.png",
	_PLUGINS_URL: IMAP.pluginsUrl,//插件请求地址
	_MAP_PANORAMA:{
		"FLASH_DEPENDENTS_URL":IMAP.Host + "/1.0/flash/",//flash相关基础依赖文件 swf等
		"ROAD_URL":"http://websv2.ishowchina.com/road",//默认路网趣图地址
		"MarkerServiceUrl":"",//实景POI反投地址
		"TrueVisionSeverUrl":"http://210.51.167.9:8081",//实景服务地址
		"panoramaMarkerIcon":"images/monkeys.png",//猴子图标
		"panoramaControlIcon":"images/icon_b_01.gif"
	},
	_VERSIONS:"1.0",
	_COUNT:IMAP.SRV_URL+"jsmap/log?"
};
IMAP.SRVConfig={
		SRV_POI_DETAILS_URL:IMAP.SRV_URL+"/poim?",//POI搜索
		SRV_GEO_URL:IMAP.SRV_URL+"geo?",//地理编码
		SRV_RGEO_URL:IMAP.SRV_URL+"rgeo?",//逆地理编码
		SRV_POI_URL:IMAP.SRV_URL+"search/poi?",//POI关键字搜索
		SRV_POI_AROUND_URL:IMAP.SRV_URL+"search/poi?",//周边查询接口
		SRV_POI_BOX_URL:IMAP.SRV_URL+"search/poi?",//区域内查询接口
		SRV_SUGGEST_URL:IMAP.SRV_URL+"sug?",//联想猜词服务地址
		SRV_BUS_TRANSFER_URL:IMAP.SRV_URL+"route/bus?",//公交换乘服务地址
		SRV_BUS_LINE_ID_URL:IMAP.SRV_URL+"search/busline/byid?",//公交线路查询--id
		SRV_BUS_LINE_NAME_URL:IMAP.SRV_URL+"search/busline/byname?",//公交线路查询--name
		SRV_BUS_STATION_NAME_URL:IMAP.SRV_URL+"search/busstop/byname?",//公交站点查询--name
		SRV_BUS_STATION_ID_URL:IMAP.SRV_URL+"search/busstop/byid?",//公交站点查询--id
		SRV_DRIVING_URL:IMAP.SRV_URL+"route/car?",//驾车导航服务地址
		SRV_WALKING_URL:IMAP.SRV_URL+"route/walk?",//步行导航服务地址
		SRV_BOUNDARY_URL:IMAP.SRV_URL+"search/district?",// 行政区域的边界服务地址+
		SRV_AK:"ec85d3648154874552835438ac6a02b2"//用户key
};


