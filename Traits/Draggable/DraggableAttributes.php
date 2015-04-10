<?php
/**
 * Created by PhpStorm.
 * User: ari
 * Date: 3/14/2015
 * Time: 10:14 PM
 */
namespace Site\Traits\Draggable;

use CPath\Render\HTML\Attribute\Attributes;
use CPath\Render\HTML\Header\IHeaderWriter;
use CPath\Render\HTML\Header\IHTMLSupportHeaders;
use CPath\Request\IRequest;

class DraggableAttributes extends Attributes implements IHTMLSupportHeaders
{
//    const CLASS_NAME = 'draggable';
    const CLASS_DROP_CONTAINER = 'drop-container';
    public function __construct() {
        parent::__construct('draggable', 'true');
    }

    /**
     * Write all support headers used by this renderer
     * @param IRequest $Request
     * @param IHeaderWriter $Head the writer inst to use
     * @return void
     */
    function writeHeaders(IRequest $Request, IHeaderWriter $Head) {
        parent::writeHeaders($Request, $Head);
        $Head->writeScript(__DIR__ . '/assets/draggable.js');
        $Head->writeStyleSheet(__DIR__ . '/assets/draggable.css');
    }
}

