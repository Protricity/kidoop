<?php
/**
 * Created by PhpStorm.
 * User: ari
 * Date: 3/14/2015
 * Time: 10:14 PM
 */
namespace Site\Traits\InfoBox;

use CPath\Render\HTML\Attribute\ClassAttributes;
use CPath\Render\HTML\Header\IHeaderWriter;
use CPath\Render\HTML\Header\IHTMLSupportHeaders;
use CPath\Request\IRequest;

class InfoBoxTraitAttributes extends ClassAttributes implements IHTMLSupportHeaders
{
    const CLASS_NAME = 'infobox';
    public function __construct() {
        parent::__construct(self::CLASS_NAME);
    }

    /**
     * Write all support headers used by this renderer
     * @param IRequest $Request
     * @param IHeaderWriter $Head the writer inst to use
     * @return void
     */
    function writeHeaders(IRequest $Request, IHeaderWriter $Head) {
        $Head->writeScript(__DIR__ . '/assets/draggable.js');
        $Head->writeStyleSheet(__DIR__ . '/assets/draggable.css');
    }
}

