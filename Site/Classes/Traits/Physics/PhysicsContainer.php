<?php
/**
 * Created by PhpStorm.
 * User: ari
 * Date: 3/15/2015
 * Time: 2:35 PM
 */
namespace Site\Classes\Traits\Physics;

use CPath\Render\HTML\Element\HTMLElement;
use Site\Classes\Traits\Draggable\DraggableAttributes;
use Site\Classes\Traits\Physics\PhysicsAttributes;

class PhysicsContainer extends HTMLElement
{

    public function __construct($classList = null, $ax=null, $ay=null, $_content = null) {
        parent::__construct('div');

        $PhysAttr = new PhysicsAttributes();
        $this->addAttributes($PhysAttr);

//        $this->addClass(DraggableAttributes::CLASS_DROP_CONTAINER);

        is_scalar($classList) ? $this->addClass($classList) : $this->addVarArg($classList);
        is_scalar($ax) ? $PhysAttr->setAX($ax) : $this->addVarArg($ax);
        is_scalar($ay) ? $PhysAttr->setAY($ay) : $this->addVarArg($ay);

        for ($i = 3; $i < func_num_args(); $i++)
            $this->addVarArg(func_get_arg($i));
    }

}