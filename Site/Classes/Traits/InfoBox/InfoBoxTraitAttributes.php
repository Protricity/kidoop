<?php
/**
 * Created by PhpStorm.
 * User: ari
 * Date: 3/14/2015
 * Time: 10:14 PM
 */
namespace Site\Classes\Traits\InfoBox;

use CPath\Render\HTML\Attribute\ClassAttributes;

class InfoBoxTraitAttributes extends ClassAttributes
{
    const CLASS_NAME = 'infobox';
    public function __construct() {
        parent::__construct(self::CLASS_NAME);
    }
}

