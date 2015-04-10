<?php
/**
 * Created by PhpStorm.
 * User: ari
 * Date: 3/14/2015
 * Time: 10:14 PM
 */
namespace Site\Traits\Physics;

use CPath\Render\HTML\Attribute\Attributes;
use CPath\Render\HTML\Header\IHeaderWriter;
use CPath\Render\HTML\Header\IHTMLSupportHeaders;
use CPath\Request\IRequest;

class PhysicsAttributes extends Attributes implements IHTMLSupportHeaders
{
//    const CONTAINER_CLASS = 'physics';
    const ITEM_CLASS = 'physics';

    public function __construct($x=null, $y=null, $vx=null, $vy=null, $ax=null, $ay=null) {
        parent::__construct();
        $this->addClass(self::ITEM_CLASS);
        $x === null ?: $this->setX($x);
        $y === null ?: $this->setY($y);
        $vx === null ?: $this->setVX($vx);
        $vy === null ?: $this->setVY($vy);
        $ax === null ?: $this->setAX($ax);
        $ay === null ?: $this->setAY($ay);
    }

    function setX($x) { return $this->setAttribute('data-x', $x); }
    function setY($y) { return $this->setAttribute('data-y', $y); }

    function setVX($vx) { return $this->setAttribute('data-vx', $vx); }
    function setVY($vy) { return $this->setAttribute('data-vy', $vy); }

    function setAX($ax) { return $this->setAttribute('data-ax', $ax); }
    function setAY($ay) { return $this->setAttribute('data-ay', $ay); }

    /**
     * Write all support headers used by this renderer
     * @param IRequest $Request
     * @param IHeaderWriter $Head the writer inst to use
     * @return void
     */
    function writeHeaders(IRequest $Request, IHeaderWriter $Head) {
        $Head->writeScript(__DIR__ . '/assets/physics.js');
        $Head->writeStyleSheet(__DIR__ . '/assets/physics.css');
    }
}

