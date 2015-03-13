<?php
/**
 * Created by PhpStorm.
 * User: ari
 * Date: 1/27/2015
 * Time: 1:56 PM
 */
namespace Site\Games\Pinball;

use CPath\Render\Helpers\RenderIndents as RI;
use CPath\Build\IBuildable;
use CPath\Build\IBuildRequest;
use CPath\Render\HTML\Attribute\Attributes;
use CPath\Render\HTML\Element\Form\HTMLForm;
use CPath\Render\HTML\Element\HTMLElement;
use CPath\Render\HTML\Header\HTMLHeaderScript;
use CPath\Render\HTML\Header\HTMLHeaderStyleSheet;
use CPath\Render\HTML\Header\HTMLMetaTag;
use CPath\Request\Executable\IExecutable;
use CPath\Request\IRequest;
use CPath\Response\IResponse;
use CPath\Route\IRoutable;
use CPath\Route\RouteBuilder;
use Site\SiteMap;

class OOPBall implements IExecutable, IBuildable, IRoutable
{
	const TITLE = 'OOPBall';

    const FORM_METHOD = 'POST';
    const FORM_PATH = '/oopball';
	const FORM_NAME = __CLASS__;
    const DEFAULT_GRAVITY = 1;
    private $gridCountX;
    private $gridCountY;

    public function __construct($gridCountX = 16, $gridCountY = 16) {

        $this->gridCountX = $gridCountX;
        $this->gridCountY = $gridCountY;
    }

	/**
	 * Execute a command and return a response. Does not render
	 * @param IRequest $Request
	 * @return IResponse the execution response
	 */
	function execute(IRequest $Request) {

		$Form = new HTMLForm(self::FORM_METHOD, self::FORM_PATH, self::FORM_NAME,
			new HTMLMetaTag(HTMLMetaTag::META_TITLE, self::TITLE),
            new HTMLHeaderScript(dirname(__DIR__) . '\assets\domwarp.js'),
            new HTMLHeaderStyleSheet(dirname(__DIR__) . '\assets\domwarp.css'),
            new HTMLHeaderScript(dirname(__DIR__) . '\assets\domdrag.js'),
            new HTMLHeaderStyleSheet(dirname(__DIR__) . '\assets\domdrag.css'),
            new HTMLHeaderScript(dirname(__DIR__) . '\assets\domphys.js'),
            new HTMLHeaderStyleSheet(dirname(__DIR__) . '\assets\domphys.css'),
            new HTMLHeaderScript(__DIR__ . '\assets\oopball.js'),
			new HTMLHeaderStyleSheet(__DIR__ . '\assets\oopball.css'),

			new HTMLElement('fieldset', 'legend-oopball-container inline',
				new HTMLElement('legend', 'legend-oopball-container', self::TITLE),

                new HTMLElement('fieldset', 'fieldset-input physbox',
                    new HTMLElement('legend', 'legend-object-input fixed', "Input")
                ),

                $FieldSetProgram = new HTMLElement('fieldset', 'fieldset-program physbox',
                    new Attributes('data-ax', 0.5),
                    new Attributes('data-ay', 0.5),
                    new HTMLElement('legend', 'legend-program fixed', "Program"),

                    new HTMLElement('div', 'marble warp physitem', new Attributes('draggable', 'true', 'data-collision', 'circle')),
                    new HTMLElement('div', 'marble physitem', new Attributes('draggable', 'true', 'data-collision', 'circle')),
                    new HTMLElement('div', 'marble physitem', new Attributes('draggable', 'true', 'data-collision', 'circle')),
                    new HTMLElement('div', 'marble physitem', new Attributes('draggable', 'true', 'data-collision', 'circle')),
                    new HTMLElement('div', 'marble physitem', new Attributes('draggable', 'true', 'data-collision', 'circle')),
                    new HTMLElement('div', 'marble physitem', new Attributes('draggable', 'true', 'data-collision', 'circle')),
                    new HTMLElement('div', 'marble', new Attributes('draggable', 'true', 'data-collision', 'circle')),
                    new HTMLElement('div', 'marble', new Attributes('draggable', 'true', 'data-collision', 'circle')),

                    new HTMLElement('fieldset', 'fieldset-obstacle',
                        new HTMLElement('legend', 'legend-obstacle', "Obstacle")
                    )
                ),

                new HTMLElement('fieldset', 'fieldset-output physbox',
                    new Attributes('data-ay', 1),
                    new HTMLElement('legend', 'legend-output fixed', "Output"),
                    new HTMLElement('div', 'marble', new Attributes('draggable', 'true', 'data-collision', 'circle', 'data-ax', 4, 'data-ax', 1))
                ),

                new HTMLElement('fieldset', 'fieldset-result physbox',
                    new HTMLElement('div', 'marble warp physitem', new Attributes('draggable', 'true', 'data-collision', 'circle')),
                    new Attributes('data-ax', -1),
                    new HTMLElement('legend', 'legend-result fixed', "Result")
                )
			)
        );


//        $FieldSetProgram->addAll(function(IRequest $Request) {
//            $randClasses = array('up', 'down', 'left', 'right', 'up left', 'up right', 'down left', null, null, null);
//
//            echo RI::ni(), '<div class="tile-grid">';
//            for($x=0; $x<$this->gridCountX; $x++) {
//                echo '<div class="tile-row">';
//                for($y=0; $y<$this->gridCountX; $y++) {
//                    $class = $randClasses[$x % sizeof($randClasses)];
//                    echo "<div class='tile {$class}'></div>";
//                }
//                echo '</div>';
//            }
//            echo RI::ni(), '</div>';
//        });

		return $Form;
	}

	// Static

	/**
	 * Route the request to this class object and return the object
	 * @param IRequest $Request the IRequest inst for this render
	 * @param array|null $Previous all previous response object that were passed from a handler, if any
	 * @param null|mixed $_arg [varargs] passed by route map
	 * @return void|bool|Object returns a response object
	 * If nothing is returned (or bool[true]), it is assumed that rendering has occurred and the request ends
	 * If false is returned, this static handler will be called again if another handler returns an object
	 * If an object is returned, it is passed along to the next handler
	 */
	static function routeRequestStatic(IRequest $Request, Array &$Previous = array(), $_arg = null) {
		return new static();
	}

	/**
	 * Handle this request and render any content
	 * @param IBuildRequest $Request the build request inst for this build session
	 * @return void
	 * @build --disable 0
	 * Note: Use doctag 'build' with '--disable 1' to have this IBuildable class skipped during a build
	 */
	static function handleBuildStatic(IBuildRequest $Request) {
		$RouteBuilder = new RouteBuilder($Request, new SiteMap());
		$RouteBuilder->writeRoute('ANY ' . self::FORM_PATH, __CLASS__, IRequest::NAVIGATION_ROUTE, "OOPBall");
	}
}