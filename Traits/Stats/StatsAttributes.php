<?php
/**
 * Created by PhpStorm.
 * User: ari
 * Date: 3/14/2015
 * Time: 10:14 PM
 */
namespace Site\Traits\Collision;

use CPath\Render\HTML\Attribute\Attributes;
use CPath\Render\HTML\Header\IHeaderWriter;
use CPath\Render\HTML\Header\IHTMLSupportHeaders;
use CPath\Request\IRequest;

class CollisionAttributes extends Attributes implements IHTMLSupportHeaders
{
    const COLLISION_CLASS = 'collision';
    const TYPE_SQUARE = 'collision square';
    const TYPE_CIRCLE = 'collision circle';

    public function __construct() {
        parent::__construct();
        $this->addClass(self::COLLISION_CLASS);
        $this->addClass($type);
    }

    /**
     * Write all support headers used by this renderer
     * @param IRequest $Request
     * @param IHeaderWriter $Head the writer inst to use
     * @return void
     */
    function writeHeaders(IRequest $Request, IHeaderWriter $Head) {
        $Head->writeScript(__DIR__ . '/assets/collision.js');
        $Head->writeStyleSheet(__DIR__ . '/assets/collision.css');
    }
}

