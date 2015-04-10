<?php
/**
 * Created by PhpStorm.
 * User: ari
 * Date: 3/14/2015
 * Time: 10:14 PM
 */
namespace Site\Objects\Warp;

use CPath\Render\HTML\Attribute\ClassAttributes;
use CPath\Render\HTML\Attribute\IAttributes;
use CPath\Render\HTML\Element\AbstractHTMLElement;
use CPath\Render\HTML\Header\IHeaderWriter;
use CPath\Render\HTML\IRenderHTML;
use CPath\Request\IRequest;
use Site\Traits\Collision\CollisionAttributes;
use Site\Traits\Draggable\DraggableAttributes;
use Site\Traits\Physics\PhysicsAttributes;

class WarpElement extends AbstractHTMLElement
{
    const ELEMENT_TYPE = 'warp';
    const ITEM_CLASS = 'warp-item';

    /**
     * @param bool $draggable
     * @param null $targetID
     * @param String|null $classList a list of class elements
     * @param null|String|Array|IAttributes $_options [varargs] attribute html as string, array, or IAttributes instance
     */
    public function __construct($targetID=null, $draggable=true, $classList=null, $_options=null) {
        parent::__construct(self::ELEMENT_TYPE);

        is_scalar($targetID) ? $this->setTarget($targetID) : $this->addVarArg($targetID);
        is_scalar($draggable) ? null : $this->addVarArg($draggable);
        $draggable === false ?: $this->addAttributes(new DraggableAttributes());
        is_scalar($classList)   ? $this->addClass($classList) : $this->addVarArg($classList);

        for($i=3; $i<func_num_args(); $i++) {
            $arg = func_get_arg($i);
            $this->addVarArg($arg);
        }
        $this->addClass(CollisionAttributes::TYPE_CIRCLE);
        $this->addClass(PhysicsAttributes::ITEM_CLASS);
    }

    public function setTarget($targetID) {
        $this->setAttribute('data-target', $targetID);
    }

    function writeHeaders(IRequest $Request, IHeaderWriter $Head) {
        parent::writeHeaders($Request, $Head);
        $Head->writeScript(__DIR__ . '/assets/warp.js');
        $Head->writeStyleSheet(__DIR__ . '/assets/warp.css');
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

