<?php
/**
 * Created by IntelliJ IDEA.
 * User: Zero
 * Date: 2017/6/1
 * Time: 17:16
 */

$a = [
    "map"=> 'u3xpd4',
    "common"=> 'rxkf2g',
    "style"=> '0xzqoa',
    "tile"=> '134nn5',
    "vectordrawlib"=> 'm3bcyl',
    "newvectordrawlib"=> 'yjqu0d',
    "groundoverlay"=> 'yyslq4',
    "pointcollection"=> 'zger0u',
    "marker"=> 'hxqfbu',
    "symbol"=> 'lzfqn3',
    "canvablepath"=> 'gognwi',
    "vmlcontext"=> 'bgxoml',
    "markeranimation"=> 'gcozqj',
    "poly"=> '4bbrdi',
    "draw"=> '03ad5h',
    "drawbysvg"=> 'htppkl',
    "drawbyvml"=> 'ill3hz',
    "drawbycanvas"=> 'ohjshn',
    "infowindow"=> 'dhanno',
    "oppc"=> 'sydxi0',
    "opmb"=> '00sgwb',
    "menu"=> 'gfrtsy',
    "control"=> '5ibrnt',
    "navictrl"=> 'ovqqjb',
    "geoctrl"=> 'udyy0n',
    "copyrightctrl"=> 'eyjyai',
    "citylistcontrol"=> '4xnhzd',
    "scommon"=> '1jhh1n',
    "local"=> 'x4grny',
    "route"=> 'mtoxcx',
    "othersearch"=> 't1pc1e',
    "mapclick"=> 'u2uxvc',
    "buslinesearch"=> 'ecd2oo',
    "hotspot"=> '5r0czm',
    "autocomplete"=> 'rj2jk3',
    "coordtrans"=> 'xa15x0',
    "coordtransutils"=> 'lincwr',
    "convertor"=> 'q21wdv',
    "clayer"=> 'hjmz30',
    "pservice"=> 'frc3e3',
    "pcommon"=> '01zfkp',
    "panorama"=> 'itjuti',
    "panoramaflash"=> 'oynmyg',
    "vector"=> 'an4idr'
];

foreach ($a as $k=>$v) {
   $t =  file_get_contents('http://api0.map.bdimg.com/getmodules?v=2.0&t=20140707&mod='.$k.'_'.$v);
   echo $t;
   file_put_contents($k, $t);
}