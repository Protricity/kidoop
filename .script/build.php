<?php
use CPath\Render\Text\TextMimeType;
use CPath\Request\Request;

chdir('..');

$_SERVER['REQUEST_METHOD'] = 'CLI';
require_once(dirname(__DIR__) . '/Site/SiteMap.php');
$configPath = dirname(__DIR__) . '/config.php';
if(!is_file($configPath))
    file_put_contents($configPath, file_get_contents(__DIR__ . '/.default.config.php'));
require_once($configPath);
$Request = Request::create('/cpath/build', array(), new TextMimeType());
$Build = new \CPath\Build\Handlers\BuildRequestHandler();
$Response = $Build->execute($Request);
echo $Response->getMessage();
//CPathMap::route($Request);