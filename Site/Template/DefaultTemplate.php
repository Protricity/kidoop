<?php
/**
 * Created by PhpStorm.
 * User: ari
 * Date: 3/25/2015
 * Time: 9:49 PM
 */
namespace Site\Template;

use CPath\Render\HTML\Template\DefaultCPathTemplate;

class DefaultTemplate extends DefaultCPathTemplate
{
    public function __construct($_content = null) {
        parent::__construct($_content);

        $this->addHeaderStyleSheet(__DIR__ . '/assets/kidoop-template.css');
    }

}