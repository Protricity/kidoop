<?php
/**
 * Created by PhpStorm.
 * User: ari
 * Date: 11/20/14
 * Time: 1:11 PM
 */
namespace Site\DB;

class DBConfig
{
	static $DB_USERNAME = 'root';
	static $DB_PASSWORD = null;
	static $DB_NAME = 'kidoop';
	static $DB_PORT = 3306;
	static $DB_HOST = 'localhost';
    static $DB_WRITE_TABLES = true;
	static $GrantSalt = 'eS6bZZlQaKM66ZZCGetAJVGJA6ZfZ3UsUbw';
	static $GrantContentPath;

	static function getContentPath($additionalPath=null) {
		return self::$GrantContentPath . ($additionalPath ? '/' . $additionalPath : '');
	}
}

