<?php

$qt = isset($_GET['qt']) ? $_GET['qt'] : '';
$cb = isset($_GET['callback']) ? $_GET['callback'] : '';
$mod = isset($_GET['mod']) ? $_GET['mod'] : '';

switch ($qt) {
    case 'verify':
        echo('/**/' . $cb . ' && ' . $cb . '({"error":0})');
        break;
    default:
        break;
}

if ($mod) {
    $t = '';
    $modArr = explode(',', $mod);
    foreach ($modArr as $k => $v) {
        $moduleArr = explode('_', $v);
        $t .= file_get_contents('./modules/' . $moduleArr[0]) . "\n";
    }
    echo $t;
}
