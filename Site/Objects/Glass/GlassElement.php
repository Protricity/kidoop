<?php
/**
 * Created by PhpStorm.
 * User: ari
 * Date: 3/14/2015
 * Time: 10:14 PM
 */
namespace Site\Objects\Glass;

use CPath\Render\HTML\Attribute\ClassAttributes;
use CPath\Render\HTML\Attribute\IAttributes;
use CPath\Render\HTML\Element\AbstractHTMLElement;
use CPath\Render\HTML\Element\HTMLElement;
use CPath\Render\HTML\Header\IHeaderWriter;
use CPath\Render\HTML\IRenderHTML;
use CPath\Request\IRequest;
use Site\Traits\Draggable\DraggableAttributes;

class GlassElement extends HTMLElement
{
    const ELEMENT_TYPE = 'glass';

    /**
     * @param bool $draggable
     * @param String|null $classList a list of class elements
     * @param null|String|Array|IAttributes $_options [varargs] attribute html as string, array, or IAttributes instance
     */
    public function __construct($draggable=false, $classList=null, $_options=null) {
        parent::__construct(self::ELEMENT_TYPE);

        is_scalar($draggable) ? null : $this->addVarArg($draggable);
        $draggable === false ?: $this->addAttributes(new DraggableAttributes());
        is_scalar($classList)   ? $this->addClass($classList) : $this->addVarArg($classList);

        for($i=2; $i<func_num_args(); $i++) {
            $arg = func_get_arg($i);
            $this->addVarArg($arg);
        }
    }

    function writeHeaders(IRequest $Request, IHeaderWriter $Head) {
        parent::writeHeaders($Request, $Head);
        $Head->writeScript(__DIR__ . '/assets/glass.js');
        $Head->writeStyleSheet(__DIR__ . '/assets/glass.css');
    }


    /**
     * Render element content
     * @param IRequest $Request
     * @param IAttributes $ContentAttr
     * @param \CPath\Render\HTML\IHTMLContainer|\CPath\Render\HTML\IRenderHTML $Parent
     */
    function renderContent(IRequest $Request, IAttributes $ContentAttr = null, IRenderHTML $Parent = null) {
    }

    /**
     * Returns true if this element has an open tag
     * @return bool
     */
    protected function isOpenTag() {
        return true;
    }
}

